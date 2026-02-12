"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface TrackingData {
  id: string;
  status: string;
  driver: {
    id: string;
    name: string;
    image?: string;
    rating?: number;
    phone?: string;
  };
  events: Array<{
    id: string;
    status: string;
    timestamp: string;
  }>;
}

export default function TrackingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

  const fetchTracking = useCallback(async () => {
    try {
      const response = await fetch(`/api/tracking/live/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setTracking(data.data);
        updateMap(data.data);
      }
    } catch (error) {
      console.error("Error fetching tracking:", error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (session && orderId) {
      fetchTracking();
      // Poll for updates every 10 seconds
      const interval = setInterval(() => fetchTracking(), 10000);
      return () => clearInterval(interval);
    }
  }, [session, orderId, fetchTracking]);

  const updateMap = (trackingData: TrackingData) => {
    // In production, integrate Google Maps here
    // For now, we'll show coordinates
    console.log("Map update:", trackingData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-100";
      case "in_transit":
        return "text-blue-600 bg-blue-100";
      case "picked_up":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "in_transit":
        return "On the way";
      case "picked_up":
        return "Picked up";
      default:
        return "Pending";
    }
  };

  const timeline = [
    {
      status: "pending",
      label: "Order Placed",
      completed: true,
    },
    {
      status: "picked_up",
      label: "Picked Up",
      completed: tracking?.status !== "pending",
    },
    {
      status: "in_transit",
      label: "In Transit",
      completed:
        tracking?.status === "in_transit" || tracking?.status === "delivered",
    },
    {
      status: "delivered",
      label: "Delivered",
      completed: tracking?.status === "delivered",
    },
  ];

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : !tracking ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Order not found
              </h3>
              <p className="text-gray-600">
                Unable to find tracking information
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Live Tracking
                      </h2>
                      <p className="text-sm text-gray-600">
                        Order #{tracking.order.orderNumber}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        tracking.status
                      )}`}
                    >
                      {getStatusText(tracking.status)}
                    </span>
                  </div>

                  {/* Map Placeholder */}
                  <div
                    ref={mapRef}
                    className="h-96 bg-cover bg-center relative"
                  >
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-900/80">
                      <div className="text-center text-white">
                        <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
                        <p className="font-medium">
                          Last Location: {tracking.lastLocation || "Not yet updated"}
                        </p>
                        <p className="text-sm text-blue-200 mt-1">
                          Map integration: Add Google Maps API key
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ETA Info */}
                  {tracking.estimatedDeliveryDate && (
                    <div className="p-4 bg-blue-50 border-t border-blue-200">
                      <div className="flex items-center gap-2 text-blue-900">
                        <ClockIcon className="h-5 w-5" />
                        <span className="font-medium">
                          Estimated delivery:{" "}
                          {new Date(
                            tracking.estimatedDeliveryDate
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">
                    Delivery Timeline
                  </h3>

                  <div className="relative">
                    {timeline.map((step, index) => (
                      <div
                        key={step.status}
                        className="flex gap-4 mb-6 last:mb-0"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              step.completed
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {step.completed ? (
                              <CheckCircleIcon className="h-6 w-6" />
                            ) : (
                              <span className="text-sm font-bold">
                                {index + 1}
                              </span>
                            )}
                          </div>
                          {index < timeline.length - 1 && (
                            <div
                              className={`w-0.5 h-12 ${
                                step.completed ? "bg-green-600" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>

                        <div className="flex-1 pt-2">
                          <h4
                            className={`font-semibold ${
                              step.completed ? "text-gray-900" : "text-gray-500"
                            }`}
                          >
                            {step.label}
                          </h4>
                          {step.completed && tracking.updates && (
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(
                                tracking.updates[0]?.timestamp
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info Sidebar */}
              <div className="space-y-6">
                {/* Driver Info */}
                {tracking.driver && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Driver Information
                    </h3>

                    <div className="flex items-center gap-4 mb-4">
                      <Image
                        src={tracking.driver.image || "/default-avatar.png"}
                        alt={tracking.driver.name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {tracking.driver.name}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <span className="text-yellow-500">★</span>
                          <span>
                            {tracking.driver.rating?.toFixed(1) || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        (window.location.href = `tel:${tracking.driver.phone}`)
                      }
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium"
                    >
                      <PhoneIcon className="h-5 w-5" />
                      Call Driver
                    </button>
                  </div>
                )}

                {/* Delivery Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Delivery Details
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600">From</label>
                      <p className="font-medium text-gray-900">
                        {tracking.order.supplier?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {tracking.order.supplier?.address}
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <label className="text-sm text-gray-600">To</label>
                      <p className="font-medium text-gray-900">
                        {tracking.order.buyer?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Delivery address details here
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Order Summary
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium">
                        {tracking.order.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">
                        {tracking.order.items?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium">
                        ₦{tracking.order.total?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
