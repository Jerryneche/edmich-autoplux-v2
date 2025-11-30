"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  WrenchScrewdriverIcon,
  MapPinIcon,
  StarIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function MechanicsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");

  useEffect(() => {
    fetchMechanics();
  }, [serviceFilter]);

  const fetchMechanics = async () => {
    try {
      // Get user location (mock for now)
      const lat = 6.5244;
      const lng = 3.3792;

      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        ...(serviceFilter !== "all" && { serviceType: serviceFilter }),
      });

      const response = await fetch(`/api/mechanics/available?${params}`);
      const data = await response.json();

      if (data.success) {
        setMechanics(data.mechanics);
      }
    } catch (error) {
      console.error("Error fetching mechanics:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMechanics = mechanics.filter((mechanic: any) =>
    mechanic.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const services = [
    "all",
    "Engine Repair",
    "Brake Service",
    "Oil Change",
    "Transmission",
    "Electrical",
    "AC Repair",
    "Body Work",
    "Tire Service",
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Find Certified Mechanics
            </h1>
            <p className="text-gray-600">
              Professional automotive services near you
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mechanics..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service === "all" ? "All Services" : service}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mechanics Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredMechanics.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <WrenchScrewdriverIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No mechanics found
              </h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMechanics.map((mechanic: any) => (
                <div
                  key={mechanic.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                  onClick={() => router.push(`/mechanics/${mechanic.userId}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={mechanic.user.image || "/default-avatar.png"}
                        alt={mechanic.user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {mechanic.user.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-2">
                          <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">
                            {mechanic.averageRating?.toFixed(1) || "New"}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({mechanic.reviewCount || 0})
                          </span>
                        </div>
                        {mechanic.verified && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{mechanic.distance.toFixed(1)} km away</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">
                          {mechanic.experience}
                        </span>{" "}
                        years experience
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Specializations:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {mechanic.specializations
                          .slice(0, 3)
                          .map((spec: string) => (
                            <span
                              key={spec}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                            >
                              {spec}
                            </span>
                          ))}
                        {mechanic.specializations.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{mechanic.specializations.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Starting from</p>
                        <p className="text-xl font-bold text-blue-600">
                          ₦{mechanic.basePrice.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/mechanics/book?mechanicId=${mechanic.userId}`
                          );
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
