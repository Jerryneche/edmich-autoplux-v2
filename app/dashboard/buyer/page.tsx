"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  ShoppingBagIcon,
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function BuyerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "BUYER") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  const stats = [
    {
      label: "Total Orders",
      value: "8",
      icon: ShoppingBagIcon,
      color: "blue",
    },
    {
      label: "Active Orders",
      value: "2",
      icon: ClockIcon,
      color: "orange",
    },
    {
      label: "Completed",
      value: "6",
      icon: CheckCircleIcon,
      color: "green",
    },
    {
      label: "Saved Items",
      value: "12",
      icon: HeartIcon,
      color: "red",
    },
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      product: "Premium Brake Pads Set",
      supplier: "AutoParts Nigeria",
      amount: "₦15,000",
      status: "Delivered",
      date: "2024-01-15",
    },
    {
      id: "ORD-002",
      product: "Engine Oil Filter",
      supplier: "Quality Motors",
      amount: "₦8,500",
      status: "In Transit",
      date: "2024-01-18",
    },
    {
      id: "ORD-003",
      product: "Spark Plugs Set",
      supplier: "AutoParts Nigeria",
      amount: "₦18,000",
      status: "Processing",
      date: "2024-01-20",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Transit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

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
                Here's what's happening with your orders
              </p>
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
              </div>
              <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-neutral-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/shop"
            className="group bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-blue-500 hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              Browse Products
            </h3>
            <p className="text-neutral-600 mb-4">
              Find auto parts from verified suppliers
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-semibold">
              <span>Shop Now</span>
              <ShoppingBagIcon className="h-4 w-4" />
            </div>
          </Link>

          <Link
            href="/business/mechanics"
            className="group bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-purple-500 hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <WrenchScrewdriverIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              Book Mechanic
            </h3>
            <p className="text-neutral-600 mb-4">
              Find certified mechanics near you
            </p>
            <div className="flex items-center gap-2 text-purple-600 font-semibold">
              <span>Find Mechanics</span>
              <WrenchScrewdriverIcon className="h-4 w-4" />
            </div>
          </Link>

          <Link
            href="/business/logistics/track"
            className="group bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-green-500 hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TruckIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              Track Delivery
            </h3>
            <p className="text-neutral-600 mb-4">
              Track your orders in real-time
            </p>
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <span>Track Now</span>
              <TruckIcon className="h-4 w-4" />
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              Recent Orders
            </h2>
            <Link
              href="/dashboard/buyer/orders"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              View All
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-6 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-bold text-neutral-900">
                        {order.id}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-neutral-900 mb-1">
                      {order.product}
                    </h3>
                    <p className="text-sm text-neutral-600">{order.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neutral-900 text-lg mb-1">
                      {order.amount}
                    </p>
                    <p className="text-sm text-neutral-600">{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBagIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-neutral-900 mb-2">
                No orders yet
              </p>
              <p className="text-neutral-600 mb-6">
                Start shopping for auto parts
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
