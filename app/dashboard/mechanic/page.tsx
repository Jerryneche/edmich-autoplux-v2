"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  WrenchScrewdriverIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function MechanicDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "MECHANIC") {
      router.push("/dashboard");
      return;
    }

    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/onboarding/mechanic");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.mechanicProfile);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Bookings",
      value: profile?.bookings?.length || 0,
      icon: CalendarIcon,
      color: "purple",
      change: "+15%",
    },
    {
      label: "Completed Jobs",
      value: "42",
      icon: CheckCircleIcon,
      color: "green",
      change: "+22%",
    },
    {
      label: "Total Earnings",
      value: "₦320,000",
      icon: CurrencyDollarIcon,
      color: "blue",
      change: "+18%",
    },
    {
      label: "Average Rating",
      value: "4.9",
      icon: StarIcon,
      color: "yellow",
      change: "+0.2",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                Welcome back, {session?.user?.name}! 👋
              </h1>
              <p className="text-neutral-600">
                Here's your schedule and earnings overview
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {profile?.specialty}
                </h2>
                <p className="text-purple-100 mb-2">
                  {profile?.experience} experience
                </p>
                <p className="text-purple-100 mb-4">
                  {profile?.city}, {profile?.state}
                </p>
                <div className="flex items-center gap-4">
                  {profile?.verified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 rounded-full text-sm font-semibold">
                      ✓ Verified Mechanic
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 rounded-full text-sm font-semibold">
                      ⏳ Pending Verification
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                    ₦{profile?.hourlyRate?.toLocaleString()}/hr
                  </span>
                </div>
              </div>
              <Link
                href="/dashboard/mechanic/settings"
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
              >
                <Cog6ToothIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-neutral-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              Recent Bookings
            </h2>
            <Link
              href="/dashboard/mechanic/bookings"
              className="text-purple-600 font-semibold hover:text-purple-700"
            >
              View All
            </Link>
          </div>

          {profile?.bookings && profile.bookings.length > 0 ? (
            <div className="space-y-4">
              {profile.bookings.slice(0, 5).map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-6 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-neutral-900">
                        {booking.user.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-1">
                      {booking.carModel}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {booking.service}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-neutral-600 mb-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(booking.appointmentDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <ClockIcon className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(booking.appointmentDate).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-neutral-900 mb-2">
                No bookings yet
              </p>
              <p className="text-neutral-600">
                Bookings will appear here once customers book your services
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
