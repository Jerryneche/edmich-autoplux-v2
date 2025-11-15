// app/track/[id]/ServiceBookingClient.tsx
"use client";

import { useState, useEffect } from "react";
import {
  WrenchScrewdriverIcon,
  TruckIcon,
  PhoneIcon,
  MapPinIcon,
  StarIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface ServiceBookingClientProps {
  orderId: string;
  trackingId: string;
  shippingAddress: any;
}

interface Mechanic {
  id: string;
  businessName: string;
  location: string;
  phone: string;
  specialization: string[];
  hourlyRate: number;
  rating: number;
  verified: boolean;
}

interface LogisticsProvider {
  id: string;
  companyName: string;
  city: string;
  state: string;
  phone: string;
  vehicleTypes: string[];
  rating: number;
  verified: boolean;
}

export default function ServiceBookingClient({
  orderId,
  trackingId,
  shippingAddress,
}: ServiceBookingClientProps) {
  const [activeTab, setActiveTab] = useState<"mechanic" | "logistics">(
    "mechanic"
  );
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [logistics, setLogistics] = useState<LogisticsProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal) {
      fetchServices();
    }
  }, [showModal, activeTab]);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "mechanic") {
        const response = await fetch("/api/mechanic");
        if (response.ok) {
          const data = await response.json();
          setMechanics(data);
        }
      } else {
        const response = await fetch("/api/logistics");
        if (response.ok) {
          const data = await response.json();
          setLogistics(data);
        }
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load service providers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookMechanic = (mechanicId: string, mechanicName: string) => {
    toast.success(`Booking request sent to ${mechanicName}!`);
    // TODO: Implement actual booking API call
    setShowModal(false);
  };

  const handleBookLogistics = (providerId: string, providerName: string) => {
    toast.success(`Delivery request sent to ${providerName}!`);
    // TODO: Implement actual booking API call
    setShowModal(false);
  };

  return (
    <>
      {/* Book Services Button */}
      <div className="bg-white rounded-3xl border-2 border-neutral-200 p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
          Need Additional Services?
        </h2>
        <p className="text-neutral-600 mb-6">
          Book a mechanic for installation or logistics for delivery
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          Book Services
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b-2 border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-neutral-900">
                  Book Services for Order {trackingId}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-neutral-600" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab("mechanic")}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === "mechanic"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  <WrenchScrewdriverIcon className="h-5 w-5" />
                  Mechanics
                </button>
                <button
                  onClick={() => setActiveTab("logistics")}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === "logistics"
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  <TruckIcon className="h-5 w-5" />
                  Logistics
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-neutral-600">
                    Loading service providers...
                  </p>
                </div>
              ) : activeTab === "mechanic" ? (
                <div className="space-y-4">
                  {mechanics.length > 0 ? (
                    mechanics.map((mechanic) => (
                      <div
                        key={mechanic.id}
                        className="p-6 bg-neutral-50 rounded-2xl border-2 border-neutral-200 hover:border-purple-300 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-neutral-900">
                                {mechanic.businessName}
                              </h3>
                              {mechanic.verified && (
                                <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                              )}
                            </div>
                            <p className="text-sm text-neutral-600 flex items-center gap-2 mb-2">
                              <MapPinIcon className="h-4 w-4" />
                              {mechanic.location}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {mechanic.specialization
                                .slice(0, 3)
                                .map((spec) => (
                                  <span
                                    key={spec}
                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                                  >
                                    {spec}
                                  </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold">
                                  {mechanic.rating.toFixed(1)}
                                </span>
                              </span>
                              <span className="text-neutral-600">
                                ₦{mechanic.hourlyRate.toLocaleString()}/hour
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <a
                            href={`tel:${mechanic.phone}`}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-300 transition-colors"
                          >
                            <PhoneIcon className="h-5 w-5" />
                            Call
                          </a>
                          <button
                            onClick={() =>
                              handleBookMechanic(
                                mechanic.id,
                                mechanic.businessName
                              )
                            }
                            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <WrenchScrewdriverIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                      <p className="text-neutral-600">
                        No mechanics available in your area
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {logistics.length > 0 ? (
                    logistics.map((provider) => (
                      <div
                        key={provider.id}
                        className="p-6 bg-neutral-50 rounded-2xl border-2 border-neutral-200 hover:border-green-300 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-neutral-900">
                                {provider.companyName}
                              </h3>
                              {provider.verified && (
                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <p className="text-sm text-neutral-600 flex items-center gap-2 mb-2">
                              <MapPinIcon className="h-4 w-4" />
                              {provider.city}, {provider.state}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {provider.vehicleTypes.slice(0, 3).map((type) => (
                                <span
                                  key={type}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold">
                                {provider.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <a
                            href={`tel:${provider.phone}`}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-300 transition-colors"
                          >
                            <PhoneIcon className="h-5 w-5" />
                            Call
                          </a>
                          <button
                            onClick={() =>
                              handleBookLogistics(
                                provider.id,
                                provider.companyName
                              )
                            }
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                          >
                            Book Delivery
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <TruckIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                      <p className="text-neutral-600">
                        No logistics providers available
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
