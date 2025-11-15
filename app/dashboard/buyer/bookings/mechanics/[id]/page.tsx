"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  WrenchScrewdriverIcon,
  MapPinIcon,
  PhoneIcon,
  ArrowLeftIcon,
  CalendarIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
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

interface MechanicBooking {
  id: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  plateNumber: string | null;
  serviceType: string;
  customService: string | null;
  date: string;
  time: string;
  location: string;
  address: string;
  city: string;
  state: string | null;
  phone: string;
  additionalNotes: string | null;
  status: string;
  estimatedPrice: number;
  mechanic?: {
    businessName: string;
    phone: string;
  };
  createdAt: string;
}

export default function MechanicBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [booking, setBooking] = useState<MechanicBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchBooking();
    }
  }, [status, params.id, router]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/mechanics/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch booking");
      }
      const data = await response.json();
      setBooking(data);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Failed to load booking details");
      router.push("/dashboard/buyer/bookings?type=mechanics");
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
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading booking details...</p>
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
            href="/dashboard/buyer/bookings?type=mechanics"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-purple-600 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Bookings
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-neutral-900">
                Service Booking
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
              {booking.vehicleMake} {booking.vehicleModel} (
              {booking.vehicleYear})
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Service Progress
            </h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-neutral-200">
                <div
                  className="h-full bg-purple-600 transition-all duration-500"
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
                            ? "bg-purple-600 border-purple-600"
                            : "bg-white border-neutral-300"
                        } transition-all duration-300 ${
                          isCurrent ? "ring-4 ring-purple-100" : ""
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
                          isCompleted ? "text-purple-600" : "text-neutral-500"
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

          {/* Vehicle & Service Details */}
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <TruckIcon className="h-6 w-6 text-purple-600" /> Vehicle &
              Service
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">
                  Vehicle
                </p>
                <p className="text-neutral-900">
                  {booking.vehicleMake} {booking.vehicleModel} (
                  {booking.vehicleYear})
                </p>
              </div>

              {booking.plateNumber && (
                <div>
                  <p className="text-sm font-semibold text-neutral-700 mb-1">
                    Plate Number
                  </p>
                  <p className="text-neutral-900 font-mono">
                    {booking.plateNumber}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">
                  Service Type
                </p>
                <p className="text-neutral-900 capitalize">
                  {booking.serviceType.replace(/_/g, " ")}
                </p>
              </div>

              {booking.customService && (
                <div>
                  <p className="text-sm font-semibold text-neutral-700 mb-1">
                    Custom Service
                  </p>
                  <p className="text-neutral-900">{booking.customService}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">
                  Estimated Cost
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  ₦{booking.estimatedPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule & Location */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Schedule */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-bold text-neutral-900">Schedule</h3>
              </div>
              <p className="text-neutral-600 text-sm mb-1">Date & Time</p>
              <p className="text-neutral-900 font-semibold text-lg">
                {booking.date}
              </p>
              <p className="text-neutral-900 font-semibold text-lg">
                {booking.time}
              </p>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-bold text-neutral-900">Location</h3>
              </div>
              <p className="text-neutral-600 text-sm mb-1 capitalize">
                {booking.location}
              </p>
              <p className="text-neutral-900 font-medium">{booking.address}</p>
              <p className="text-neutral-600">
                {booking.city}
                {booking.state && `, ${booking.state}`}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <PhoneIcon className="h-6 w-6 text-purple-600" /> Contact
              Information
            </h2>
            <div>
              <p className="text-sm font-semibold text-neutral-700 mb-1">
                Your Phone
              </p>
              <p className="text-neutral-900">{booking.phone}</p>
            </div>

            {booking.additionalNotes && (
              <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
                <p className="text-sm font-semibold text-neutral-700 mb-1">
                  Additional Notes
                </p>
                <p className="text-neutral-600">{booking.additionalNotes}</p>
              </div>
            )}
          </div>

          {/* Mechanic Information */}
          {booking.mechanic && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-purple-900 mb-4">
                Assigned Mechanic
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-purple-700 mb-1">
                    Business Name
                  </p>
                  <p className="text-purple-900 font-medium">
                    {booking.mechanic.businessName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-700 mb-1">
                    Phone
                  </p>
                  <a
                    href={`tel:${booking.mechanic.phone}`}
                    className="text-purple-900 font-medium hover:text-purple-600"
                  >
                    {booking.mechanic.phone}
                  </a>
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
