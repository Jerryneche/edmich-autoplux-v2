"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  TruckIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

interface Delivery {
  id: string;
  trackingNumber: string;
  packageType: string;
  pickupAddress: string;
  pickupCity: string;
  deliveryAddress: string;
  deliveryCity: string;
  status: string;
  estimatedPrice: number;
  createdAt: string;
  user: {
    name: string | null;
    phone: string | null;
  };
}

export default function LogisticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "PENDING" | "IN_PROGRESS" | "COMPLETED"
  >("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      if (session.user.role !== "LOGISTICS") {
        router.push("/dashboard");
        return;
      }
      fetchDeliveries();
    }
  }, [status, session, router, filter]);

  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ view: "provider" });
      if (filter !== "all") params.append("status", filter);

      const response = await fetch(
        `/api/bookings/logistics?${params.toString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setDeliveries(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);
      toast.error("Failed to load deliveries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (deliveryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/logistics/${deliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Status updated!");
        fetchDeliveries();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter((d) => d.status === "PENDING").length,
    inProgress: deliveries.filter((d) => d.status === "IN_PROGRESS").length,
    completed: deliveries.filter((d) => d.status === "COMPLETED").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  if (isLoading || status === "loading") {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            My Deliveries
          </h1>
          <p className="text-neutral-600">Manage your delivery orders</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
            <p className="text-sm text-neutral-600 mb-1">Total Deliveries</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-yellow-200">
            <p className="text-sm text-neutral-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-blue-200">
            <p className="text-sm text-neutral-600 mb-1">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.inProgress}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
            <p className="text-sm text-neutral-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.completed}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-4 mb-8">
          <div className="flex gap-3">
            {["all", "PENDING", "IN_PROGRESS", "COMPLETED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {status === "all" ? "All" : status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Deliveries List */}
        {deliveries.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-12 text-center">
            <TruckIcon className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
            <p className="text-2xl font-bold text-neutral-900 mb-2">
              No deliveries found
            </p>
            <p className="text-neutral-600">Customer orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-white rounded-2xl border-2 border-neutral-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-mono text-sm font-bold text-blue-600 mb-1">
                      {delivery.trackingNumber}
                    </p>
                    <h3 className="text-xl font-bold text-neutral-900">
                      {delivery.packageType}
                    </h3>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(
                      delivery.status
                    )}`}
                  >
                    {delivery.status.replace("_", " ")}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-neutral-600 mb-1">
                      Pickup
                    </p>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-blue-600" />
                      <p className="text-neutral-900">
                        {delivery.pickupAddress}, {delivery.pickupCity}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-600 mb-1">
                      Delivery
                    </p>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-green-600" />
                      <p className="text-neutral-900">
                        {delivery.deliveryAddress}, {delivery.deliveryCity}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                  <div>
                    <p className="text-sm text-neutral-600">
                      Customer: {delivery.user?.name || "N/A"}
                    </p>
                    <p className="text-sm text-neutral-600">
                      Price: ₦{delivery.estimatedPrice.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {delivery.status === "PENDING" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(delivery.id, "IN_PROGRESS")
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                      >
                        Start Delivery
                      </button>
                    )}
                    {delivery.status === "IN_PROGRESS" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(delivery.id, "COMPLETED")
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
