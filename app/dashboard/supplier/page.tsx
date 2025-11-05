"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  ShoppingBagIcon,
  PlusIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowRightIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function SupplierDashboard() {
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

    if (session.user.role !== "SUPPLIER") {
      router.push("/dashboard");
      return;
    }

    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/onboarding/supplier");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.supplierProfile);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Products",
      value: profile?.products?.length || 0,
      icon: ShoppingBagIcon,
      color: "blue",
      change: "+12%",
    },
    {
      label: "Total Orders",
      value: "24",
      icon: ChartBarIcon,
      color: "green",
      change: "+18%",
    },
    {
      label: "Revenue",
      value: "₦450,000",
      icon: CurrencyDollarIcon,
      color: "purple",
      change: "+25%",
    },
    {
      label: "Customers",
      value: "156",
      icon: UserGroupIcon,
      color: "orange",
      change: "+8%",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
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
                Here's what's happening with your store today
              </p>
            </div>
          </div>

          {/* Business Info Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {profile?.businessName}
                </h2>
                <p className="text-blue-100 mb-4">
                  {profile?.city}, {profile?.state}
                </p>
                {profile?.verified ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 rounded-full text-sm font-semibold">
                    ✓ Verified Supplier
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 rounded-full text-sm font-semibold">
                    ⏳ Pending Verification
                  </span>
                )}
              </div>
              <Link
                href="/dashboard/supplier/settings"
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dashboard/supplier/products/new"
            className="group bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-blue-500 hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PlusIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              Add New Product
            </h3>
            <p className="text-neutral-600 mb-4">
              List a new auto part for sale
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-semibold">
              <span>Add Product</span>
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/dashboard/supplier/products"
            className="group bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-purple-500 hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              Manage Products
            </h3>
            <p className="text-neutral-600 mb-4">View and edit your listings</p>
            <div className="flex items-center gap-2 text-purple-600 font-semibold">
              <span>View All</span>
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/dashboard/supplier/orders"
            className="group bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-green-500 hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              View Orders
            </h3>
            <p className="text-neutral-600 mb-4">
              Check pending and completed orders
            </p>
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <span>View Orders</span>
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              Recent Products
            </h2>
            <Link
              href="/dashboard/supplier/products"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              View All
            </Link>
          </div>

          {profile?.products && profile.products.length > 0 ? (
            <div className="space-y-4">
              {profile.products.slice(0, 5).map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center">
                      <ShoppingBagIcon className="h-8 w-8 text-neutral-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neutral-900">
                      ₦{product.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {product.stock} in stock
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBagIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-neutral-900 mb-2">
                No products yet
              </p>
              <p className="text-neutral-600 mb-6">
                Start by adding your first product
              </p>
              <Link
                href="/dashboard/supplier/products/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                Add Product
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
