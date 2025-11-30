// app/mechanics/find/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  MapPinIcon,
  StarIcon,
  WrenchScrewdriverIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

interface Mechanic {
  id: string;
  businessName: string;
  city: string;
  state: string;
  specialty: string;
  specialization: string[];
  experience: number;
  hourlyRate: number;
  rating: number;
  completedJobs: number;
  verified: boolean;
  isAvailable: boolean;
  latitude: number | null;
  longitude: number | null;
  user: {
    name: string | null;
    email: string | null;
  };
}

export default function FindMechanicsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [searchState, setSearchState] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    fetchMechanics();
  }, [searchCity, searchState, verifiedOnly]);

  const fetchMechanics = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchCity) params.append("city", searchCity);
      if (searchState) params.append("state", searchState);
      if (verifiedOnly) params.append("verified", "true");

      // FIXED LINE — was calling /api/mechanics (doesn’t exist)
      const response = await fetch(
        `/api/mechanics/available?${params.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setMechanics(data.mechanics || []); // ← now matches your API response
      } else {
        toast.error("Failed to load mechanics");
      }
    } catch (error) {
      console.error("Failed to fetch mechanics:", error);
      toast.error("Failed to load mechanics");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = (mechanicId: string) => {
    if (status === "unauthenticated") {
      toast.error("Please login to book a mechanic");
      router.push("/login");
      return;
    }
    router.push(`/mechanics/book/${mechanicId}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-16 max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Find{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Verified Mechanics
            </span>
          </h1>
          <p className="text-lg text-neutral-600">
            Book professional mechanics near you
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 mb-8 shadow-sm">
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="City (e.g., Lagos)"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="State (e.g., Lagos)"
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
              className="px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-5 w-5 rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="font-medium text-neutral-700">
                Verified Only
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
        ) : mechanics.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-12 text-center">
            <WrenchScrewdriverIcon className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
            <p className="text-2xl font-bold text-neutral-900 mb-2">
              No mechanics found
            </p>
            <p className="text-neutral-600 mb-6">
              Try adjusting your search filters
            </p>
            <button
              onClick={() => {
                setSearchCity("");
                setSearchState("");
                setVerifiedOnly(false);
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mechanics.map((mechanic) => (
              <div
                key={mechanic.id}
                className="bg-white rounded-2xl border-2 border-neutral-200 hover:border-purple-300 hover:shadow-xl transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-neutral-900 mb-1">
                      {mechanic.businessName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <MapPinIcon className="h-4 w-4" />
                      <span>
                        {mechanic.city}, {mechanic.state}
                      </span>
                    </div>
                  </div>
                  {mechanic.verified && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-neutral-900">
                      {mechanic.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-neutral-600">
                      ({mechanic.completedJobs} jobs)
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-1">
                      Specialty
                    </p>
                    <p className="text-sm text-neutral-600">
                      {mechanic.specialty}
                    </p>
                  </div>

                  {mechanic.specialization.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-neutral-700 mb-1">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {mechanic.specialization.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {mechanic.specialization.length > 3 && (
                          <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full">
                            +{mechanic.specialization.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                    <div>
                      <p className="text-xs text-neutral-600">Experience</p>
                      <p className="font-bold text-neutral-900">
                        {mechanic.experience} years
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-600">Rate</p>
                      <p className="font-bold text-neutral-900">
                        ₦{mechanic.hourlyRate.toLocaleString()}/hr
                      </p>
                    </div>
                  </div>
                </div>

                {mechanic.isAvailable ? (
                  <button
                    onClick={() => handleBookNow(mechanic.id)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
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
