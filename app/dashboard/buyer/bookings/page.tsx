"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  WrenchScrewdriverIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

interface MechanicBooking {
  id: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  serviceType: string;
  date: string;
  time: string;
  address: string;
  city: string;
  status: string;
  estimatedPrice: number;
  mechanic?: {
    businessName: string;
    phone: string;
  };
  createdAt: string;
}

interface LogisticsBooking {
  id: string;
  packageDescription: string;
  packageType: string;
  deliverySpeed: string;
  pickupCity: string;
  deliveryCity: string;
  trackingNumber: string;
  currentLocation: string;
  status: string;
  estimatedPrice: number;
  driver?: {
    companyName: string;
    phone: string;
  };
  createdAt: string;
}

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-purple-100 text-purple-800 border-purple-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_ICONS = {
  PENDING: ClockIcon,
  CONFIRMED: CheckCircleIcon,
  IN_PROGRESS: ArrowPathIcon,
  COMPLETED: CheckCircleIcon,
  CANCELLED: XCircleIcon,
};

function BookingsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"mechanics" | "logistics">(
    (searchParams.get("type") as "mechanics" | "logistics") || "mechanics"
  );
  const [mechanicBookings, setMechanicBookings] = useState<MechanicBooking[]>(
    []
  );
  const [logisticsBookings, setLogisticsBookings] = useState<
    LogisticsBooking[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (status === "authenticated") {
      fetchBookings();
    }
  }, [status, activeTab, router]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "mechanics") {
        const response = await fetch("/api/bookings/mechanics?view=customer");
        if (response.ok) {
          const data = await response.json();
          setMechanicBookings(data);
        }
      } else {
        const response = await fetch("/api/bookings/logistics?view=customer");
        if (response.ok) {
          const data = await response.json();
          setLogisticsBookings(data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (
    id: string,
    type: "mechanics" | "logistics"
  ) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const response = await fetch(`/api/bookings/${type}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (error: any) {
      console.error("Cancel error:", error);
      toast.error(error.message || "Failed to cancel booking");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading bookings...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              My Bookings
            </h1>
            <p className="text-neutral-600">
              Track and manage your service bookings
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab("mechanics")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "mechanics"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-purple-300"
              }`}
            >
              <WrenchScrewdriverIcon className="h-5 w-5" />
              Mechanic Services
              {mechanicBookings.length > 0 && (
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  {mechanicBookings.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("logistics")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "logistics"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-green-300"
              }`}
            >
              <TruckIcon className="h-5 w-5" />
              Deliveries
              {logisticsBookings.length > 0 && (
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  {logisticsBookings.length}
                </span>
              )}
            </button>
          </div>

          {/* Mechanic Bookings */}
          {activeTab === "mechanics" && (
            <div className="space-y-6">
              {mechanicBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-12 text-center">
                  <WrenchScrewdriverIcon className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-neutral-900 mb-2">
                    No mechanic bookings yet
                  </p>
                  <p className="text-neutral-600 mb-6">
                    Book a professional mechanic for your vehicle
                  </p>
                  <Link
                    href="/business/mechanics/booking"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                  >
                    <WrenchScrewdriverIcon className="h-5 w-5" />
                    Book Mechanic
                  </Link>
                </div>
              ) : (
                mechanicBookings.map((booking) => {
                  const StatusIcon =
                    STATUS_ICONS[booking.status as keyof typeof STATUS_ICONS];
                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl border-2 border-neutral-200 p-6 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-neutral-900">
                              {booking.vehicleMake} {booking.vehicleModel} (
                              {booking.vehicleYear})
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${
                                STATUS_COLORS[
                                  booking.status as keyof typeof STATUS_COLORS
                                ]
                              } flex items-center gap-1`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-neutral-600 font-medium capitalize">
                            {booking.serviceType.replace(/_/g, " ")}
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">
                          ₦{booking.estimatedPrice.toLocaleString()}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-3">
                          <ClockIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-neutral-700">
                              Scheduled
                            </p>
                            <p className="text-neutral-600">
                              {booking.date} at {booking.time}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <WrenchScrewdriverIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-neutral-700">
                              Location
                            </p>
                            <p className="text-neutral-600">
                              {booking.address}, {booking.city}
                            </p>
                          </div>
                        </div>
                      </div>

                      {booking.mechanic && (
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-4">
                          <p className="text-sm font-semibold text-purple-900 mb-1">
                            Assigned Mechanic
                          </p>
                          <p className="text-purple-800 font-medium">
                            {booking.mechanic.businessName}
                          </p>
                          <p className="text-sm text-purple-600">
                            {booking.mechanic.phone}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Link
                          href={`/dashboard/buyer/bookings/mechanics/${booking.id}`}
                          className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <EyeIcon className="h-5 w-5" />
                          View Details
                        </Link>
                        {booking.status === "PENDING" && (
                          <button
                            onClick={() =>
                              handleCancelBooking(booking.id, "mechanics")
                            }
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-colors flex items-center gap-2"
                          >
                            <XCircleIcon className="h-5 w-5" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Logistics Bookings */}
          {activeTab === "logistics" && (
            <div className="space-y-6">
              {logisticsBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-12 text-center">
                  <TruckIcon className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-neutral-900 mb-2">
                    No deliveries yet
                  </p>
                  <p className="text-neutral-600 mb-6">
                    Book reliable logistics for your packages
                  </p>
                  <Link
                    href="/business/logistics/booking"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    <TruckIcon className="h-5 w-5" />
                    Book Delivery
                  </Link>
                </div>
              ) : (
                logisticsBookings.map((booking) => {
                  const StatusIcon =
                    STATUS_ICONS[booking.status as keyof typeof STATUS_ICONS];
                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl border-2 border-neutral-200 p-6 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-neutral-900">
                              {booking.packageDescription}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${
                                STATUS_COLORS[
                                  booking.status as keyof typeof STATUS_COLORS
                                ]
                              } flex items-center gap-1`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-neutral-600 font-medium">
                            Tracking:{" "}
                            <span className="font-mono">
                              {booking.trackingNumber}
                            </span>
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">
                          ₦{booking.estimatedPrice.toLocaleString()}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-start gap-3">
                          <TruckIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-neutral-700">
                              Package Type
                            </p>
                            <p className="text-neutral-600 capitalize">
                              {booking.packageType.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <WrenchScrewdriverIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-neutral-700">
                              Pickup
                            </p>
                            <p className="text-neutral-600">
                              {booking.pickupCity}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-neutral-700">
                              Delivery
                            </p>
                            <p className="text-neutral-600">
                              {booking.deliveryCity}
                            </p>
                          </div>
                        </div>
                      </div>

                      {booking.currentLocation && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4">
                          <p className="text-sm font-semibold text-green-900 mb-1">
                            Current Location
                          </p>
                          <p className="text-green-800 font-medium">
                            {booking.currentLocation}
                          </p>
                        </div>
                      )}

                      {booking.driver && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4">
                          <p className="text-sm font-semibold text-green-900 mb-1">
                            Assigned Driver
                          </p>
                          <p className="text-green-800 font-medium">
                            {booking.driver.companyName}
                          </p>
                          <p className="text-sm text-green-600">
                            {booking.driver.phone}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Link
                          href={`/dashboard/buyer/bookings/logistics/${booking.id}`}
                          className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <EyeIcon className="h-5 w-5" />
                          Track Package
                        </Link>
                        {booking.status === "PENDING" && (
                          <button
                            onClick={() =>
                              handleCancelBooking(booking.id, "logistics")
                            }
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-colors flex items-center gap-2"
                          >
                            <XCircleIcon className="h-5 w-5" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function BuyerBookingsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white">
          <Header />
          <div className="pt-32 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading bookings...</p>
            </div>
          </div>
        </main>
      }
    >
      <BookingsContent />
    </Suspense>
  );
}
