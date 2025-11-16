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
  PlusIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
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
  approved: boolean;
  createdAt: string;
  user: { email: string };
}

interface Order {
  id: string;
  trackingId: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  user: { name: string; email: string };
  items: { quantity: number }[];
}

interface Booking {
  id: string;
  carModel: string;
  service: string;
  status: string;
  appointmentDate: string;
  user: { name: string; email: string };
  mechanic?: { businessName: string };
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  category: string;
  supplier: { businessName: string };
  createdAt: string;
}

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalBookings: number;
  totalProducts: number;
  totalSuppliers: number;
  pendingSuppliers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  activeUsers: number;
  lowStockProducts: number;
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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

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
    setIsLoading(true);
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
      console.error(err);
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
      } else {
        throw new Error("Failed to approve");
      }
    } catch (err) {
      toast.error("Failed to approve supplier");
    }
  };

  const rejectSupplier = async (id: string) => {
    if (!confirm("Are you sure you want to reject this supplier?")) return;
    try {
      const res = await fetch(`/api/admin/suppliers/${id}/reject`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Supplier rejected");
        fetchAllData();
      } else {
        throw new Error("Failed to reject");
      }
    } catch (err) {
      toast.error("Failed to reject supplier");
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success("Order status updated");
        fetchAllData();
      }
    } catch (err) {
      toast.error("Failed to update order");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Product deleted");
        fetchAllData();
      }
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  // Filter functions
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.trackingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-neutral-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        {/* Header with Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-neutral-600">
              Welcome back, {session?.user?.name} • Manage your platform
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchAllData}
              className="px-4 py-2 bg-white border-2 border-neutral-200 rounded-xl font-semibold hover:border-blue-300 transition-all flex items-center gap-2"
            >
              <ArrowTrendingUpIcon className="h-5 w-5" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-2 mb-8 flex flex-wrap gap-2">
          {[
            { id: "overview", label: "Overview", icon: ChartBarIcon },
            { id: "suppliers", label: "Suppliers", icon: UserGroupIcon },
            { id: "orders", label: "Orders", icon: ShoppingBagIcon },
            { id: "bookings", label: "Bookings", icon: WrenchScrewdriverIcon },
            { id: "products", label: "Products", icon: TruckIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <ArrowTrendingUpIcon className="h-4 w-4" />
                    <span className="text-sm font-bold">
                      {analytics.revenueGrowth}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-neutral-900">
                  ₦{analytics.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  From {analytics.totalOrders} orders
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ShoppingBagIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <ArrowTrendingUpIcon className="h-4 w-4" />
                    <span className="text-sm font-bold">
                      {analytics.ordersGrowth}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {analytics.totalOrders}
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  {orders.filter((o) => o.status === "PENDING").length} pending
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {analytics.totalBookings}
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  {bookings.filter((b) => b.status === "PENDING").length}{" "}
                  pending
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  {analytics.pendingSuppliers > 0 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                      {analytics.pendingSuppliers} pending
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-600 mb-1">Total Suppliers</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {analytics.totalSuppliers}
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  {suppliers.filter((s) => s.verified).length} verified
                </p>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-blue-900">
                    Active Users
                  </p>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-3xl font-bold text-blue-900">
                  {analytics.activeUsers}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
                <p className="text-sm font-semibold text-purple-900 mb-2">
                  Total Products
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {analytics.totalProducts}
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-200">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  Low Stock Alert
                </p>
                <p className="text-3xl font-bold text-red-900">
                  {analytics.lowStockProducts}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  Pending Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("suppliers");
                    }}
                    className="flex items-center justify-between p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <ClockIcon className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">
                          Pending Suppliers
                        </p>
                        <p className="text-sm text-neutral-600">
                          {analytics.pendingSuppliers} awaiting approval
                        </p>
                      </div>
                    </div>
                    <ArrowTrendingUpIcon className="h-5 w-5 text-yellow-600" />
                  </Link>

                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("orders");
                    }}
                    className="flex items-center justify-between p-3 bg-blue-50 border-2 border-blue-200 rounded-xl hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingBagIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">
                          Pending Orders
                        </p>
                        <p className="text-sm text-neutral-600">
                          {orders.filter((o) => o.status === "PENDING").length}{" "}
                          orders to process
                        </p>
                      </div>
                    </div>
                    <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600" />
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
                    >
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">
                          New order #{order.trackingId.slice(-6)}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {order.user.name} •{" "}
                          {format(new Date(order.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-neutral-900">
                        ₦{order.total.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* SUPPLIERS TAB */}
        {activeTab === "suppliers" && (
          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="bg-white rounded-2xl p-4 border-2 border-neutral-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search suppliers by name, city..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Suppliers List */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden">
              <div className="p-6 border-b-2 border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900">
                  All Suppliers ({suppliers.length})
                </h2>
              </div>
              <div className="divide-y-2 divide-neutral-100">
                {suppliers
                  .filter((s) => {
                    const matchesSearch =
                      s.businessName
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      s.city.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesStatus =
                      statusFilter === "all" ||
                      (statusFilter === "pending" && !s.verified) ||
                      (statusFilter === "verified" && s.verified);
                    return matchesSearch && matchesStatus;
                  })
                  .map((supplier) => (
                    <div
                      key={supplier.id}
                      className="p-6 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-neutral-900">
                              {supplier.businessName}
                            </h3>
                            {supplier.verified ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border-2 border-green-200">
                                ✓ Verified
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full border-2 border-yellow-200">
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-neutral-600">
                            <p>
                              📍 {supplier.city}, {supplier.state}
                            </p>
                            <p>✉️ {supplier.user.email}</p>
                            <p className="text-xs">
                              Joined{" "}
                              {format(
                                new Date(supplier.createdAt),
                                "MMM d, yyyy"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {!supplier.verified && (
                            <>
                              <button
                                onClick={() => approveSupplier(supplier.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => rejectSupplier(supplier.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                              >
                                <XCircleIcon className="h-4 w-4" />
                                Reject
                              </button>
                            </>
                          )}
                          <Link
                            href={`/dashboard/admin/suppliers/${supplier.id}`}
                            className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors text-center flex items-center gap-2"
                          >
                            <EyeIcon className="h-4 w-4" />
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="bg-white rounded-2xl p-4 border-2 border-neutral-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by tracking ID, customer name..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden">
              <div className="p-6 border-b-2 border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900">
                  All Orders ({filteredOrders.length})
                </h2>
              </div>
              <div className="divide-y-2 divide-neutral-100">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-mono text-sm font-bold text-blue-600">
                            {order.trackingId}
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-neutral-900 font-semibold">
                            {order.user.name}
                          </p>
                          <p className="text-neutral-600">{order.user.email}</p>
                          <p className="text-neutral-500">
                            {order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )}{" "}
                            items • {order.paymentMethod}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {format(
                              new Date(order.createdAt),
                              "MMM d, yyyy h:mm a"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <p className="text-2xl font-bold text-neutral-900">
                          ₦{order.total.toLocaleString()}
                        </p>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className="px-4 py-2 border-2 border-neutral-200 rounded-xl font-semibold text-sm focus:border-blue-500 focus:outline-none"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <Link
                          href={`/dashboard/admin/orders/${order.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <div className="p-12 text-center text-neutral-500">
                    No orders found matching your criteria
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 border-2 border-neutral-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search bookings..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden">
              <div className="p-6 border-b-2 border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900">
                  All Bookings ({bookings.length})
                </h2>
              </div>
              <div className="divide-y-2 divide-neutral-100">
                {bookings
                  .filter((booking) => {
                    const matchesSearch =
                      booking.carModel
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      booking.user.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());
                    const matchesStatus =
                      statusFilter === "all" || booking.status === statusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map((booking) => (
                    <div
                      key={booking.id}
                      className="p-6 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-neutral-900">
                              {booking.carModel}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-neutral-900 font-semibold">
                              {booking.user.name} • {booking.service}
                            </p>
                            <p className="text-neutral-600">
                              {booking.user.email}
                            </p>
                            {booking.mechanic && (
                              <p className="text-purple-600 font-medium">
                                Assigned: {booking.mechanic.businessName}
                              </p>
                            )}
                            <p className="text-neutral-500">
                              {format(
                                new Date(booking.appointmentDate),
                                "MMM d, yyyy h:mm a"
                              )}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/admin/bookings/${booking.id}`}
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                {bookings.length === 0 && (
                  <div className="p-12 text-center text-neutral-500">
                    No bookings found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 border-2 border-neutral-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products by name, category..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <Link
                  href="/dashboard/admin/products/new"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Product
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden">
              <div className="p-6 border-b-2 border-neutral-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-900">
                  All Products ({filteredProducts.length})
                </h2>
                <div className="text-sm text-neutral-600">
                  {products.filter((p) => p.stock < 10).length} low stock
                </div>
              </div>
              <div className="divide-y-2 divide-neutral-100">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-6 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-neutral-900">
                            {product.name}
                          </h3>
                          <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-full">
                            {product.category}
                          </span>
                          {product.stock < 10 && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                              Low Stock
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-neutral-600">
                            Supplier: {product.supplier.businessName}
                          </p>
                          <p className="text-neutral-500">
                            Stock: {product.stock} units
                          </p>
                          <p className="text-xs text-neutral-400">
                            Added{" "}
                            {format(new Date(product.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <p className="text-2xl font-bold text-neutral-900">
                          ₦{product.price.toLocaleString()}
                        </p>
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/admin/products/${product.id}/edit`}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-colors flex items-center gap-2"
                          >
                            <PencilIcon className="h-4 w-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-colors flex items-center gap-2"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="p-12 text-center text-neutral-500">
                    No products found matching your criteria
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function getStatusColor(status: string) {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    IN_PROGRESS: "bg-purple-100 text-purple-800 border-purple-200",
    SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    ACTIVE: "bg-green-100 text-green-800 border-green-200",
    INACTIVE: "bg-neutral-100 text-neutral-800 border-neutral-200",
  };
  return (
    statusColors[status.toUpperCase()] ||
    "bg-neutral-100 text-neutral-800 border-neutral-200"
  );
}
