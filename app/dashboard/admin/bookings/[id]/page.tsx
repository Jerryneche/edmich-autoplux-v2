"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

interface Booking {
  id: string;
  status: string;
  createdAt: string;
  estimatedPrice: number;
  type: "MECHANIC" | "LOGISTICS";
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  // Mechanic fields
  serviceType?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  date?: string;
  time?: string;
  address?: string;
  city?: string;
  mechanic?: {
    companyName: string;
    phone: string;
    city: string;
    state: string;
  };
  // Logistics fields
  packageType?: string;
  packageDescription?: string;
  trackingNumber?: string;
  pickupAddress?: string;
  pickupCity?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  driver?: {
    companyName: string;
    phone: string;
    city: string;
    state: string;
  };
}

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300",
  IN_PROGRESS: "bg-purple-100 text-purple-800 border-purple-300",
  COMPLETED: "bg-green-100 text-green-800 border-green-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
};

export default function BookingDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && bookingId) {
      fetchBooking();
    }
  }, [status, bookingId]);

  const fetchBooking = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      } else {
        toast.error("Failed to load booking");
        router.push("/dashboard/admin");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error("Failed to load booking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, type: booking.type }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedBooking = await response.json();
      setBooking({ ...booking, status: updatedBooking.status });
      toast.success("Booking status updated successfully");
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update booking status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">Booking not found</p>
          </div>
        </div>
      </>
    );
  }

  const isMechanic = booking.type === "MECHANIC";

  return (
    <>
      <Header />
      <Toaster position="top-right" />
      <main className="min-h-screen bg-gradient-to-b from-white to-neutral-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Bookings
          </button>

          {/* Header */}
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {isMechanic ? (
                    <WrenchScrewdriverIcon className="h-8 w-8 text-purple-600" />
                  ) : (
                    <TruckIcon className="h-8 w-8 text-green-600" />
                  )}
                  <h1 className="text-3xl font-bold text-neutral-900">
                    {isMechanic ? "Mechanic" : "Logistics"} Booking
                  </h1>
                </div>
                <p className="text-neutral-600">
                  Booked on{" "}
                  {format(
                    new Date(booking.createdAt),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <span
                  className={`px-4 py-2 rounded-xl font-semibold text-sm border-2 text-center ${
                    STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS]
                  }`}
                >
                  {booking.status}
                </span>

                <select
                  value={booking.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={isUpdating}
                  className="px-4 py-2 border-2 border-neutral-200 rounded-xl font-semibold text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">
                  {isMechanic ? "Service" : "Delivery"} Details
                </h2>

                {isMechanic ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-500">Service Type</p>
                      <p className="font-semibold text-neutral-900 capitalize">
                        {booking.serviceType?.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Vehicle</p>
                      <p className="font-semibold text-neutral-900">
                        {booking.vehicleMake} {booking.vehicleModel} (
                        {booking.vehicleYear})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">
                        Scheduled Date & Time
                      </p>
                      <p className="font-semibold text-neutral-900">
                        {booking.date} at {booking.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Address</p>
                      <p className="font-semibold text-neutral-900">
                        {booking.address}, {booking.city}
                      </p>
                    </div>

                    {booking.mechanic && (
                      <div className="mt-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                        <h3 className="font-bold text-purple-900 mb-3">
                          Assigned Mechanic
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold text-purple-800">
                            {booking.mechanic.companyName}
                          </p>
                          <p className="text-purple-700">
                            📞 {booking.mechanic.phone}
                          </p>
                          <p className="text-purple-700">
                            📍 {booking.mechanic.city}, {booking.mechanic.state}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-500">
                        Tracking Number
                      </p>
                      <p className="font-semibold text-neutral-900 font-mono">
                        {booking.trackingNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Package Type</p>
                      <p className="font-semibold text-neutral-900 capitalize">
                        {booking.packageType?.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">
                        Package Description
                      </p>
                      <p className="font-semibold text-neutral-900">
                        {booking.packageDescription || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">
                        Pickup Location
                      </p>
                      <p className="font-semibold text-neutral-900">
                        {booking.pickupAddress}, {booking.pickupCity}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">
                        Delivery Location
                      </p>
                      <p className="font-semibold text-neutral-900">
                        {booking.deliveryAddress}, {booking.deliveryCity}
                      </p>
                    </div>

                    {booking.driver && (
                      <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                        <h3 className="font-bold text-green-900 mb-3">
                          Assigned Driver
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold text-green-800">
                            {booking.driver.companyName}
                          </p>
                          <p className="text-green-700">
                            📞 {booking.driver.phone}
                          </p>
                          <p className="text-green-700">
                            📍 {booking.driver.city}, {booking.driver.state}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  Customer
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-500">Name</p>
                    <p className="font-semibold text-neutral-900">
                      {booking.user.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Email</p>
                    <p className="text-neutral-900">{booking.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  Pricing
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-neutral-500">Estimated Cost</p>
                    <p className="text-3xl font-bold text-green-600">
                      ₦{booking.estimatedPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                  Timeline
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="text-neutral-600">
                    <span className="font-semibold">Created:</span>{" "}
                    {format(new Date(booking.createdAt), "MMM d, yyyy h:mm a")}
                  </p>
                  <p className="text-neutral-600">
                    <span className="font-semibold">Status:</span>{" "}
                    {booking.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
