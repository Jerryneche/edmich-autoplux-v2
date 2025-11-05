"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  ChevronRightIcon,
  PackageIcon,
} from "@heroicons/react/24/outline";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string | null;
    price: number;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (status === "authenticated" && session?.user?.role !== "BUYER") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <ClockIcon className="h-5 w-5" />;
      case "CONFIRMED":
        return <CheckCircleIcon className="h-5 w-5" />;
      case "SHIPPED":
        return <TruckIcon className="h-5 w-5" />;
      case "DELIVERED":
        return <CheckCircleIcon className="h-5 w-5" />;
      case "CANCELLED":
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <PackageIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              My Orders
            </h1>
            <p className="text-neutral-600">Track and manage all your orders</p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-neutral-200 p-12 text-center">
              <ShoppingBagIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                No orders yet
              </h3>
              <p className="text-neutral-600 mb-6">
                Start shopping to see your orders here
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-neutral-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-neutral-600 mb-1">
                          Order Number
                        </p>
                        <p className="text-xl font-bold text-neutral-900 font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border-2 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-neutral-600 mb-1">
                            Order Date
                          </p>
                          <p className="font-semibold text-neutral-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0"
                        >
                          {/* Product Image */}
                          <div className="relative w-20 h-20 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0">
                            {item.product.image ? (
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PackageIcon className="w-10 h-10 text-neutral-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/shop/${item.product.id}`}
                              className="font-semibold text-neutral-900 hover:text-blue-600 transition-colors line-clamp-1"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-sm text-neutral-600 mt-1">
                              Quantity: {item.quantity}
                            </p>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="font-bold text-neutral-900">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </p>
                            <p className="text-sm text-neutral-600">
                              ₦{item.price.toLocaleString()} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="bg-neutral-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">
                        Order Total
                      </p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ₦{order.total.toLocaleString()}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/buyer/orders/${order.id}`}
                      className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:border-blue-300 hover:shadow-md transition-all group-hover:scale-105"
                    >
                      View Details
                      <ChevronRightIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
