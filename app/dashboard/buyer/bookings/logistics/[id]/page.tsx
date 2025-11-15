"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  TruckIcon,
  MapPinIcon,
  CubeIcon,
  PhoneIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-purple-100 text-purple-800 border-purple-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_STEPS = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"];

interface LogisticsBooking {
  id: string;
  packageDescription: string;
  packageType: string;
  deliverySpeed: string;
  pickupAddress: string;
  pickupCity: string;
  pickupState: string | null;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string | null;
  trackingNumber: string;
  currentLocation: string;
  status: string;
  estimatedPrice: number;
  phone: string;
  recipientName: string;
  recipientPhone: string;
  specialInstructions: string | null;
  packageValue: number | null;
  driver?: {
    companyName: string;
    phone: string;
  };
  createdAt: string;
}

export default function LogisticsBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [booking, setBooking] = useState<LogisticsBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      const loadBooking = async () => {
        const { id } = await params;
        await fetchBooking(id);
      };
      loadBooking();
    }
  }, [status, params, router]);

  const fetchBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/logistics/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch booking");
      }

      const data = await response.json();
      setBooking(data);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Failed to load booking details");
      router.push("/dashboard/buyer/bookings?type=logistics");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStep = () => {
    if (!booking) return 0;
    return STATUS_STEPS.indexOf(booking.status);
  };

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading tracking details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!booking) {
    return null;
  }

  const currentStep = getCurrentStep();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Back Button */}
          <Link
            href="/dashboard/buyer/bookings?type=logistics"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-green-600 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Bookings
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-neutral-900">
                Track Package
              </h1>
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                  STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS]
                }`}
              >
                {booking.status}
              </span>
            </div>
            <p className="text-lg text-neutral-600">
              Tracking Number:{" "}
              <span className="font-mono font-bold text-neutral-900">
                {booking.trackingNumber}
              </span>
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Delivery Progress
            </h2>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-neutral-200">
                <div
                  className="h-full bg-green-600 transition-all duration-500"
                  style={{
                    width: `${
                      (currentStep / (STATUS_STEPS.length - 1)) * 100
                    }%`,
                  }}
                ></div>
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                          isCompleted
                            ? "bg-green-600 border-green-600"
                            : "bg-white border-neutral-300"
                        } transition-all duration-300 ${
                          isCurrent ? "ring-4 ring-green-100" : ""
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircleIcon className="h-6 w-6 text-white" />
                        ) : (
                          <span className="text-neutral-400 font-bold">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-2 text-sm font-semibold ${
                          isCompleted ? "text-green-600" : "text-neutral-500"
                        }`}
                      >
                        {step.replace(/_/g, " ")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Current Location */}
          {booking.currentLocation && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-2">
                <MapPinIcon className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-900">
                  Current Location
                </h3>
              </div>
              <p className="text-lg text-green-800 font-medium">
                {booking.currentLocation}
              </p>
            </div>
          )}

          {/* Package Details */}
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <CubeIcon className="h-6 w-6 text-green-600" />
              Package Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">
                  Description
                </p>
                <p className="text-neutral-900">{booking.packageDescription}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">
                  Package Type
                </p>
                <p className="text-neutral-900 capitalize">
                  {booking.packageType.replace(/_/g, " ")}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">
                  Delivery Speed
                </p>
                <p className="text-neutral-900 capitalize">
                  {booking.deliverySpeed.replace(/_/g, " ")}
                </p>
              </div>

              {booking.packageValue && (
                <div>
                  <p className="text-sm font-semibold text-neutral-700 mb-1">
                    Package Value
                  </p>
                  <p className="text-neutral-900">
                    ₦{booking.packageValue.toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">
                  Delivery Cost
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ₦{booking.estimatedPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Route Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Pickup */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPinIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Pickup</h3>
              </div>
              <p className="text-neutral-900 font-medium mb-1">
                {booking.pickupAddress}
              </p>
              <p className="text-neutral-600">
                {booking.pickupCity}
                {booking.pickupState && `, ${booking.pickupState}`}
              </p>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Delivery</h3>
              </div>
              <p className="text-neutral-900 font-medium mb-1">
                {booking.deliveryAddress}
              </p>
              <p className="text-neutral-600">
                {booking.deliveryCity}
                {booking.deliveryState && `, ${booking.deliveryState}`}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <PhoneIcon className="h-6 w-6 text-green-600" />
              Contact Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">
                  Your Phone
                </p>
                <p className="text-neutral-900">{booking.phone}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">
                  Recipient Name
                </p>
                <p className="text-neutral-900">{booking.recipientName}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">
                  Recipient Phone
                </p>
                <p className="text-neutral-900">{booking.recipientPhone}</p>
              </div>
            </div>

            {booking.specialInstructions && (
              <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
                <p className="text-sm font-semibold text-neutral-700 mb-1">
                  Special Instructions
                </p>
                <p className="text-neutral-600">
                  {booking.specialInstructions}
                </p>
              </div>
            )}
          </div>

          {/* Driver Information — FIXED */}
          {booking.driver && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-green-900 mb-4">
                Assigned Driver
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-green-700 mb-1">
                    Company
                  </p>
                  <p className="text-green-900 font-medium">
                    {booking.driver.companyName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-700 mb-1">
                    Phone
                  </p>
                  <Link
                    href={`tel:${booking.driver.phone}`}
                    className="text-green-900 font-medium hover:text-green-600 transition-colors"
                  >
                    {booking.driver.phone}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
