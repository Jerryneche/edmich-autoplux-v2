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
  LockClosedIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface ServiceBookingClientProps {
  orderId: string;
  trackingId: string;
  shippingAddress: any;
}

interface ServiceLink {
  id: string;
  mechanicBooking?: {
    id: string;
    serviceType: string;
    date: string;
    time: string;
    status: string;
    mechanic: {
      businessName: string;
      phone: string;
      city: string;
      state?: string;
    };
  };
  logisticsBooking?: {
    id: string;
    packageType: string;
    deliverySpeed: string;
    status: string;
    driver: {
      companyName: string;
      phone: string;
      city: string;
      state?: string;
    };
  };
}

interface Provider {
  id: string;
  businessName?: string;
  companyName?: string;
  city: string;
  state?: string;
  phone: string;
  rating?: number;
  verified?: boolean;
  specialization?: string[];
  vehicleTypes?: string[];
  hourlyRate?: number;
}

export default function ServiceBookingClient({
  orderId,
  trackingId,
  shippingAddress,
}: ServiceBookingClientProps) {
  const [serviceLinks, setServiceLinks] = useState<ServiceLink[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"mechanic" | "logistics">(
    "mechanic"
  );
  const [editingType, setEditingType] = useState<
    "mechanic" | "logistics" | null
  >(null);

  useEffect(() => {
    fetchServiceLinks();
  }, [orderId]);

  const fetchServiceLinks = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/service-links`);
      if (res.ok) setServiceLinks(await res.json());
    } catch (err) {
      console.error("Failed to fetch service links:", err);
    }
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const endpoint =
        activeTab === "mechanic"
          ? "/api/mechanic?verified=true&limit=10"
          : "/api/logistics?verified=true&available=true&limit=10";

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setProviders(
          data.map((p: any) => ({
            id: p.id,
            businessName: p.businessName,
            companyName: p.companyName,
            city: p.city || "Lagos",
            state: p.state,
            phone: p.phone,
            rating: p.rating || 4.8,
            verified: p.verified,
            specialization: p.specialization || [],
            vehicleTypes: p.vehicleTypes || [],
            hourlyRate: p.hourlyRate,
          }))
        );
      }
    } catch (err) {
      toast.error("Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) fetchProviders();
  }, [showModal, activeTab]);

  const handleBook = (providerId: string) => {
    sessionStorage.setItem(
      "bookingContext",
      JSON.stringify({
        orderId,
        trackingId,
        providerId,
        returnUrl: `/track/${trackingId}`,
      })
    );
    window.location.href =
      activeTab === "mechanic"
        ? `/booking/mechanic/${providerId}`
        : `/booking/logistics/${providerId}`;
  };

  const handleUnlink = async (type: "mechanic" | "logistics") => {
    if (!confirm(`Remove this ${type} service?`)) return;
    try {
      const res = await fetch(
        `/api/orders/${orderId}/service-links?type=${type.toUpperCase()}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Service removed");
        fetchServiceLinks();
      } else toast.error("Failed to remove");
    } catch {
      toast.error("Network error");
    }
  };

  const openModal = (type: "mechanic" | "logistics" | null) => {
    setEditingType(type);
    setActiveTab(type || "mechanic");
    setShowModal(true);
  };

  const mechanicLink = serviceLinks.find((l) => l.mechanicBooking);
  const logisticsLink = serviceLinks.find((l) => l.logisticsBooking);

  return (
    <>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Mechanic Service */}
        {mechanicLink?.mechanicBooking ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-purple-300 p-10 shadow-2xl hover:shadow-purple-100 transition-all">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center shadow-lg">
                  <WrenchScrewdriverIcon className="h-12 w-12 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    Mechanic Booked
                    <LockClosedIcon className="h-8 w-8 text-green-600" />
                  </h3>
                  <p className="text-lg text-gray-600 mt-1">
                    Your installation is scheduled
                  </p>
                </div>
              </div>
              <button
                onClick={() => openModal("mechanic")}
                className="flex items-center gap-3 px-8 py-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-md"
              >
                <PencilIcon className="h-6 w-6" />
                Change Mechanic
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-10 mb-8">
              <div className="space-y-4">
                <p className="text-gray-600 font-semibold">Trusted Mechanic</p>
                <p className="text-2xl font-black">
                  {mechanicLink.mechanicBooking.mechanic.businessName}
                </p>
                <p className="text-lg text-gray-600 flex items-center gap-3">
                  <MapPinIcon className="h-6 w-6 text-purple-600" />
                  {mechanicLink.mechanicBooking.mechanic.city}
                  {mechanicLink.mechanicBooking.mechanic.state &&
                    `, ${mechanicLink.mechanicBooking.mechanic.state}`}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600 font-semibold">
                  Appointment Details
                </p>
                <p className="text-2xl font-black">
                  {mechanicLink.mechanicBooking.date} at{" "}
                  {mechanicLink.mechanicBooking.time}
                </p>
                <p className="text-lg text-purple-600 font-bold">
                  {mechanicLink.mechanicBooking.serviceType}
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <a
                href={`tel:${mechanicLink.mechanicBooking.mechanic.phone}`}
                className="flex-1 flex items-center justify-center gap-4 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <PhoneIcon className="h-8 w-8" />
                Call Mechanic
              </a>
              <button
                onClick={() => handleUnlink("mechanic")}
                className="px-10 py-5 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold text-xl transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl border-2 border-dashed border-purple-300 p-16 text-center shadow-xl">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg">
              <WrenchScrewdriverIcon className="h-20 w-20 text-purple-600" />
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-4">
              Need Professional Installation?
            </h3>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Connect with verified mechanics across Nigeria for expert
              installation, repairs, and maintenance
            </p>
            <button
              onClick={() => openModal("mechanic")}
              className="px-16 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-black rounded-3xl hover:shadow-2xl transition-all hover:scale-110 shadow-xl"
            >
              Book Trusted Mechanic
            </button>
          </div>
        )}

        {/* Logistics Service */}
        {logisticsLink?.logisticsBooking ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-300 p-10 shadow-2xl hover:shadow-green-100 transition-all">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center shadow-lg">
                  <TruckIcon className="h-12 w-12 text-green-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    Delivery Booked
                    <LockClosedIcon className="h-8 w-8 text-green-600" />
                  </h3>
                  <p className="text-lg text-gray-600 mt-1">
                    Your parts are on the way
                  </p>
                </div>
              </div>
              <button
                onClick={() => openModal("logistics")}
                className="flex items-center gap-3 px-8 py-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-md"
              >
                <PencilIcon className="h-6 w-6" />
                Change Provider
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-10 mb-8">
              <div className="space-y-4">
                <p className="text-gray-600 font-semibold">Logistics Partner</p>
                <p className="text-2xl font-black">
                  {logisticsLink.logisticsBooking.driver.companyName}
                </p>
                <p className="text-lg text-gray-600 flex items-center gap-3">
                  <MapPinIcon className="h-6 w-6 text-green-600" />
                  {logisticsLink.logisticsBooking.driver.city}
                  {logisticsLink.logisticsBooking.driver.state &&
                    `, ${logisticsLink.logisticsBooking.driver.state}`}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600 font-semibold">Delivery Details</p>
                <p className="text-2xl font-black">
                  {logisticsLink.logisticsBooking.packageType}
                </p>
                <p className="text-lg text-green-600 font-bold">
                  Speed: {logisticsLink.logisticsBooking.deliverySpeed}
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <a
                href={`tel:${logisticsLink.logisticsBooking.driver.phone}`}
                className="flex-1 flex items-center justify-center gap-4 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <PhoneIcon className="h-8 w-8" />
                Call Driver
              </a>
              <button
                onClick={() => handleUnlink("logistics")}
                className="px-10 py-5 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold text-xl transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl border-2 border-dashed border-green-300 p-16 text-center shadow-xl">
            <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg">
              <TruckIcon className="h-20 w-20 text-green-600" />
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-4">
              Need Fast Delivery?
            </h3>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Get your parts delivered safely and quickly by trusted logistics
              partners across Nigeria
            </p>
            <button
              onClick={() => openModal("logistics")}
              className="px-16 py-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-2xl font-black rounded-3xl hover:shadow-2xl transition-all hover:scale-110 shadow-xl"
            >
              Book Reliable Delivery
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-3xl">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-green-600 p-10 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-black">
                    {editingType
                      ? `Change ${
                          editingType === "mechanic" ? "Mechanic" : "Delivery"
                        }`
                      : "Connect with Trusted Partners"}
                  </h2>
                  <p className="text-xl opacity-90 mt-2">Order #{trackingId}</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingType(null);
                  }}
                  className="p-4 bg-white/20 hover:bg-white/30 rounded-2xl transition-all"
                >
                  <XMarkIcon className="h-10 w-10" />
                </button>
              </div>
            </div>

            {!editingType && (
              <div className="flex bg-gray-50">
                <button
                  onClick={() => setActiveTab("mechanic")}
                  disabled={!!mechanicLink}
                  className={`flex-1 py-8 font-black text-2xl transition-all ${
                    activeTab === "mechanic"
                      ? "bg-white text-purple-600 shadow-2xl border-t-8 border-purple-600"
                      : mechanicLink
                      ? "bg-gray-100 text-gray-400"
                      : "hover:bg-white"
                  }`}
                >
                  Mechanics{" "}
                  {mechanicLink && (
                    <LockClosedIcon className="inline-block ml-3 h-8 w-8" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("logistics")}
                  disabled={!!logisticsLink}
                  className={`flex-1 py-8 font-black text-2xl transition-all ${
                    activeTab === "logistics"
                      ? "bg-white text-green-600 shadow-2xl border-t-8 border-green-600"
                      : logisticsLink
                      ? "bg-gray-100 text-gray-400"
                      : "hover:bg-white"
                  }`}
                >
                  Logistics{" "}
                  {logisticsLink && (
                    <LockClosedIcon className="inline-block ml-3 h-8 w-8" />
                  )}
                </button>
              </div>
            )}

            <div className="p-10 overflow-y-auto max-h-[55vh]">
              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-20 w-20 border-8 border-purple-600 border-t-transparent"></div>
                  <p className="text-2xl text-gray-600 mt-8">
                    Finding the best providers...
                  </p>
                </div>
              ) : providers.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-3xl font-black text-gray-700">
                    No providers available right now
                  </p>
                  <p className="text-xl text-gray-500 mt-4">
                    More partners joining soon!
                  </p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {providers.map((p) => (
                    <div
                      key={p.id}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-10 border-4 border-transparent hover:border-purple-500 transition-all hover:shadow-2xl"
                    >
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h3 className="text-3xl font-black flex items-center gap-4">
                            {p.businessName || p.companyName}
                            {p.verified && (
                              <CheckCircleIcon className="h-10 w-10 text-blue-600" />
                            )}
                          </h3>
                          <p className="text-xl text-gray-600 flex items-center gap-3 mt-3">
                            <MapPinIcon className="h-8 w-8 text-purple-600" />
                            {p.city}
                            {p.state && `, ${p.state}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-3 justify-end mb-4">
                            <StarIcon className="h-10 w-10 text-yellow-500 fill-yellow-500" />
                            <span className="text-4xl font-black">
                              {(p.rating || 4.9).toFixed(1)}
                            </span>
                          </div>
                          {p.hourlyRate && (
                            <p className="text-3xl font-black text-purple-600">
                              ₦{p.hourlyRate.toLocaleString()}/hr
                            </p>
                          )}
                        </div>
                      </div>

                      {(
                        (activeTab === "mechanic"
                          ? p.specialization
                          : p.vehicleTypes) ?? []
                      ).length > 0 && (
                        <div className="flex flex-wrap gap-4 mb-10">
                          {(activeTab === "mechanic"
                            ? p.specialization
                            : p.vehicleTypes)!
                            .slice(0, 5)
                            .map((item) => (
                              <span
                                key={item}
                                className={`px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-110 ${
                                  activeTab === "mechanic"
                                    ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                              >
                                {item}
                              </span>
                            ))}
                        </div>
                      )}

                      <button
                        onClick={() => handleBook(p.id)}
                        className={`w-full py-8 rounded-3xl text-2xl font-black transition-all hover:scale-105 shadow-2xl ${
                          activeTab === "mechanic"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        }`}
                      >
                        {editingType
                          ? "Switch to This Partner"
                          : activeTab === "mechanic"
                          ? "Book This Mechanic"
                          : "Book This Delivery"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
