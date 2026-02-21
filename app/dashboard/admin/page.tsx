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
  EnvelopeIcon,
  ChartBarIcon,
  PlusIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
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
  createdAt?: string;
  user?: { email: string };
}

interface Mechanic {
  id: string;
  businessName: string;
  city: string;
  state: string;
  phone: string;
  specialization?: string;
  verified: boolean;
  approved: boolean;
  createdAt?: string;
  user?: { email: string; name: string };
}

interface LogisticsProvider {
  id: string;
  companyName: string;
  city: string;
  state: string;
  phone: string;
  vehicleType?: string;
  verified: boolean;
  approved: boolean;
  createdAt?: string;
  user?: { email: string; name: string };
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
  driver?: { companyName: string };
  type?: "MECHANIC" | "LOGISTICS";
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
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [logistics, setLogistics] = useState<LogisticsProvider[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState<any[]>([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Computed values with safe array checks
  const pendingMechanics = Array.isArray(mechanics)
    ? mechanics.filter((m) => !m.verified).length
    : 0;
  const pendingLogistics = Array.isArray(logistics)
    ? logistics.filter((l) => !l.verified).length
    : 0;

  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) => {
        const matchesSearch =
          order.trackingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        const matchesSearch =
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || product.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

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
      const [
        supRes,
        mechRes,
        logRes,
        ordRes,
        bookRes,
        prodRes,
        anaRes,
        contRes,
        paymentsRes,
        withdrawalsRes,
        usersRes,
      ] = await Promise.all([
        fetch("/api/admin/suppliers"),
        fetch("/api/admin/mechanics"),
        fetch("/api/admin/logistics"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/bookings"),
        fetch("/api/admin/products"),
        fetch("/api/admin/analytics"),
        fetch("/api/contact"),
        fetch("/api/admin/payments"),
        fetch("/api/admin/withdrawals"),
        fetch("/api/admin/users"),
      ]);

      if (supRes.ok) {
        const data = await supRes.json();
        if (Array.isArray(data)) setSuppliers(data);
      }
      if (mechRes.ok) {
        const data = await mechRes.json();
        if (Array.isArray(data)) setMechanics(data);
      }
      if (logRes.ok) {
        const data = await logRes.json();
        if (Array.isArray(data)) setLogistics(data);
      }
      if (ordRes.ok) {
        const data = await ordRes.json();
        if (Array.isArray(data)) setOrders(data);
      }
      if (bookRes.ok) {
        const data = await bookRes.json();
        if (Array.isArray(data)) setBookings(data);
      }
      if (prodRes.ok) {
        const data = await prodRes.json();
        if (Array.isArray(data)) setProducts(data);
      }
      if (anaRes.ok) setAnalytics(await anaRes.json());
      if (contRes.ok) {
        const data = await contRes.json();
        if (Array.isArray(data)) setContacts(data);
      }
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        if (Array.isArray(data)) setPayments(data);
      }
      if (withdrawalsRes.ok) {
        const data = await withdrawalsRes.json();
        if (Array.isArray(data)) setWithdrawals(data);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        if (Array.isArray(data)) setUsers(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Supplier approval functions
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
    const reason = prompt("Reason for rejection (optional):");
    try {
      const res = await fetch(`/api/admin/suppliers/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
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

  // Mechanic approval functions
  const approveMechanic = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/mechanics/${id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Mechanic approved");
        fetchAllData();
      } else {
        throw new Error("Failed to approve");
      }
    } catch (err) {
      toast.error("Failed to approve mechanic");
    }
  };

  const rejectMechanic = async (id: string) => {
    const reason = prompt("Reason for rejection (optional):");
    try {
      const res = await fetch(`/api/admin/mechanics/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        toast.success("Mechanic rejected");
        fetchAllData();
      } else {
        throw new Error("Failed to reject");
      }
    } catch (err) {
      toast.error("Failed to reject mechanic");
    }
  };

  // Logistics approval functions
  const approveLogistics = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/logistics/${id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Logistics provider approved");
        fetchAllData();
      } else {
        throw new Error("Failed to approve");
      }
    } catch (err) {
      toast.error("Failed to approve logistics provider");
    }
  };

  const rejectLogistics = async (id: string) => {
    const reason = prompt("Reason for rejection (optional):");
    try {
      const res = await fetch(`/api/admin/logistics/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        toast.success("Logistics provider rejected");
        fetchAllData();
      } else {
        throw new Error("Failed to reject");
      }
    } catch (err) {
      toast.error("Failed to reject logistics provider");
    }
  };

  // Order status update
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success("Order status updated");
        fetchAllData();
      } else {
        throw new Error("Failed to update");
      }
    } catch (err) {
      toast.error("Failed to update order status");
    }
  };

  // Delete product
  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Product deleted");
        fetchAllData();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Toaster position="top-center" />
      <Header />
      <section className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-neutral-600">
              Welcome back • Manage your platform
            </p>
          </div>
          <button
            onClick={fetchAllData}
            className="px-4 py-2 bg-white border-2 border-neutral-200 rounded-xl font-semibold hover:border-blue-300 transition-all flex items-center gap-2"
          >
            <ArrowTrendingUpIcon className="h-5 w-5" />
            Refresh Data
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-2 mb-8 flex flex-wrap gap-2">
          {[
            { id: "overview", label: "Overview", icon: ChartBarIcon },
            { id: "payments", label: "Payments", icon: CurrencyDollarIcon },
            {
              id: "withdrawals",
              label: "Withdrawals",
              icon: CurrencyDollarIcon,
            },
            { id: "users", label: "Users", icon: UserGroupIcon },
            {
              id: "suppliers",
              label: "Suppliers",
              icon: UserGroupIcon,
              badge: analytics?.pendingSuppliers || 0,
            },
            {
              id: "mechanics",
              label: "Mechanics",
              icon: WrenchScrewdriverIcon,
              badge: pendingMechanics || 0,
            },
            {
              id: "logistics",
              label: "Logistics",
              icon: TruckIcon,
              badge: pendingLogistics || 0,
            },
            { id: "orders", label: "Orders", icon: ShoppingBagIcon },
            { id: "bookings", label: "Bookings", icon: ClockIcon },
            { id: "products", label: "Products", icon: ShoppingBagIcon },
            {
              id: "contacts",
              label: "Contacts",
              icon: EnvelopeIcon,
              badge: Array.isArray(contacts)
                ? contacts.filter((c) => c.status === "NEW").length
                : 0,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white border-2 border-neutral-200 text-neutral-700 hover:border-blue-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
              {tab.badge && tab.badge > 0 ? (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && analytics && (
          <div className="space-y-6">
            {/* Pending Actions with Service Providers */}
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">
                Pending Approvals
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("suppliers");
                  }}
                  className="flex items-center justify-between p-4 bg-orange-50 border-2 border-orange-200 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">
                        Suppliers
                      </p>
                      <p className="text-sm text-neutral-600">
                        {analytics?.pendingSuppliers || 0} pending
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("mechanics");
                  }}
                  className="flex items-center justify-between p-4 bg-purple-50 border-2 border-purple-200 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <WrenchScrewdriverIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">
                        Mechanics
                      </p>
                      <p className="text-sm text-neutral-600">
                        {pendingMechanics} pending
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("logistics");
                  }}
                  className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TruckIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">
                        Logistics
                      </p>
                      <p className="text-sm text-neutral-600">
                        {pendingLogistics} pending
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Add your existing overview content here */}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === "payments" && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Payments Management</h2>
            <div className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {Array.isArray(payments) &&
                    payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {payment.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {payment.orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(
                              payment.status,
                            )}`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">
                          ₦{payment.amount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            onClick={async () => {
                              await fetch(
                                `/api/admin/payments?id=${payment.id}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ status: "PAID" }),
                                },
                              );
                              fetchAllData();
                            }}
                          >
                            Mark as PAID
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* WITHDRAWALS TAB */}
        {activeTab === "withdrawals" && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Withdrawals Management</h2>
            <div className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {Array.isArray(withdrawals) &&
                    withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {withdrawal.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {withdrawal.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(
                              withdrawal.status,
                            )}`}
                          >
                            {withdrawal.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">
                          ₦{withdrawal.amount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            onClick={async () => {
                              await fetch(
                                `/api/admin/withdrawals?id=${withdrawal.id}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ status: "credited" }),
                                },
                              );
                              fetchAllData();
                            }}
                          >
                            Mark as Credited
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Users Management</h2>
            <div className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {Array.isArray(users) &&
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {user.verified ? "✓ Yes" : "✗ No"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            onClick={async () => {
                              await fetch(`/api/admin/users?id=${user.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ verified: true }),
                              });
                              fetchAllData();
                            }}
                          >
                            Verify User
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SUPPLIERS TAB */}
        {activeTab === "suppliers" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 border-2 border-neutral-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search suppliers..."
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
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden">
              <div className="p-6 border-b-2 border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900">
                  All Suppliers ({suppliers.length})
                </h2>
              </div>
              <div className="divide-y-2 divide-neutral-100">
                {Array.isArray(suppliers) &&
                  suppliers
                    .filter((s) => {
                      const matchesSearch =
                        s.businessName
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        s.city
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase());
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
                              {supplier.user?.email && (
                                <p>✉️ {supplier.user.email}</p>
                              )}
                              {supplier.createdAt && (
                                <p className="text-xs">
                                  Joined{" "}
                                  {format(
                                    new Date(supplier.createdAt),
                                    "MMM d, yyyy",
                                  )}
                                </p>
                              )}
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
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        )}

        {/* MECHANICS TAB */}
        {activeTab === "mechanics" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 border-2 border-neutral-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search mechanics..."
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
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden">
              <div className="p-6 border-b-2 border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900">
                  All Mechanics ({mechanics.length})
                </h2>
              </div>
              <div className="divide-y-2 divide-neutral-100">
                {Array.isArray(mechanics) &&
                  mechanics
                    .filter((m) => {
                      const matchesSearch =
                        m.businessName
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        m.city
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase());
                      const matchesStatus =
                        statusFilter === "all" ||
                        (statusFilter === "pending" && !m.verified) ||
                        (statusFilter === "verified" && m.verified);
                      return matchesSearch && matchesStatus;
                    })
                    .map((mechanic) => (
                      <div
                        key={mechanic.id}
                        className="p-6 hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-neutral-900">
                                {mechanic.businessName}
                              </h3>
                              {mechanic.verified ? (
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
                                📍 {mechanic.city}, {mechanic.state}
                              </p>
                              <p>📞 {mechanic.phone}</p>
                              {mechanic.specialization && (
                                <p>🔧 {mechanic.specialization}</p>
                              )}
                              {mechanic.user?.email && (
                                <p>✉️ {mechanic.user.email}</p>
                              )}
                              {mechanic.createdAt && (
                                <p className="text-xs">
                                  Joined{" "}
                                  {format(
                                    new Date(mechanic.createdAt),
                                    "MMM d, yyyy",
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {!mechanic.verified && (
                              <>
                                <button
                                  onClick={() => approveMechanic(mechanic.id)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => rejectMechanic(mechanic.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                  Reject
                                </button>
                              </>
                            )}
                            <Link
                              href={`/dashboard/admin/mechanics/${mechanic.id}`}
                              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors text-center flex items-center gap-2"
                            >
                              <EyeIcon className="h-4 w-4" />
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                {(!Array.isArray(mechanics) ||
                  mechanics.filter((m) => {
                    const matchesSearch =
                      m.businessName
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      m.city?.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesStatus =
                      statusFilter === "all" ||
                      (statusFilter === "pending" && !m.verified) ||
                      (statusFilter === "verified" && m.verified);
                    return matchesSearch && matchesStatus;
                  }).length === 0) && (
                  <div className="p-12 text-center text-neutral-500">
                    No mechanics found matching your criteria
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LOGISTICS TAB */}
        {activeTab === "logistics" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 border-2 border-neutral-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logistics providers..."
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
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden">
              <div className="p-6 border-b-2 border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900">
                  All Logistics Providers ({logistics.length})
                </h2>
              </div>
              <div className="divide-y-2 divide-neutral-100">
                {Array.isArray(logistics) &&
                  logistics
                    .filter((l) => {
                      const matchesSearch =
                        l.companyName
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        l.city
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase());
                      const matchesStatus =
                        statusFilter === "all" ||
                        (statusFilter === "pending" && !l.verified) ||
                        (statusFilter === "verified" && l.verified);
                      return matchesSearch && matchesStatus;
                    })
                    .map((provider) => (
                      <div
                        key={provider.id}
                        className="p-6 hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-neutral-900">
                                {provider.companyName}
                              </h3>
                              {provider.verified ? (
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
                                📍 {provider.city}, {provider.state}
                              </p>
                              <p>📞 {provider.phone}</p>
                              {provider.vehicleType && (
                                <p>🚚 {provider.vehicleType}</p>
                              )}
                              {provider.user?.email && (
                                <p>✉️ {provider.user.email}</p>
                              )}
                              {provider.createdAt && (
                                <p className="text-xs">
                                  Joined{" "}
                                  {format(
                                    new Date(provider.createdAt),
                                    "MMM d, yyyy",
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {!provider.verified && (
                              <>
                                <button
                                  onClick={() => approveLogistics(provider.id)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => rejectLogistics(provider.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                  Reject
                                </button>
                              </>
                            )}
                            <Link
                              href={`/dashboard/admin/logistics/${provider.id}`}
                              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors text-center flex items-center gap-2"
                            >
                              <EyeIcon className="h-4 w-4" />
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                {(!Array.isArray(logistics) ||
                  logistics.filter((l) => {
                    const matchesSearch =
                      l.companyName
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      l.city?.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesStatus =
                      statusFilter === "all" ||
                      (statusFilter === "pending" && !l.verified) ||
                      (statusFilter === "verified" && l.verified);
                    return matchesSearch && matchesStatus;
                  }).length === 0) && (
                  <div className="p-12 text-center text-neutral-500">
                    No logistics providers found matching your criteria
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-6">
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
                              order.status,
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
                              0,
                            )}{" "}
                            items • {order.paymentMethod}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {format(
                              new Date(order.createdAt),
                              "MMM d, yyyy h:mm a",
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
                            handleStatusUpdate(order.id, e.target.value)
                          }
                          className="px-4 py-2 border-2 border-neutral-200 rounded-xl font-semibold text-sm focus:border-blue-500 focus:outline-none"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
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
                {Array.isArray(bookings) &&
                  bookings
                    .filter((booking) => {
                      const matchesSearch =
                        booking.carModel
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        booking.user?.name
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase());
                      const matchesStatus =
                        statusFilter === "all" ||
                        booking.status === statusFilter;
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
                                  booking.status,
                                )}`}
                              >
                                {booking.status}
                              </span>
                              {booking.type && (
                                <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-full">
                                  {booking.type}
                                </span>
                              )}
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
                                  Mechanic: {booking.mechanic.businessName}
                                </p>
                              )}
                              {booking.driver && (
                                <p className="text-green-600 font-medium">
                                  Driver: {booking.driver.companyName}
                                </p>
                              )}
                              <p className="text-neutral-500">
                                {format(
                                  new Date(booking.appointmentDate),
                                  "MMM d, yyyy h:mm a",
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
                {(!Array.isArray(bookings) ||
                  bookings.filter((booking) => {
                    const matchesSearch =
                      booking.carModel
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      booking.user?.name
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase());
                    const matchesStatus =
                      statusFilter === "all" || booking.status === statusFilter;
                    return matchesSearch && matchesStatus;
                  }).length === 0) && (
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

        {/* CONTACTS TAB */}
        {activeTab === "contacts" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <EnvelopeIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-neutral-900 mb-4">
                Contact Submissions
              </h3>
              <p className="text-lg text-neutral-600 mb-2">
                {contacts.length} total contacts
              </p>
              <p className="text-sm text-neutral-500 mb-8">
                {Array.isArray(contacts)
                  ? contacts.filter((c) => c.status === "NEW").length
                  : 0}{" "}
                new •{" "}
                {Array.isArray(contacts)
                  ? contacts.filter((c) => c.status === "REPLIED").length
                  : 0}{" "}
                replied •{" "}
                {Array.isArray(contacts)
                  ? contacts.filter((c) => c.status === "RESOLVED").length
                  : 0}{" "}
                resolved
              </p>
              <Link
                href="/dashboard/admin/contacts"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all"
              >
                <EyeIcon className="h-5 w-5" />
                View All Contacts
              </Link>
            </div>

            {/* Recent Contacts Preview */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden">
              <div className="p-6 border-b-2 border-neutral-200">
                <h3 className="text-xl font-bold text-neutral-900">
                  Recent Submissions
                </h3>
              </div>
              <div className="divide-y-2 divide-neutral-100">
                {Array.isArray(contacts) &&
                  contacts.slice(0, 5).map((contact: any) => (
                    <div
                      key={contact.id}
                      className="p-4 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-neutral-900">
                              {contact.name}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                contact.status === "NEW"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : contact.status === "REPLIED"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {contact.status}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600">
                            {contact.subject}
                          </p>
                        </div>
                        <Link
                          href={`/dashboard/admin/contacts/${contact.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                {(!Array.isArray(contacts) || contacts.length === 0) && (
                  <div className="p-12 text-center text-neutral-500">
                    No contact submissions yet
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
