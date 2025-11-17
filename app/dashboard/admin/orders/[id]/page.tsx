"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  ArrowLeftIcon,
  ShoppingBagIcon,
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string | null;
    price: number;
  };
}

interface Order {
  id: string;
  trackingId: string;
  total: number;
  status: string;
  paymentMethod: string;
  deliveryNotes: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  items: OrderItem[];
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-300",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-300",
  DELIVERED: "bg-green-100 text-green-800 border-green-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
};

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && orderId) {
      fetchOrder();
    }
  }, [status, orderId]);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        toast.error("Failed to load order");
        router.push("/dashboard/admin");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">Order not found</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Toaster position="top-right" />
      <main className="min-h-screen bg-gradient-to-b from-white to-neutral-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Orders
          </button>

          {/* Header */}
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  Order #{order.trackingId}
                </h1>
                <p className="text-neutral-600">
                  Placed on{" "}
                  {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <span
                  className={`px-4 py-2 rounded-xl font-semibold text-sm border-2 text-center ${
                    STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]
                  }`}
                >
                  {order.status}
                </span>

                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={isUpdating}
                  className="px-4 py-2 border-2 border-neutral-200 rounded-xl font-semibold text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                  Order Items ({order.items.length})
                </h2>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border-2 border-neutral-100 rounded-xl hover:border-neutral-200 transition-colors"
                    >
                      <div className="relative w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            📦
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-neutral-600">
                          Price: ₦{item.price.toLocaleString()} each
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="mt-6 pt-6 border-t-2 border-neutral-200">
                  <div className="flex items-center justify-between text-2xl font-bold text-neutral-900">
                    <span>Total</span>
                    <span>₦{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Notes */}
              {order.deliveryNotes && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                  <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <TruckIcon className="h-5 w-5" />
                    Delivery Notes
                  </h3>
                  <p className="text-amber-800">{order.deliveryNotes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  Customer
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-500">Name</p>
                    <p className="font-semibold text-neutral-900">
                      {order.user.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Email</p>
                    <p className="text-neutral-900">{order.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                  <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-blue-600" />
                    Shipping Address
                  </h3>
                  <div className="space-y-2 text-neutral-700">
                    <p className="font-semibold">
                      {order.shippingAddress.fullName}
                    </p>
                    <p>{order.shippingAddress.phone}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5 text-blue-600" />
                  Payment
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-neutral-500">Method</p>
                    <p className="font-semibold text-neutral-900 capitalize">
                      {order.paymentMethod.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Total Paid</p>
                    <p className="text-xl font-bold text-green-600">
                      ₦{order.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                  Order Timeline
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="text-neutral-600">
                    <span className="font-semibold">Created:</span>{" "}
                    {format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
                  </p>
                  <p className="text-neutral-600">
                    <span className="font-semibold">Status:</span>{" "}
                    {order.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
