// app/dashboard/logistics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-purple-100 text-purple-800 border-purple-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export default function LogisticsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "LOGISTICS") {
      router.push("/dashboard");
      return;
    }
    checkAndFetchProfile();
  }, [session, status, router]);

  // Add notification refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings(); // Refresh bookings every 30 seconds
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkAndFetchProfile = async () => {
    try {
      const res = await fetch("/api/onboarding/logistics");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();

      if (!data.hasProfile) {
        router.push("/onboarding/logistics");
        return;
      }

      setProfile(data.logisticsProfile);
      await fetchBookings();
    } catch (error) {
      console.error("Profile fetch error:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Use view=logistics
  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings/logistics?view=provider", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else {
        console.error("Failed to fetch bookings:", await res.text());
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/logistics/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to update");
      }

      toast.success("Status updated!");
      fetchBookings();
    } catch (error: any) {
      toast.error(error.message || "Update failed");
    }
  };

  const stats = {
    pending: bookings.filter((b) => b.status === "PENDING").length,
    confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
    inProgress: bookings.filter((b) => b.status === "IN_PROGRESS").length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">
                Welcome back, {session?.user?.name}!
              </h1>
              <p className="text-lg text-neutral-600">Manage your deliveries</p>
            </div>
            <Link
              href="/dashboard/logistics/settings"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border-2 border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:border-green-300 transition-all"
            >
              Settings
            </Link>
          </div>

          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {profile?.companyName || "Your Company"}
                </h2>
                <p className="text-green-100 mb-4 text-lg">
                  {profile?.city && profile?.state
                    ? `${profile.city}, ${profile.state}`
                    : "Nigeria"}
                </p>
                {profile?.verified ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                    Verified Provider
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 rounded-full text-sm font-bold">
                    Pending Verification
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Pending",
              value: stats.pending,
              icon: ClockIcon,
              color: "yellow",
            },
            {
              label: "Confirmed",
              value: stats.confirmed,
              icon: CheckCircleIcon,
              color: "blue",
            },
            {
              label: "In Transit",
              value: stats.inProgress,
              icon: TruckIcon,
              color: "purple",
            },
            {
              label: "Delivered",
              value: stats.completed,
              icon: CheckCircleIcon,
              color: "green",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-14 h-14 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className={`h-7 w-7 text-${stat.color}-600`} />
                </div>
              </div>
              <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-neutral-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-lg">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Delivery Orders
          </h2>

          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <TruckIcon className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
              <p className="text-2xl font-bold text-neutral-900 mb-2">
                No deliveries yet
              </p>
              <p className="text-neutral-600">
                Customer orders will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-6 bg-neutral-50 border-2 border-neutral-200 rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-1">
                        {booking.packageType}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Tracking: {booking.trackingNumber}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                        STATUS_COLORS[booking.status]
                      }`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-neutral-600">
                        Pickup
                      </p>
                      <p className="text-neutral-900">
                        {booking.pickupAddress}, {booking.pickupCity}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-600">
                        Delivery
                      </p>
                      <p className="text-neutral-900">
                        {booking.deliveryAddress}, {booking.deliveryCity}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {booking.status === "PENDING" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(booking.id, "CONFIRMED")
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 flex items-center gap-2"
                        >
                          <CheckCircleIcon className="h-5 w-5" /> Accept
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(booking.id, "CANCELLED")
                          }
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 flex items-center gap-2"
                        >
                          <XCircleIcon className="h-5 w-5" /> Decline
                        </button>
                      </>
                    )}
                    {booking.status === "CONFIRMED" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(booking.id, "IN_PROGRESS")
                        }
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 flex items-center gap-2"
                      >
                        <TruckIcon className="h-5 w-5" /> Start Delivery
                      </button>
                    )}
                    {booking.status === "IN_PROGRESS" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(booking.id, "COMPLETED")
                        }
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 flex items-center gap-2"
                      >
                        <CheckCircleIcon className="h-5 w-5" /> Mark Delivered
                      </button>
                    )}
                    <a
                      href={`tel:${booking.phone}`}
                      className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 flex items-center gap-2"
                    >
                      <PhoneIcon className="h-5 w-5" /> Call Sender
                    </a>
                    <a
                      href={`tel:${booking.recipientPhone}`}
                      className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 flex items-center gap-2"
                    >
                      <PhoneIcon className="h-5 w-5" /> Call Recipient
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
