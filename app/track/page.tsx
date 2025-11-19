"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  CubeIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

interface TrackingResult {
  type: "ORDER" | "LOGISTICS";
  trackingId: string;
  status: string;
  createdAt: string;
  estimatedDelivery?: string;
  currentLocation?: string;
  recipient?: {
    name: string;
    city: string;
  };
  timeline: {
    status: string;
    timestamp: string;
    location?: string;
    completed: boolean;
  }[];
}

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingNumber.trim()) {
      toast.error("Please enter a tracking number");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `/api/track?id=${encodeURIComponent(trackingNumber.trim())}`
      );

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Tracking number not found");
        toast.error("Tracking number not found");
      }
    } catch (error) {
      console.error("Tracking error:", error);
      setError("Failed to track. Please try again.");
      toast.error("Failed to track shipment");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300",
      PROCESSING: "bg-purple-100 text-purple-800 border-purple-300",
      SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-300",
      IN_TRANSIT: "bg-indigo-100 text-indigo-800 border-indigo-300",
      DELIVERED: "bg-green-100 text-green-800 border-green-300",
      CANCELLED: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <>
      <Header />
      <Toaster position="top-center" />

      <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12 pt-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-2xl">
              <TruckIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-4">
              Track Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Shipment
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enter your tracking number to get real-time updates on your order
              or delivery
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="mb-12">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number (e.g., EDM1234567890 or LOG1234567890)"
                    className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Tracking...
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="h-5 w-5" />
                      Track
                    </>
                  )}
                </button>
              </div>

              {/* Example tracking numbers */}
              <div className="mt-4 text-sm text-gray-500">
                <span className="font-semibold">Example:</span>{" "}
                EDM1731936000ABC123 (Order) or LOG1731936000DEF456 (Delivery)
              </div>
            </div>
          </form>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-red-900 mb-2">
                Not Found
              </h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Tracking Number
                    </p>
                    <p className="text-2xl font-bold text-gray-900 font-mono">
                      {result.trackingId}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-xl font-bold border-2 ${getStatusColor(
                      result.status
                    )}`}
                  >
                    {result.status.replace("_", " ")}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Type</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {result.type === "ORDER"
                        ? "Product Order"
                        : "Logistics Delivery"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(new Date(result.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  {result.estimatedDelivery && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Est. Delivery
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {format(
                          new Date(result.estimatedDelivery),
                          "MMM d, yyyy"
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {result.currentLocation && (
                  <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center gap-3">
                    <MapPinIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Current Location
                      </p>
                      <p className="text-lg font-bold text-blue-900">
                        {result.currentLocation}
                      </p>
                    </div>
                  </div>
                )}

                {result.recipient && (
                  <div className="mt-6 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Delivery Details
                    </p>
                    <p className="text-gray-900">
                      <span className="font-semibold">
                        {result.recipient.name}
                      </span>{" "}
                      • {result.recipient.city}
                    </p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CubeIcon className="h-6 w-6 text-blue-600" />
                  Tracking Timeline
                </h3>

                <div className="space-y-6">
                  {result.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            event.completed
                              ? "bg-green-600"
                              : index === 0
                              ? "bg-blue-600 animate-pulse"
                              : "bg-gray-300"
                          }`}
                        >
                          {event.completed ? (
                            <CheckCircleIcon className="h-6 w-6 text-white" />
                          ) : index === 0 ? (
                            <ClockIcon className="h-6 w-6 text-white" />
                          ) : (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                        {index < result.timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-16 ${
                              event.completed ? "bg-green-600" : "bg-gray-300"
                            }`}
                          ></div>
                        )}
                      </div>

                      {/* Event details */}
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-2">
                          <h4
                            className={`font-bold text-lg ${
                              event.completed
                                ? "text-gray-900"
                                : "text-gray-600"
                            }`}
                          >
                            {event.status.replace("_", " ")}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {format(new Date(event.timestamp), "MMM d, h:mm a")}
                          </span>
                        </div>
                        {event.location && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPinIcon className="h-4 w-4" />
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setTrackingNumber("");
                    setResult(null);
                    setError("");
                  }}
                  className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-bold hover:border-gray-300 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  Track Another
                </button>

                {/* FIXED: Proper <a> tag with correct syntax */}
                <a
                  href={`https://wa.me/2349025579441?text=I%20need%20help%20with%20tracking%20number%3A%20${result.trackingId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Contact Support
                </a>
              </div>
            </div>
          )}

          {/* Info Cards */}
          {!result && !error && (
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TruckIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Real-Time Updates
                </h3>
                <p className="text-sm text-gray-600">
                  Track your shipment every step of the way
                </p>
              </div>

              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Verified Updates
                </h3>
                <p className="text-sm text-gray-600">
                  All tracking info is verified and accurate
                </p>
              </div>

              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPinIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Location History
                </h3>
                <p className="text-sm text-gray-600">
                  See complete journey from start to delivery
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
