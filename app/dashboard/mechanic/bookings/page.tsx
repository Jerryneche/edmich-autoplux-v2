"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Link from "next/link";

interface Booking {
  id: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  plateNumber: string;
  serviceType: string;
  date: string;
  time: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
  orderId?: string;
  trackingId?: string;
  createdAt: string;
}

export default function MechanicBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED"
  >("ALL");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings/mechanics?view=mechanic");
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/mechanics/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Booking ${newStatus.toLowerCase()}!`);
        fetchBookings();
      } else {
        toast.error("Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
    }
  };

  const filteredBookings =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-12 pt-8">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
          My Mechanic Bookings
        </h1>
        <p className="text-xl text-gray-600">
          Manage your service appointments with confidence
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {["ALL", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"].map(
          (status) => {
            const count =
              status === "ALL"
                ? bookings.length
                : bookings.filter((b) => b.status === status).length;

            return (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                  filter === status
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400"
                }`}
              >
                {status === "ALL" ? "All Bookings" : formatStatus(status)}
                <span className="ml-3 opacity-80">({count})</span>
              </button>
            );
          }
        )}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-6 border-purple-600 border-t-transparent"></div>
          <p className="mt-6 text-xl text-gray-600">Loading your bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-purple-300 p-16 text-center shadow-2xl">
          <CalendarIcon className="h-24 w-24 text-purple-300 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            No Bookings Yet
          </h3>
          <p className="text-xl text-gray-600">
            {filter === "ALL"
              ? "You haven't received any bookings yet."
              : `No ${filter.toLowerCase()} bookings at the moment.`}
          </p>
          <p className="text-gray-500 mt-4">
            They'll appear here when customers book your services!
          </p>
        </div>
      ) : (
        <div className="grid gap-8">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-3xl shadow-2xl border-2 border-transparent hover:border-purple-400 transition-all p-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="flex-1">
                  {/* Linked Order Badge */}
                  {booking.trackingId && (
                    <div className="flex items-center gap-4 mb-6">
                      <span className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-full font-bold text-sm">
                        <TruckIcon className="h-5 w-5" />
                        Linked Order: {booking.trackingId}
                      </span>
                      <Link
                        href={`/track/${booking.trackingId}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 font-bold underline"
                      >
                        View Order
                      </Link>
                    </div>
                  )}

                  {/* Vehicle Info */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                      <WrenchScrewdriverIcon className="h-12 w-12 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-900">
                        {booking.vehicleMake} {booking.vehicleModel}
                      </h3>
                      <p className="text-xl text-gray-600 font-semibold">
                        {booking.vehicleYear} •{" "}
                        {booking.plateNumber.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-gray-600 font-semibold mb-2">
                        Service Requested
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {booking.serviceType}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold mb-2">
                        Appointment
                      </p>
                      <div className="flex items-center gap-6 text-xl">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="h-7 w-7 text-purple-600" />
                          <span className="font-bold">{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ClockIcon className="h-7 w-7 text-purple-600" />
                          <span className="font-bold">{booking.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <p className="text-gray-600 font-semibold mb-3">
                      Customer Details
                    </p>
                    <div className="flex items-center gap-4">
                      <UserCircleIcon className="h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-xl font-bold text-gray-900">
                          {booking.user.name}
                        </p>
                        <p className="text-gray-600">{booking.user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="lg:w-80">
                  <div className="text-center mb-8">
                    <span
                      className={`inline-block px-8 py-4 rounded-2xl font-black text-lg border-4 ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {formatStatus(booking.status)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    {booking.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => updateStatus(booking.id, "CONFIRMED")}
                          className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-xl hover:shadow-2xl transition-all transform hover:scale-105"
                        >
                          Accept Booking
                        </button>
                        <button
                          onClick={() => updateStatus(booking.id, "CANCELLED")}
                          className="w-full py-5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl font-bold text-xl hover:shadow-2xl transition-all"
                        >
                          Decline Booking
                        </button>
                      </>
                    )}

                    {booking.status === "CONFIRMED" && (
                      <button
                        onClick={() => updateStatus(booking.id, "IN_PROGRESS")}
                        className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-2xl hover:shadow-2xl transition-all transform hover:scale-105"
                      >
                        Start Service Now
                      </button>
                    )}

                    {booking.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => updateStatus(booking.id, "COMPLETED")}
                        className="w-full py-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-2xl hover:shadow-2xl transition-all transform hover:scale-105"
                      >
                        Mark as Completed
                      </button>
                    )}

                    {(booking.status === "COMPLETED" ||
                      booking.status === "CANCELLED") && (
                      <div className="text-center py-8">
                        <p className="text-2xl font-bold text-gray-700">
                          {booking.status === "COMPLETED"
                            ? "Service Completed"
                            : "Booking Cancelled"}
                        </p>
                        <p className="text-gray-500 mt-2">
                          Thank you for your service
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
