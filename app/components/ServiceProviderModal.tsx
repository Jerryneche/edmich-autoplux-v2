"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  XMarkIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  MapPinIcon,
  StarIcon,
  CheckBadgeIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

interface Provider {
  id: string;
  businessName?: string;
  companyName?: string;
  city?: string;
  state?: string;
  rating?: number;
  hourlyRate?: number;
  verified?: boolean;
  specialization?: string[] | null;
  vehicleTypes?: string[] | null;
}

interface ServiceProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  trackingId: string;
}

export default function ServiceProviderModal({
  isOpen,
  onClose,
  orderId,
  trackingId,
}: ServiceProviderModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"mechanics" | "logistics">(
    "mechanics"
  );
  const [mechanics, setMechanics] = useState<Provider[]>([]);
  const [logistics, setLogistics] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchProviders = async () => {
      setLoading(true);
      try {
        const [mRes, lRes] = await Promise.all([
          fetch("/api/mechanic?verified=true&limit=10"),
          fetch("/api/logistics?verified=true&available=true&limit=10"),
        ]);

        const mData = mRes.ok ? await mRes.json() : [];
        const lData = lRes.ok ? await lRes.json() : [];

        setMechanics(mData);
        setLogistics(lData);
      } catch (err) {
        console.error("Failed to load providers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [isOpen]);

  const handleBookNow = (
    providerId: string,
    type: "MECHANIC" | "LOGISTICS"
  ) => {
    sessionStorage.setItem(
      "bookingContext",
      JSON.stringify({
        orderId,
        trackingId,
        providerId,
        returnUrl: `/track?id=${trackingId}`,
      })
    );

    onClose();
    router.push(
      type === "MECHANIC"
        ? `/booking/mechanic/${providerId}`
        : `/booking/logistics/${providerId}`
    );
  };

  if (!isOpen) return null;

  const providers = activeTab === "mechanics" ? mechanics : logistics;
  const isMechanics = activeTab === "mechanics";

  // Safe access to optional arrays
  const tags = isMechanics
    ? providers.flatMap((p) => p.specialization ?? []).filter(Boolean)
    : providers.flatMap((p) => p.vehicleTypes ?? []).filter(Boolean);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Book Trusted Service</h2>
              <p className="text-white/90 mt-1">Order ID: {trackingId}</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all"
            >
              <XMarkIcon className="h-7 w-7" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50">
          <button
            onClick={() => setActiveTab("mechanics")}
            className={`flex-1 py-5 font-bold text-lg transition-all ${
              isMechanics
                ? "text-purple-600 bg-white shadow-md border-t-4 border-purple-600"
                : "text-gray-600 hover:text-purple-600"
            }`}
          >
            Mechanics ({mechanics.length})
          </button>
          <button
            onClick={() => setActiveTab("logistics")}
            className={`flex-1 py-5 font-bold text-lg transition-all ${
              !isMechanics
                ? "text-green-600 bg-white shadow-md border-t-4 border-green-600"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            Logistics ({logistics.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[58vh]">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-purple-600 border-t-transparent"></div>
              <p className="mt-6 text-lg text-gray-600">
                Finding trusted providers...
              </p>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-100 rounded-full w-28 h-28 mx-auto flex items-center justify-center mb-6">
                {isMechanics ? (
                  <WrenchScrewdriverIcon className="h-16 w-16 text-gray-400" />
                ) : (
                  <TruckIcon className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No {isMechanics ? "Mechanics" : "Logistics Providers"} Available
              </h3>
              <p className="text-gray-500">More partners joining soon!</p>
            </div>
          ) : (
            <div className="grid gap-5">
              {providers.map((provider) => {
                const displayName =
                  provider.businessName ||
                  provider.companyName ||
                  "Trusted Provider";
                const location = provider.city
                  ? `${provider.city}${
                      provider.state ? `, ${provider.state}` : ""
                    }`
                  : "Nigeria";

                const items = isMechanics
                  ? provider.specialization ?? []
                  : provider.vehicleTypes ?? [];

                return (
                  <div
                    key={provider.id}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-7 border-2 border-transparent hover:border-purple-400 transition-all hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {displayName}
                          </h3>
                          {provider.verified && (
                            <CheckBadgeIcon
                              className="h-7 w-7 text-blue-600"
                              title="Verified Partner"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 mt-2">
                          <MapPinIcon className="h-5 w-5 text-purple-600" />
                          <span className="font-medium">{location}</span>
                        </div>

                        {/* Safe rendering of tags */}
                        {items.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {items.slice(0, 4).map((item) => (
                              <span
                                key={item}
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                  isMechanics
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {item}
                              </span>
                            ))}
                            {items.length > 4 && (
                              <span className="text-sm text-gray-500 self-center">
                                +{items.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-6 mt-5 text-lg">
                          <div className="flex items-center gap-2">
                            <StarIcon className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold">
                              {(provider.rating || 4.8).toFixed(1)}
                            </span>
                          </div>
                          {provider.hourlyRate && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <ClockIcon className="h-5 w-5" />
                              <span>
                                ₦{provider.hourlyRate.toLocaleString()}/hr
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {provider.hourlyRate && (
                        <div className="text-right hidden md:block">
                          <p className="text-sm text-gray-500 uppercase tracking-wider">
                            Starting from
                          </p>
                          <p className="text-3xl font-black text-purple-600">
                            ₦{provider.hourlyRate.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        handleBookNow(
                          provider.id,
                          isMechanics ? "MECHANIC" : "LOGISTICS"
                        )
                      }
                      className={`mt-6 w-full py-5 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg ${
                        isMechanics
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      }`}
                    >
                      {isMechanics ? "Book Mechanic Now" : "Book Delivery Now"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
