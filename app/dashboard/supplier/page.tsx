// app/dashboard/supplier/page.tsx (with orders management)
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  CubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
  stock: number;
  createdAt: string;
}

interface Order {
  id: string;
  trackingId: string;
  status: string;
  total: number;
  supplierTotal: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: any[];
  shippingAddress: any;
}

const STATUS_COLORS: any = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export default function SupplierDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

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

    checkAndFetchProfile();
  }, [session, status, router]);

  const checkAndFetchProfile = async () => {
    try {
      const res = await fetch("/api/onboarding/supplier");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();

      if (!data.hasProfile) {
        router.push("/onboarding/supplier");
        return;
      }

      setProfile(data.supplierProfile);
      await Promise.all([fetchProducts(), fetchOrders()]);
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/supplier/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/supplier/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/supplier/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Product deleted successfully");
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setDeleteModal(null);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting");
    }
  };

  const handleOrderStatusUpdate = async (
    orderId: string,
    newStatus: string
  ) => {
    try {
      const res = await fetch(`/api/supplier/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast.success("Order status updated successfully");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const orderStats = {
    pending: orders.filter((o) => o.status === "PENDING").length,
    confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
    shipped: orders.filter((o) => o.status === "SHIPPED").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
  };

  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.supplierTotal, 0);

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: ShoppingBagIcon,
      color: "blue",
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: ChartBarIcon,
      color: "green",
    },
    {
      label: "Revenue",
      value: `₦${totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: "purple",
    },
    {
      label: "Pending Orders",
      value: orderStats.pending,
      icon: ClockIcon,
      color: "orange",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
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
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">
                Welcome back, {session?.user?.name}! 👋
              </h1>
              <p className="text-lg text-neutral-600">
                Manage your store and orders
              </p>
            </div>
            <Link
              href="/dashboard/supplier/settings"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border-2 border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <Cog6ToothIcon className="h-5 w-5" />
              Settings
            </Link>
          </div>

          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {profile?.businessName || "Your Business"}
                </h2>
                <p className="text-blue-100 mb-4 text-lg">
                  {profile?.city && profile?.state
                    ? `${profile.city}, ${profile.state}`
                    : "Nigeria"}
                </p>
                {profile?.approved ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold shadow-lg">
                    <ShoppingBagIcon className="h-4 w-4" />✓ Verified Supplier
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 rounded-full text-sm font-bold shadow-lg">
                    ⏳ Pending Verification
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
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

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "products"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-blue-300"
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "orders"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-blue-300"
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                  Product Inventory
                </h2>
                <p className="text-neutral-600">
                  Manage your auto parts listings
                </p>
              </div>
              <Link
                href="/dashboard/supplier/products/new"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                Add Product
              </Link>
            </div>

            {products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group flex flex-col md:flex-row items-start md:items-center gap-4 p-6 bg-gradient-to-r from-neutral-50 to-white border-2 border-neutral-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="relative w-24 h-24 bg-neutral-200 rounded-xl overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <CubeIcon className="h-12 w-12 text-neutral-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-neutral-900 mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                        {product.description || "No description"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                          {product.category}
                        </span>
                        <span className="text-neutral-600">
                          Stock:{" "}
                          <span className="font-bold">{product.stock}</span>
                        </span>
                        <span className="text-neutral-600">
                          Price:{" "}
                          <span className="font-bold text-green-600">
                            ₦{product.price.toLocaleString()}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/shop/${product.slug}`}
                        className="p-2.5 bg-white border-2 border-neutral-200 text-neutral-600 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all"
                        title="View Product"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/dashboard/supplier/products/${product.id}/edit`}
                        className="p-2.5 bg-white border-2 border-neutral-200 text-neutral-600 rounded-xl hover:border-green-300 hover:text-green-600 transition-all"
                        title="Edit Product"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => setDeleteModal(product.id)}
                        className="p-2.5 bg-white border-2 border-neutral-200 text-neutral-600 rounded-xl hover:border-red-300 hover:text-red-600 transition-all"
                        title="Delete Product"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <CubeIcon className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
                <p className="text-2xl font-bold text-neutral-900 mb-2">
                  No products yet
                </p>
                <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                  Start growing your business by adding your first product
                </p>
                <Link
                  href="/dashboard/supplier/products/new"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all"
                >
                  <PlusIcon className="h-6 w-6" />
                  Add Your First Product
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-lg">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Customer Orders
            </h2>

            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 bg-neutral-50 border-2 border-neutral-200 rounded-xl hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-1">
                          Order #{order.trackingId}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Customer: {order.user.name}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {order.items.length} item(s) • ₦
                          {order.supplierTotal.toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                          STATUS_COLORS[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-semibold text-neutral-600">
                          Delivery Address
                        </p>
                        <p className="text-neutral-900">
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-600">
                          Order Date
                        </p>
                        <p className="text-neutral-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {order.status === "PENDING" && (
                        <>
                          <button
                            onClick={() =>
                              handleOrderStatusUpdate(order.id, "CONFIRMED")
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                            Confirm Order
                          </button>
                          <button
                            onClick={() =>
                              handleOrderStatusUpdate(order.id, "CANCELLED")
                            }
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-colors flex items-center gap-2"
                          >
                            <XCircleIcon className="h-5 w-5" />
                            Cancel
                          </button>
                        </>
                      )}

                      {order.status === "CONFIRMED" && (
                        <button
                          onClick={() =>
                            handleOrderStatusUpdate(order.id, "SHIPPED")
                          }
                          className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <TruckIcon className="h-5 w-5" />
                          Mark as Shipped
                        </button>
                      )}

                      {order.status === "SHIPPED" && (
                        <button
                          onClick={() =>
                            handleOrderStatusUpdate(order.id, "DELIVERED")
                          }
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                          Mark as Delivered
                        </button>
                      )}

                      <Link
                        href={`/track/${order.trackingId}`}
                        className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-2"
                      >
                        <EyeIcon className="h-5 w-5" />
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <ShoppingBagIcon className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
                <p className="text-2xl font-bold text-neutral-900 mb-2">
                  No orders yet
                </p>
                <p className="text-neutral-600">
                  Orders from customers will appear here
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 text-center mb-2">
              Delete Product?
            </h3>
            <p className="text-neutral-600 text-center mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteModal)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:shadow-xl transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
