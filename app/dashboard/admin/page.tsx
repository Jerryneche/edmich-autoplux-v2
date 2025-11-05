"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  CheckCircleIcon,
  XCircleIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  PlusIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";

interface Supplier {
  id: string;
  businessName: string;
  city: string;
  state: string;
  verified: boolean;
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: { name: string };
}

interface Booking {
  id: string;
  carModel: string;
  service: string;
  status: string;
  appointmentDate: string;
  user: { name: string };
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  supplier: { businessName: string };
}

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalBookings: number;
  totalProducts: number;
  totalSuppliers: number;
  pendingSuppliers: number;
  chartData: { month: string; revenue: number }[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchAllData();
  }, [session, status, router]);

  const fetchAllData = async () => {
    try {
      const [supRes, ordRes, bookRes, prodRes, anaRes] = await Promise.all([
        fetch("/api/admin/suppliers"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/bookings"),
        fetch("/api/admin/products"),
        fetch("/api/admin/analytics"),
      ]);

      if (supRes.ok) setSuppliers(await supRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
      if (bookRes.ok) setBookings(await bookRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (anaRes.ok) setAnalytics(await anaRes.json());
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const approveSupplier = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/suppliers/${id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Supplier approved");
        fetchAllData();
      }
    } catch (err) {
      toast.error("Failed to approve");
    }
  };

  const rejectSupplier = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/suppliers/${id}/reject`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Supplier rejected");
        fetchAllData();
      }
    } catch (err) {
      toast.error("Failed to reject");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Product deleted");
        fetchAllData();
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-neutral-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
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
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            AutoPlux Manager
          </h1>
          <p className="text-neutral-600">
            Manage suppliers, orders, bookings, and products
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {["overview", "suppliers", "orders", "bookings", "products"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white border-2 border-neutral-200 text-neutral-700 hover:border-blue-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && analytics && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    +12%
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-neutral-900">
                  ₦{analytics.totalRevenue.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    +8%
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {analytics.totalOrders}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <WrenchScrewdriverIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    +15%
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {analytics.totalBookings}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <UserGroupIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="text-sm font-semibold text-yellow-600">
                    Pending
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-1">
                  Pending Suppliers
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {analytics.pendingSuppliers}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl transition-all md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-1">Revenue Trend</p>
                <div className="h-32">
                  {/* Add Recharts later */}
                  <div className="text-center text-neutral-400 mt-8">
                    Chart coming soon
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SUPPLIERS */}
        {activeTab === "suppliers" && (
          <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">
                Pending Suppliers
              </h2>
              <Link
                href="/dashboard/admin/suppliers"
                className="text-blue-600 font-semibold"
              >
                View All
              </Link>
            </div>
            {suppliers.filter((s) => !s.verified).length === 0 ? (
              <p className="text-center text-neutral-500 py-8">
                No pending suppliers
              </p>
            ) : (
              <div className="space-y-4">
                {suppliers
                  .filter((s) => !s.verified)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl"
                    >
                      <div>
                        <p className="font-bold text-neutral-900">
                          {s.businessName}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {s.city}, {s.state}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveSupplier(s.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectSupplier(s.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">
                Recent Orders
              </h2>
              <Link
                href="/dashboard/admin/orders"
                className="text-blue-600 font-semibold"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {orders.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl"
                >
                  <div>
                    <p className="font-mono text-sm font-bold">
                      #{o.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-neutral-600">{o.user.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₦{o.total.toLocaleString()}</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">
                Recent Bookings
              </h2>
              <Link
                href="/dashboard/admin/bookings"
                className="text-blue-600 font-semibold"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {bookings.slice(0, 5).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl"
                >
                  <div>
                    <p className="font-bold">{b.carModel}</p>
                    <p className="text-sm text-neutral-600">
                      {b.user.name} • {b.service}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600">
                      {format(new Date(b.appointmentDate), "MMM d, h:mm a")}
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === "products" && (
          <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">
                All Products
              </h2>
              <Link
                href="/dashboard/admin/products/new"
                className="text-blue-600 font-semibold"
              >
                Add Product
              </Link>
            </div>
            <div className="space-y-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl"
                >
                  <div>
                    <p className="font-bold">{p.name}</p>
                    <p className="text-sm text-neutral-600">
                      {p.supplier.businessName}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold">₦{p.price.toLocaleString()}</p>
                    <p className="text-sm text-neutral-600">Stock: {p.stock}</p>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    map[status.toUpperCase()] ||
    "bg-neutral-100 text-neutral-800 border-neutral-200"
  );
}
