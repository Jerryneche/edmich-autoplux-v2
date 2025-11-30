// app/logistics/find/page.tsx - UNIFIED FOR LOGISTICS/DRIVER/VEHICLE
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  TruckIcon,
  MapPinIcon,
  StarIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

interface LogisticsProvider {
  id: string;
  companyName: string;
  city: string;
  state: string;
  vehicleType: string;
  vehicleTypes: string[];
  vehicleNumber: string;
  coverageAreas: string[];
  verified: boolean;
  isAvailable: boolean;
  rating: number;
  completedDeliveries: number;
  user: {
    name: string | null;
    email: string | null;
  };
}

export default function FindLogisticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // This page handles: /logistics/find, /driver/find, /vehicle/find
  const pageType = searchParams.get("type") || "logistics";

  const [providers, setProviders] = useState<LogisticsProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [searchState, setSearchState] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, [searchCity, searchState, verifiedOnly, availableOnly]);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchCity) params.append("city", searchCity);
      if (searchState) params.append("state", searchState);
      if (verifiedOnly) params.append("verified", "true");
      if (availableOnly) params.append("available", "true");

      const response = await fetch(`/api/logistics?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProviders(data);
      } else {
        toast.error("Failed to load providers");
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error);
      toast.error("Failed to load providers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = (providerId: string) => {
    if (status === "unauthenticated") {
      toast.error("Please login to book delivery");
      router.push("/login");
      return;
    }
    router.push(`/logistics/book/${providerId}`);
  };

  const getPageTitle = () => {
    switch (pageType) {
      case "driver":
        return "Find Professional Drivers";
      case "vehicle":
        return "Find Delivery Vehicles";
      default:
        return "Find Logistics Providers";
    }
  };

  const getPageDescription = () => {
    switch (pageType) {
      case "driver":
        return "Book experienced drivers for your deliveries";
      case "vehicle":
        return "Rent vehicles for your transportation needs";
      default:
        return "Reliable delivery services across Nigeria";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-16 max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {getPageTitle().split(" ")[0]}{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {getPageTitle().split(" ").slice(1).join(" ")}
            </span>
          </h1>
          <p className="text-lg text-neutral-600">{getPageDescription()}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 mb-8 shadow-sm">
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="City (e.g., Lagos)"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-green-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="State (e.g., Lagos)"
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
              className="px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-green-500 focus:outline-none"
            />
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-5 w-5 rounded border-neutral-300 text-green-600 focus:ring-green-500"
              />
              <span className="font-medium text-neutral-700">
                Verified Only
              </span>
            </label>
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="h-5 w-5 rounded border-neutral-300 text-green-600 focus:ring-green-500"
              />
              <span className="font-medium text-neutral-700">
                Available Now
              </span>
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border-2 border-neutral-200 p-6 animate-pulse"
              >
                <div className="h-6 bg-neutral-200 rounded mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-12 text-center">
            <TruckIcon className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
            <p className="text-2xl font-bold text-neutral-900 mb-2">
              No providers found
            </p>
            <p className="text-neutral-600 mb-6">
              Try adjusting your search filters
            </p>
            <button
              onClick={() => {
                setSearchCity("");
                setSearchState("");
                setVerifiedOnly(false);
                setAvailableOnly(false);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-2xl border-2 border-neutral-200 hover:border-green-300 hover:shadow-xl transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-neutral-900 mb-1">
                      {provider.companyName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <MapPinIcon className="h-4 w-4" />
                      <span>
                        {provider.city}, {provider.state}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {provider.verified && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        ✓ Verified
                      </span>
                    )}
                    {provider.isAvailable && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        Available
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-neutral-900">
                      {provider.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-neutral-600">
                      ({provider.completedDeliveries} deliveries)
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-1">
                      Vehicle Type
                    </p>
                    <p className="text-sm text-neutral-600">
                      {provider.vehicleType}
                    </p>
                    {provider.vehicleNumber && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Plate: {provider.vehicleNumber}
                      </p>
                    )}
                  </div>

                  {provider.vehicleTypes.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-neutral-700 mb-1">
                        Available Vehicles
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {provider.vehicleTypes.map((type, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {provider.coverageAreas.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-neutral-700 mb-1">
                        Coverage Areas
                      </p>
                      <p className="text-xs text-neutral-600">
                        {provider.coverageAreas.slice(0, 3).join(", ")}
                        {provider.coverageAreas.length > 3 &&
                          ` +${provider.coverageAreas.length - 3} more`}
                      </p>
                    </div>
                  )}
                </div>

                {provider.isAvailable ? (
                  <button
                    onClick={() => handleBookNow(provider.id)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Book Now
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full px-4 py-3 bg-neutral-200 text-neutral-500 rounded-xl font-semibold cursor-not-allowed"
                  >
                    Currently Unavailable
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
