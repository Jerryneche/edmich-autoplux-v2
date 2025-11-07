"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  CubeIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  CreditCardIcon,
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
  updatedAt: string;
  items: OrderItem[];
}

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
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
      fetchOrder();
    }
  }, [status, params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }
      const data = await response.json();
      setOrder(data);
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
        return <ClockIcon className="h-6 w-6" />;
      case "CONFIRMED":
        return <CheckCircleIcon className="h-6 w-6" />;
      case "SHIPPED":
        return <TruckIcon className="h-6 w-6" />;
      case "DELIVERED":
        return <CheckCircleIcon className="h-6 w-6" />;
      case "CANCELLED":
        return <XCircleIcon className="h-6 w-6" />;
      default:
        return <CubeIcon className="h-6 w-6" />;
    }
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { name: "Order Placed", status: "PENDING" },
      { name: "Confirmed", status: "CONFIRMED" },
      { name: "Shipped", status: "SHIPPED" },
      { name: "Delivered", status: "DELIVERED" },
    ];

    const statusOrder = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
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

  if (error || !order) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
        <Header />
        <div className="pt-32 max-w-7xl mx-auto px-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Order Not Found
            </h2>
            <p className="text-neutral-600 mb-6">
              {error || "This order does not exist"}
            </p>
            <Link
              href="/dashboard/buyer/orders"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const shippingCost = 2500;
  const tax = order.total * 0.075;
  const subtotal = order.total - shippingCost - tax;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Button */}
          <Link
            href="/dashboard/buyer/orders"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-600 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Orders
          </Link>

          {/* Order Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-neutral-200 p-8 mb-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                407
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                  Order Details
                </h1>
                <p className="text-xl font-mono text-neutral-600">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-neutral-600 mt-2">
                  Placed on{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-lg border-2 ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                {order.status}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Order Items & Timeline */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Status Timeline */}
              {order.status !== "CANCELLED" && (
                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-6">
                    Order Status
                  </h2>
                  <div className="relative">
                    {getStatusSteps(order.status).map((step, index) => (
                      <div
                        key={step.status}
                        className="flex gap-4 mb-8 last:mb-0"
                      >
                        {/* Icon */}
                        <div className="relative flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                              step.completed
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white border-neutral-300 text-neutral-400"
                            }`}
                          >
                            {step.completed ? (
                              <CheckCircleIcon className="h-6 w-6" />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-neutral-300"></div>
                            )}
                          </div>
                          {index < 3 && (
                            <div
                              className={`absolute left-1/2 -translate-x-1/2 top-12 w-0.5 h-8 ${
                                step.completed
                                  ? "bg-blue-600"
                                  : "bg-neutral-300"
                              }`}
                            ></div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-2">
                          <p
                            className={`font-semibold ${
                              step.completed
                                ? "text-neutral-900"
                                : "text-neutral-500"
                            }`}
                          >
                            {step.name}
                          </p>
                          {step.active && (
                            <p className="text-sm text-neutral-600 mt-1">
                              Your order is currently being processed
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-6">
                  Order Items ({order.items.length})
                </h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/shop/${item.product.id}`}
                        className="relative w-24 h-24 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0 hover:ring-2 ring-blue-500 transition-all"
                      >
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CubeIcon className="w-12 h-12 text-neutral-400" />
                          </div>
                        )}
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${item.product.id}`}
                          className="font-semibold text-neutral-900 hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-neutral-600 mt-1">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-neutral-600">
                          Unit Price: ₦{item.price.toLocaleString()}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-neutral-900">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Summary & Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-neutral-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-neutral-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      ₦
                      {subtotal.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-700">
                    <span className="flex items-center gap-2">
                      <TruckIcon className="h-4 w-4" />
                      Shipping
                    </span>
                    <span className="font-semibold">
                      ₦{shippingCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-700">
                    <span>Tax (7.5%)</span>
                    <span className="font-semibold">
                      ₦
                      {tax.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between text-2xl font-bold text-neutral-900 pt-3 border-t-2 border-neutral-200">
                    <span>Total</span>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ₦{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all">
                    <TruckIcon className="h-5 w-5" />
                    Track Order
                  </button>

                  <Link
                    href="/shop"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:border-blue-300 transition-all"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* NEED HELP — FIXED */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-neutral-200 p-6">
                <h3 className="font-bold text-neutral-900 mb-4">Need Help?</h3>
                <div className="space-y-3 text-sm">
                  <a
                    href="tel:+2348000000000"
                    className="flex items-center gap-3 text-neutral-700 hover:text-blue-600 transition-colors"
                  >
                    <PhoneIcon className="h-5 w-5" />
                    +234 800 000 0000
                  </a>

                  <a
                    href="mailto:support@edmich.com"
                    className="flex items-center gap-3 text-neutral-700 hover:text-blue-600 transition-colors"
                  >
                    <UserIcon className="h-5 w-5" />
                    support@edmich.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
