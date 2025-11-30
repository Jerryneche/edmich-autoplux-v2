"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  WrenchScrewdriverIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function BookingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mechanicBookings, setMechanicBookings] = useState([]);
  const [logisticsBookings, setLogisticsBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (session) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const [mechanicRes, logisticsRes] = await Promise.all([
        fetch("/api/mechanics/bookings?role=buyer"),
        fetch("/api/logistics/bookings"),
      ]);

      const mechanicData = await mechanicRes.json();
      const logisticsData = await logisticsRes.json();

      if (mechanicData.success) {
        setMechanicBookings(mechanicData.bookings);
      }

      if (logisticsData.success) {
        setLogisticsBookings(logisticsData.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      accepted: "bg-blue-100 text-blue-800",
      picked_up: "bg-purple-100 text-purple-800",
      in_transit: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          styles[status] || styles.pending
        }`}
      >
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const allBookings = [
    ...mechanicBookings.map((b: any) => ({ ...b, type: "mechanic" })),
    ...logisticsBookings.map((b: any) => ({ ...b, type: "logistics" })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredBookings =
    activeTab === "all"
      ? allBookings
      : allBookings.filter((b) => b.type === activeTab);

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-2">
                Manage your mechanic and logistics bookings
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/mechanics")}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                <WrenchScrewdriverIcon className="h-5 w-5" />
                Book Mechanic
              </button>
              <button
                onClick={() => router.push("/logistics/book")}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                <TruckIcon className="h-5 w-5" />
                Book Delivery
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Total</span>
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {allBookings.length}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Pending</span>
                <ClockIcon className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">
                {allBookings.filter((b) => b.status === "pending").length}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Active</span>
                <ClockIcon className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {
                  allBookings.filter((b) =>
                    ["confirmed", "in_progress", "in_transit"].includes(
                      b.status
                    )
                  ).length
                }
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Completed</span>
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {
                  allBookings.filter((b) =>
                    ["completed", "delivered"].includes(b.status)
                  ).length
                }
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`flex-1 px-6 py-4 font-medium ${
                    activeTab === "all"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All Bookings ({allBookings.length})
                </button>
                <button
                  onClick={() => setActiveTab("mechanic")}
                  className={`flex-1 px-6 py-4 font-medium ${
                    activeTab === "mechanic"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Mechanic Services ({mechanicBookings.length})
                </button>
                <button
                  onClick={() => setActiveTab("logistics")}
                  className={`flex-1 px-6 py-4 font-medium ${
                    activeTab === "logistics"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Logistics ({logisticsBookings.length})
                </button>
              </div>
            </div>

            {/* Bookings List */}
            <div className="divide-y">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start by booking a mechanic or delivery service
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => router.push("/mechanics")}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                    >
                      Book Mechanic
                    </button>
                    <button
                      onClick={() => router.push("/logistics/book")}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
                    >
                      Book Delivery
                    </button>
                  </div>
                </div>
              ) : (
                filteredBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="p-6 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      if (booking.type === "mechanic") {
                        router.push(`/bookings/mechanic/${booking.id}`);
                      } else {
                        router.push(`/bookings/logistics/${booking.id}`);
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          booking.type === "mechanic"
                            ? "bg-green-100"
                            : "bg-orange-100"
                        }`}
                      >
                        {booking.type === "mechanic" ? (
                          <WrenchScrewdriverIcon
                            className={`h-6 w-6 ${
                              booking.type === "mechanic"
                                ? "text-green-600"
                                : "text-orange-600"
                            }`}
                          />
                        ) : (
                          <TruckIcon
                            className={`h-6 w-6 ${
                              booking.type === "mechanic"
                                ? "text-green-600"
                                : "text-orange-600"
                            }`}
                          />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {booking.type === "mechanic"
                                ? booking.serviceType
                                : `Delivery: ${booking.packageType}`}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {booking.type === "mechanic"
                                ? `Mechanic: ${booking.mechanic?.user?.name}`
                                : `From: ${booking.pickupAddress}`}
                            </p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            📅{" "}
                            {new Date(
                              booking.date ||
                                booking.scheduledDate ||
                                booking.createdAt
                            ).toLocaleDateString()}
                          </span>
                          {booking.startTime && (
                            <span>🕐 {booking.startTime}</span>
                          )}
                          <span className="font-semibold text-blue-600">
                            ₦{booking.estimatedPrice?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
