"use client";

import { useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import {
  TruckIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// Mock tracking data - Replace with actual API
const MOCK_TRACKING_DATA: { [key: string]: any } = {
  TRK001234: {
    trackingNumber: "TRK001234",
    status: "in_transit",
    pickupLocation: "123 Allen Avenue, Ikeja, Lagos",
    deliveryLocation: "456 Victoria Island, Lagos",
    driverName: "Chinedu Eze",
    driverPhone: "+234 803 456 7890",
    vehicleType: "Van",
    vehiclePlate: "LAG-123-XY",
    estimatedDelivery: "Today, 4:30 PM",
    currentLocation: "Lekki Toll Gate",
    progress: 65,
    timeline: [
      {
        status: "Order Placed",
        timestamp: "Today, 10:30 AM",
        completed: true,
        description: "Your delivery request has been confirmed",
      },
      {
        status: "Picked Up",
        timestamp: "Today, 11:45 AM",
        completed: true,
        description: "Package picked up from sender",
      },
      {
        status: "In Transit",
        timestamp: "Today, 2:15 PM",
        completed: true,
        description: "Package is on the way to destination",
      },
      {
        status: "Out for Delivery",
        timestamp: "Pending",
        completed: false,
        description: "Driver is near your location",
      },
      {
        status: "Delivered",
        timestamp: "Pending",
        completed: false,
        description: "Package delivered successfully",
      },
    ],
  },
  TRK005678: {
    trackingNumber: "TRK005678",
    status: "delivered",
    pickupLocation: "789 Wuse II, Abuja",
    deliveryLocation: "321 Garki, Abuja",
    driverName: "Blessing Okon",
    driverPhone: "+234 804 567 8901",
    vehicleType: "Bike",
    vehiclePlate: "ABJ-456-YZ",
    estimatedDelivery: "Yesterday, 3:00 PM",
    deliveredAt: "Yesterday, 2:45 PM",
    currentLocation: "Delivered",
    progress: 100,
    timeline: [
      {
        status: "Order Placed",
        timestamp: "Yesterday, 11:00 AM",
        completed: true,
        description: "Your delivery request has been confirmed",
      },
      {
        status: "Picked Up",
        timestamp: "Yesterday, 11:30 AM",
        completed: true,
        description: "Package picked up from sender",
      },
      {
        status: "In Transit",
        timestamp: "Yesterday, 1:15 PM",
        completed: true,
        description: "Package is on the way to destination",
      },
      {
        status: "Out for Delivery",
        timestamp: "Yesterday, 2:30 PM",
        completed: true,
        description: "Driver is near your location",
      },
      {
        status: "Delivered",
        timestamp: "Yesterday, 2:45 PM",
        completed: true,
        description: "Package delivered successfully",
      },
    ],
  },
};

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError("");
    setTrackingData(null);

    // Simulate API call
    setTimeout(() => {
      const data = MOCK_TRACKING_DATA[trackingNumber.toUpperCase()];

      if (data) {
        setTrackingData(data);
      } else {
        setError("Tracking number not found. Please check and try again.");
      }
      setIsSearching(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500";
      case "in_transit":
      case "out_for_delivery":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-neutral-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "in_transit":
        return "In Transit";
      case "out_for_delivery":
        return "Out for Delivery";
      case "pending":
        return "Pending Pickup";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Header />

      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-green-200/40 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
              <TruckIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Real-Time Tracking
              </span>
            </div>

            <h1 className="text-5xl font-bold text-neutral-900 mb-4 leading-tight">
              Track Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Delivery
              </span>
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Enter your tracking number to see real-time updates on your
              shipment
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-neutral-200 p-8 mb-12">
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Tracking Number
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g., TRK001234"
                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-lg"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-neutral-500">
                  Try:{" "}
                  <button
                    type="button"
                    onClick={() => setTrackingNumber("TRK001234")}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    TRK001234
                  </button>{" "}
                  or{" "}
                  <button
                    type="button"
                    onClick={() => setTrackingNumber("TRK005678")}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    TRK005678
                  </button>
                </p>
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSearching ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    <span>Tracking...</span>
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="h-5 w-5" />
                    <span>Track Package</span>
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
                <XCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
                <p className="text-red-900 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Tracking Results */}
          {trackingData && (
            <div className="space-y-6 animate-fade-in">
              {/* Status Card */}
              <div className="bg-white rounded-3xl shadow-xl border-2 border-neutral-200 p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-4 py-2 ${getStatusColor(
                          trackingData.status
                        )} text-white rounded-lg font-bold text-sm`}
                      >
                        {getStatusText(trackingData.status)}
                      </span>
                      <span className="text-neutral-500 font-mono text-sm">
                        #{trackingData.trackingNumber}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                      {trackingData.status === "delivered"
                        ? "Package Delivered!"
                        : "Package On The Way"}
                    </h2>
                    <p className="text-neutral-600">
                      {trackingData.status === "delivered"
                        ? `Delivered at ${trackingData.deliveredAt}`
                        : `Estimated delivery: ${trackingData.estimatedDelivery}`}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={`tel:${trackingData.driverPhone}`}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition-all"
                    >
                      <PhoneIcon className="h-5 w-5" />
                      Call Driver
                    </a>
                    <button className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-semibold hover:bg-green-100 transition-all">
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      Chat
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {trackingData.status !== "delivered" && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-neutral-700">
                        Delivery Progress
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {trackingData.progress}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-green-600 transition-all duration-500"
                        style={{ width: `${trackingData.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Location Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPinIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">
                        Pickup Location
                      </p>
                      <p className="font-medium text-neutral-900">
                        {trackingData.pickupLocation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPinIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">
                        Delivery Location
                      </p>
                      <p className="font-medium text-neutral-900">
                        {trackingData.deliveryLocation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver Info */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  Driver Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Driver Name</p>
                    <p className="font-bold text-neutral-900">
                      {trackingData.driverName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">
                      Phone Number
                    </p>
                    <a
                      href={`tel:${trackingData.driverPhone}`}
                      className="font-bold text-blue-600 hover:text-blue-700"
                    >
                      {trackingData.driverPhone}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">
                      Vehicle Type
                    </p>
                    <p className="font-bold text-neutral-900">
                      {trackingData.vehicleType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">
                      Vehicle Plate
                    </p>
                    <p className="font-bold text-neutral-900 font-mono">
                      {trackingData.vehiclePlate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-3xl shadow-xl border-2 border-neutral-200 p-8">
                <h3 className="text-2xl font-bold text-neutral-900 mb-8">
                  Delivery Timeline
                </h3>

                <div className="space-y-6">
                  {trackingData.timeline.map((item: any, index: number) => (
                    <div key={index} className="relative flex gap-4">
                      {/* Timeline Line */}
                      {index < trackingData.timeline.length - 1 && (
                        <div
                          className={`absolute left-5 top-12 w-0.5 h-full ${
                            item.completed ? "bg-green-500" : "bg-neutral-200"
                          }`}
                        ></div>
                      )}

                      {/* Status Icon */}
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.completed ? "bg-green-500" : "bg-neutral-200"
                        }`}
                      >
                        {item.completed ? (
                          <CheckCircleIcon className="h-6 w-6 text-white" />
                        ) : (
                          <ClockIcon className="h-5 w-5 text-neutral-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <h4
                            className={`font-bold ${
                              item.completed
                                ? "text-neutral-900"
                                : "text-neutral-400"
                            }`}
                          >
                            {item.status}
                          </h4>
                          <span
                            className={`text-sm font-medium ${
                              item.completed
                                ? "text-neutral-600"
                                : "text-neutral-400"
                            }`}
                          >
                            {item.timestamp}
                          </span>
                        </div>
                        <p
                          className={`text-sm ${
                            item.completed
                              ? "text-neutral-600"
                              : "text-neutral-400"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}
