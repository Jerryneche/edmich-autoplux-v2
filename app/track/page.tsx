"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  ShareIcon,
  PhoneIcon,
  ArrowPathIcon,
  QrCodeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

export default function UnifiedTrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // 🔥 QR Code State
  const [qrCode, setQrCode] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

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
        `/api/track/unified?id=${encodeURIComponent(trackingNumber.trim())}`
      );

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        toast.success("Tracking information found!");
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

  // 🔥 Generate QR Code
  const generateQR = async () => {
    setIsGeneratingQR(true);
    try {
      const response = await fetch(`/api/track/qr?id=${trackingNumber}`);
      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        setShowQR(true);
        toast.success("QR code generated!");
      } else {
        toast.error("Failed to generate QR code");
      }
    } catch (error) {
      console.error("QR generation error:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // 🔥 Download QR Code
  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `EDMICH-Tracking-${trackingNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded!");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return <CubeIcon className="h-10 w-10 text-white" />;
      case "LOGISTICS":
        return <TruckIcon className="h-10 w-10 text-white" />;
      case "MECHANIC":
        return <WrenchScrewdriverIcon className="h-10 w-10 text-white" />;
      default:
        return <CubeIcon className="h-10 w-10 text-white" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ORDER":
        return "from-blue-600 to-purple-600";
      case "LOGISTICS":
        return "from-green-600 to-emerald-600";
      case "MECHANIC":
        return "from-orange-600 to-red-600";
      default:
        return "from-gray-600 to-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300",
      PROCESSING: "bg-purple-100 text-purple-800 border-purple-300",
      SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-300",
      IN_TRANSIT: "bg-indigo-100 text-indigo-800 border-indigo-300",
      IN_PROGRESS: "bg-purple-100 text-purple-800 border-purple-300",
      DELIVERED: "bg-green-100 text-green-800 border-green-300",
      COMPLETED: "bg-green-100 text-green-800 border-green-300",
      CANCELLED: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const shareTracking = () => {
    const url = `${window.location.origin}/track?id=${trackingNumber}`;
    if (navigator.share) {
      navigator.share({
        title: "EDMICH Tracking",
        text: `Track my ${result?.type?.toLowerCase()}: ${result?.title}`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Tracking link copied to clipboard!");
    }
  };

  return (
    <>
      <Header />
      <Toaster position="top-center" />

      {/* 🔥 QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Tracking QR Code
              </h3>
              <button
                onClick={() => setShowQR(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
              <img
                src={qrCode}
                alt="QR Code"
                className="w-full rounded-xl shadow-lg"
              />
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-2">Tracking ID</p>
              <p className="text-lg font-mono font-bold text-gray-900">
                {trackingNumber}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Scan this QR code to track your shipment
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadQR}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Hero */}
          <div className="text-center mb-12 pt-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-2xl">
              <MagnifyingGlassIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-4">
              Universal{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tracking
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track orders, deliveries, and mechanic services — all in one place
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
                    placeholder="Enter tracking ID (EDM-, TRK-, or MECH-)"
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
                      Track Now
                    </>
                  )}
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span className="font-semibold">Supported formats:</span> EDM-*
                (Orders), TRK-/LOG-* (Deliveries), MECH-* (Services)
              </div>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center mb-8">
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
              {/* Main Card */}
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200">
                <div
                  className={`bg-gradient-to-r ${getTypeColor(
                    result.type
                  )} p-8 text-white`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                        {getTypeIcon(result.type)}
                      </div>
                      <div>
                        <p className="text-sm opacity-90 mb-1">Tracking ID</p>
                        <p className="text-3xl font-black font-mono">
                          {result.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {/* 🔥 QR Code Button */}
                      <button
                        onClick={generateQR}
                        disabled={isGeneratingQR}
                        className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors disabled:opacity-50"
                        title="Generate QR Code"
                      >
                        {isGeneratingQR ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                        ) : (
                          <QrCodeIcon className="w-6 h-6" />
                        )}
                      </button>
                      {/* Share Button */}
                      <button
                        onClick={shareTracking}
                        className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                        title="Share Tracking"
                      >
                        <ShareIcon className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        {result.title}
                      </h2>
                      <p className="text-sm opacity-90">
                        {result.type === "ORDER" && "Product Order"}
                        {result.type === "LOGISTICS" && "Package Delivery"}
                        {result.type === "MECHANIC" && "Vehicle Service"}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-xl font-bold border-2 bg-white ${getStatusColor(
                        result.status
                      )}`}
                    >
                      {result.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  {/* ORDER Details */}
                  {result.type === "ORDER" && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Order Total
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            ₦{result.total.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Customer</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {result.customer.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Delivery City
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {result.customer.city}
                          </p>
                        </div>
                      </div>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <p className="font-bold text-blue-900 mb-3">
                          Order Items
                        </p>
                        <div className="space-y-2">
                          {result.items.map((item: any, i: number) => (
                            <div
                              key={i}
                              className="flex justify-between items-center py-2"
                            >
                              <span className="text-gray-700">
                                {item.name}{" "}
                                <span className="text-gray-500">
                                  x{item.quantity}
                                </span>
                              </span>
                              <span className="font-semibold text-gray-900">
                                ₦{(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LOGISTICS Details */}
                  {result.type === "LOGISTICS" && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPinIcon className="w-5 h-5 text-green-600" />
                            <p className="font-bold text-green-900">Pickup</p>
                          </div>
                          <p className="text-gray-900">
                            {result.pickup.address}
                          </p>
                          <p className="text-sm text-gray-600">
                            {result.pickup.city}
                          </p>
                        </div>
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPinIcon className="w-5 h-5 text-purple-600" />
                            <p className="font-bold text-purple-900">
                              Delivery
                            </p>
                          </div>
                          <p className="text-gray-900">
                            {result.delivery.address}
                          </p>
                          <p className="text-sm text-gray-600">
                            {result.delivery.city}
                          </p>
                        </div>
                      </div>

                      {result.currentLocation && (
                        <div className="flex items-center gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                          <TruckIcon className="w-6 h-6 text-green-600 flex-shrink-0 animate-pulse" />
                          <div>
                            <p className="font-bold text-green-900">
                              Current Location
                            </p>
                            <p className="text-gray-900">
                              {result.currentLocation.name}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-600 mb-1">
                            Package Type
                          </p>
                          <p className="font-bold text-gray-900 capitalize">
                            {result.packageType}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-600 mb-1">Weight</p>
                          <p className="font-bold text-gray-900">
                            {result.weight}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-600 mb-1">Price</p>
                          <p className="font-bold text-gray-900">
                            ₦{result.estimatedPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {result.driver && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                          <p className="font-bold text-green-900 mb-2">
                            Assigned Driver
                          </p>
                          <p className="text-gray-900 font-semibold">
                            {result.driver.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {result.driver.phone} • {result.driver.vehicle}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MECHANIC Details */}
                  {result.type === "MECHANIC" && (
                    <div className="space-y-6">
                      <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                            <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-orange-900">
                              {result.vehicle.make} {result.vehicle.model}
                            </p>
                            <p className="text-sm text-orange-700">
                              {result.vehicle.year} • {result.vehicle.plate}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-900 font-semibold capitalize">
                          {result.service.replace(/_/g, " ")}
                        </p>
                        {result.customService && (
                          <p className="text-sm text-gray-600 mt-2">
                            {result.customService}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <ClockIcon className="w-5 h-5 text-gray-600" />
                            <p className="font-bold text-gray-900">Scheduled</p>
                          </div>
                          <p className="text-gray-700">
                            {result.scheduled.date} at {result.scheduled.time}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPinIcon className="w-5 h-5 text-gray-600" />
                            <p className="font-bold text-gray-900">Location</p>
                          </div>
                          <p className="text-gray-700">
                            {result.location.city}
                          </p>
                        </div>
                      </div>

                      {result.mechanic && (
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                          <p className="font-bold text-orange-900 mb-2">
                            Assigned Mechanic
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-900 font-semibold">
                                {result.mechanic.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {result.mechanic.phone}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span className="font-bold text-gray-900">
                                {result.mechanic.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {result.progress && (
                        <div className="space-y-3">
                          <p className="font-bold text-gray-900">
                            Service Progress
                          </p>
                          {result.progress.map((step: any, i: number) => (
                            <div
                              key={i}
                              className={`p-4 rounded-xl border-2 ${
                                step.status === "completed"
                                  ? "bg-green-50 border-green-200"
                                  : step.status === "in_progress"
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                {step.status === "completed" && (
                                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                )}
                                {step.status === "in_progress" && (
                                  <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />
                                )}
                                {step.status === "pending" && (
                                  <ClockIcon className="w-5 h-5 text-gray-400" />
                                )}
                                <p className="font-bold text-gray-900">
                                  {step.title}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 pl-8">
                                {step.notes}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-orange-900">
                            Estimated Cost
                          </p>
                          <p className="text-2xl font-bold text-orange-900">
                            ₦{result.estimatedPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                  Tracking Timeline
                </h3>
                <div className="space-y-6">
                  {result.timeline.map((event: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            event.completed
                              ? "bg-green-600"
                              : index ===
                                result.timeline.findIndex(
                                  (e: any) => !e.completed
                                )
                              ? "bg-blue-600 animate-pulse"
                              : "bg-gray-300"
                          }`}
                        >
                          {event.completed ? (
                            <CheckCircleIcon className="w-6 h-6 text-white" />
                          ) : (
                            <ClockIcon className="w-6 h-6 text-white" />
                          )}
                        </div>
                        {index < result.timeline.length - 1 && (
                          <div
                            className={`w-1 h-16 ${
                              event.completed ? "bg-green-600" : "bg-gray-300"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-2">
                          <h4
                            className={`font-bold text-lg ${
                              event.completed
                                ? "text-gray-900"
                                : "text-gray-600"
                            }`}
                          >
                            {event.status}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {format(new Date(event.date), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPinIcon className="w-4 h-4" />
                          <span>
                            {event.location || event.description || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact & Share */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5 text-blue-600" />
                    Need Help?
                  </h4>
                  <div className="space-y-3">
                    <Link
                      href="tel:+2349025579441"
                      className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
                    >
                      <PhoneIcon className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900">
                        Call Support: +234 902 557 9441
                      </span>
                    </Link>
                    <Link
                      href={`https://wa.me/2349025579441?text=Help%20with%20tracking%20${trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span className="font-semibold text-gray-900">
                        WhatsApp Support
                      </span>
                    </Link>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <ShareIcon className="w-5 h-5" />
                    Share Tracking
                  </h4>
                  <p className="text-sm mb-4 opacity-90">
                    Share this tracking info with others
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={shareTracking}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:shadow-xl transition-all"
                    >
                      <ShareIcon className="w-5 h-5" />
                      Share Link
                    </button>
                    <button
                      onClick={generateQR}
                      disabled={isGeneratingQR}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                      {isGeneratingQR ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <QrCodeIcon className="w-5 h-5" />
                          Generate QR Code
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    setTrackingNumber("");
                    setResult(null);
                    setError("");
                    setQrCode("");
                    setShowQR(false);
                  }}
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-bold hover:border-gray-300 hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  Track Another Shipment
                </button>
              </div>
            </div>
          )}

          {/* Info Cards */}
          {!result && !error && (
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200 text-center hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CubeIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Track Orders</h3>
                <p className="text-sm text-gray-600">
                  Real-time updates on your auto parts orders with EDM- prefix
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-200 text-center hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TruckIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Track Deliveries
                </h3>
                <p className="text-sm text-gray-600">
                  Live location updates for packages with TRK- or LOG- prefix
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-orange-200 text-center hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <WrenchScrewdriverIcon className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Track Services</h3>
                <p className="text-sm text-gray-600">
                  Monitor vehicle repair progress with MECH- prefix
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
