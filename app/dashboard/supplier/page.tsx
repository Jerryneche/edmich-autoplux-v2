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
  ExclamationTriangleIcon,
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
  PROCESSING: "bg-purple-100 text-purple-800 border-purple-200",
  SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-200",
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
    checkInventory();
  }, [session, status, router]);
  const checkAndFetchProfile = async () => {
    try {
      const res = await fetch("/api/onboarding/supplier");
      if (!res.ok) {
        if (res.status === 404) {
          // No profile found, redirect to onboarding
          router.push("/onboarding/supplier");
          return;
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();

      if (!data.hasProfile) {
        router.push("/onboarding/supplier");
        return;
      }

      setProfile(data.supplierProfile);

      // Fetch products and orders in parallel, but don't fail if they error
      await Promise.allSettled([fetchProducts(), fetchOrders()]);
    } catch (error) {
      console.error("Profile fetch error:", error);
      toast.error("Failed to load dashboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkInventory = async () => {
    try {
      await fetch("/api/supplier/check-inventory");
    } catch (error) {
      console.error("Error checking inventory:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/supplier/products");
      if (!res.ok) {
        // Check if it's a 404 (no profile) or other error
        if (res.status === 404) {
          console.log("Supplier profile not found");
          setProducts([]);
          return;
        }
        throw new Error("Failed to fetch products");
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Product fetch error:", error);
      // Don't show error toast, just set empty array
      setProducts([]);
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
  const orderStats = {
    pending: orders?.filter((o) => o.status === "PENDING").length || 0,
    confirmed: orders?.filter((o) => o.status === "CONFIRMED").length || 0,
    processing: orders?.filter((o) => o.status === "PROCESSING").length || 0,
    shipped: orders?.filter((o) => o.status === "SHIPPED").length || 0,
    delivered: orders?.filter((o) => o.status === "DELIVERED").length || 0,
    cancelled: orders?.filter((o) => o.status === "CANCELLED").length || 0,
  };

  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + (o.supplierTotal || 0), 0);

  const totalOrders = orders.length;

  const pendingActions =
    orderStats.pending +
    orderStats.confirmed +
    orderStats.processing +
    orderStats.shipped;

  const lowStockProducts = products.filter((p) => p.stock < 5).length;

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: ShoppingBagIcon,
      color: "blue",
      sublabel:
        lowStockProducts > 0 ? `${lowStockProducts} low stock` : "All stocked",
      showAlert: lowStockProducts > 0,
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ChartBarIcon,
      color: "green",
      sublabel: `${orderStats.delivered} completed`,
      showAlert: false,
    },
    {
      label: "Total Revenue",
      value: `₦${totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: "purple",
      sublabel: "From delivered orders",
      showAlert: false,
    },
    {
      label: "Pending Actions",
      value: pendingActions,
      icon: ClockIcon,
      color: "orange",
      sublabel: "Requires attention",
      showAlert: pendingActions > 0,
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
                {stat.showAlert && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    {stat.label === "Total Products"
                      ? lowStockProducts
                      : pendingActions}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-neutral-900">
                {stat.value}
              </p>
              {stat.sublabel && (
                <p className="text-xs text-neutral-500 mt-2">{stat.sublabel}</p>
              )}
            </div>
          ))}
        </div>

        {/* Order Status Breakdown */}
        {orders.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 shadow-lg mb-8">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              Order Status Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {orderStats.pending}
                </div>
                <div className="text-xs text-neutral-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {orderStats.confirmed}
                </div>
                <div className="text-xs text-neutral-600">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {orderStats.processing}
                </div>
                <div className="text-xs text-neutral-600">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {orderStats.shipped}
                </div>
                <div className="text-xs text-neutral-600">Shipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {orderStats.delivered}
                </div>
                <div className="text-xs text-neutral-600">Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {orderStats.cancelled}
                </div>
                <div className="text-xs text-neutral-600">Cancelled</div>
              </div>
            </div>
          </div>
        )}

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
                      <h3 className="text-xl font-bold text-neutral-900 mb-1 truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-2">
                        {product.category} • {product.description || "Generic"}
                      </p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-lg font-bold text-blue-600">
                          ₦{product.price.toLocaleString()}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${
                            product.stock < 5
                              ? "bg-red-100 text-red-700"
                              : product.stock < 20
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {product.stock} in stock
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/products/${product.id}`} // Changed from slug to id
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="View"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/dashboard/supplier/products/${product.id}/edit`}
                        className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                        title="Edit"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => setDeleteModal(product.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <CubeIcon className="h-24 w-24 text-neutral-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  No products yet
                </h3>
                <p className="text-neutral-600 mb-6">
                  Start by adding your first product to the marketplace
                </p>
                <Link
                  href="/dashboard/supplier/products/new"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all"
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                Order Management
              </h2>
              <p className="text-neutral-600">
                Track orders containing your products
              </p>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 bg-gradient-to-r from-neutral-50 to-white border-2 border-neutral-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-neutral-900">
                            Order #{order.trackingId}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              STATUS_COLORS[order.status]
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600">
                          Customer: {order.user.name} • {order.user.email}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Placed on:{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-600 mb-1">
                          Your Revenue
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          ₦{order.supplierTotal.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-neutral-200 pt-4 mt-4">
                      <p className="text-sm font-semibold text-neutral-700 mb-3">
                        Your Products in This Order:
                      </p>
                      <div className="space-y-2">
                        {order.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-neutral-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                                {item.product.image ? (
                                  <Image
                                    src={item.product.image}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <CubeIcon className="h-6 w-6 text-neutral-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-neutral-900">
                                  {item.product.name}
                                </p>
                                <p className="text-sm text-neutral-600">
                                  Qty: {item.quantity} × ₦
                                  {item.price.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <p className="font-bold text-neutral-900">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.shippingAddress && (
                      <div className="border-t border-neutral-200 pt-4 mt-4">
                        <p className="text-sm font-semibold text-neutral-700 mb-2">
                          Shipping Address:
                        </p>
                        <p className="text-sm text-neutral-600">
                          {order.shippingAddress.address},{" "}
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state},{" "}
                          {order.shippingAddress.country}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <TruckIcon className="h-24 w-24 text-neutral-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  No orders yet
                </h3>
                <p className="text-neutral-600 mb-6">
                  Orders containing your products will appear here
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrashIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2 text-center">
              Delete Product?
            </h3>
            <p className="text-neutral-600 mb-8 text-center">
              This action cannot be undone. The product will be permanently
              removed from the marketplace.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-6 py-3 bg-neutral-200 text-neutral-700 rounded-xl font-bold hover:bg-neutral-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteModal)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
