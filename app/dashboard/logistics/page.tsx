"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  TruckIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function LogisticsDashboard() {
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

    if (session.user.role !== "LOGISTICS") {
      router.push("/dashboard");
      return;
    }

    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/onboarding/logistics");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.logisticsProfile);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Deliveries",
      value: profile?.deliveries?.length || 0,
      icon: TruckIcon,
      color: "green",
      change: "+20%",
    },
    {
      label: "Active Deliveries",
      value: "12",
      icon: MapPinIcon,
      color: "blue",
      change: "+5",
    },
    {
      label: "Total Revenue",
      value: "₦580,000",
      icon: CurrencyDollarIcon,
      color: "purple",
      change: "+32%",
    },
    {
      label: "Completed",
      value: "156",
      icon: CheckCircleIcon,
      color: "emerald",
      change: "+28%",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PICKED_UP":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "OUT_FOR_DELIVERY":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
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
                Manage your deliveries and track your revenue
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {profile?.companyName}
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile?.vehicleTypes?.map((vehicle: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold"
                    >
                      {vehicle}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  {profile?.verified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 rounded-full text-sm font-semibold">
                      ✓ Verified Provider
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 rounded-full text-sm font-semibold">
                      ⏳ Pending Verification
                    </span>
                  )}
                  {profile?.available && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Available
                    </span>
                  )}
                </div>
              </div>
              <Link
                href="/dashboard/logistics/settings"
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

        {/* Coverage Areas */}
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Coverage Areas
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile?.coverageAreas?.map((area: string, i: number) => (
              <span
                key={i}
                className="px-4 py-2 bg-green-50 border border-green-200 text-green-800 rounded-lg font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Deliveries */}
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              Recent Deliveries
            </h2>
            <Link
              href="/dashboard/logistics/deliveries"
              className="text-green-600 font-semibold hover:text-green-700"
            >
              View All
            </Link>
          </div>

          {profile?.deliveries && profile.deliveries.length > 0 ? (
            <div className="space-y-4">
              {profile.deliveries.slice(0, 5).map((delivery: any) => (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between p-6 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-sm font-bold text-neutral-900">
                        {delivery.trackingNumber}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          delivery.status
                        )}`}
                      >
                        {getStatusLabel(delivery.status)}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Pickup</p>
                        <div className="flex items-start gap-2">
                          <MapPinIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-neutral-900 font-medium">
                            {delivery.pickup}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Dropoff</p>
                        <div className="flex items-start gap-2">
                          <MapPinIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-neutral-900 font-medium">
                            {delivery.dropoff}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <p className="text-sm text-neutral-600 mb-1">
                      {delivery.vehicle}
                    </p>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <ClockIcon className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(delivery.deliveryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TruckIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-neutral-900 mb-2">
                No deliveries yet
              </p>
              <p className="text-neutral-600">
                Delivery requests will appear here
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
