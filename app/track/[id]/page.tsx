// app/track/[id]/page.tsx
import React from "react";
import { prisma } from "@/lib/prisma";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ServiceBookingClient from "./ServiceBookingClient";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  CubeIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

type Props = { params: { id: string } | Promise<{ id: string }> };

export default async function TrackingPage({ params }: Props) {
  const { id: raw } = await params;
  const trackingCode = String(raw ?? "").trim();

  if (!trackingCode) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
        <Header />
        <div className="pt-32 max-w-4xl mx-auto p-6 text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900">
            Missing tracking code
          </h2>
        </div>
        <Footer />
      </main>
    );
  }

  const order = await prisma.order.findFirst({
    where: { OR: [{ trackingId: trackingCode }, { id: trackingCode }] },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
              price: true,
              slug: true,
            },
          },
        },
      },
      shippingAddress: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!order) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
        <Header />
        <div className="pt-32 max-w-4xl mx-auto p-6 text-center">
          <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-neutral-900 mb-3">
            Order not found
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            We couldn't find an order with tracking code{" "}
            <span className="font-mono font-bold text-neutral-900">
              {trackingCode}
            </span>
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Go to Dashboard
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return {
          color: "bg-green-100 text-green-800 border-green-300",
          icon: CheckCircleIcon,
          message: "Your order has been delivered successfully!",
        };
      case "SHIPPED":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-300",
          icon: TruckIcon,
          message: "Your order is on the way!",
        };
      case "CONFIRMED":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-300",
          icon: CheckCircleIcon,
          message: "Your order has been confirmed and is being prepared",
        };
      case "PENDING":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          icon: ClockIcon,
          message: "Your order is being processed",
        };
      case "CANCELLED":
        return {
          color: "bg-red-100 text-red-800 border-red-300",
          icon: XCircleIcon,
          message: "This order has been cancelled",
        };
      default:
        return {
          color: "bg-neutral-100 text-neutral-800 border-neutral-300",
          icon: ClockIcon,
          message: "Order status: " + status,
        };
    }
  };

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      <div className="pt-32 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-3xl border-2 border-neutral-200 p-8 shadow-lg mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-600 mb-2">
                Tracking Code
              </p>
              <h1 className="text-3xl font-bold text-neutral-900 mb-3 font-mono">
                {order.trackingId}
              </h1>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4" />
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  {new Date(order.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold border-2 ${statusInfo.color}`}
            >
              <StatusIcon className="h-6 w-6" />
              <span className="text-lg">{order.status}</span>
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-xl border-2 ${statusInfo.color}`}>
            <p className="text-center font-semibold">{statusInfo.message}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-3xl border-2 border-neutral-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-colors"
                  >
                    <div className="w-20 h-20 bg-neutral-200 rounded-xl overflow-hidden relative flex-shrink-0">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <CubeIcon className="h-10 w-10 text-neutral-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/shop/${item.product.slug || item.product.id}`}
                        className="font-bold text-neutral-900 hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-neutral-600 mt-1">
                        Quantity:{" "}
                        <span className="font-semibold">{item.quantity}</span>
                      </p>
                      <p className="text-sm text-neutral-600">
                        Unit Price:{" "}
                        <span className="font-semibold">
                          ₦{item.price.toLocaleString()}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-600 mb-1">Subtotal</p>
                      <p className="text-xl font-bold text-neutral-900">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-6 border-t-2 border-neutral-200">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-neutral-900">
                    Order Total
                  </span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ₦{order.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Service Booking */}
            <ServiceBookingClient
              orderId={order.id}
              trackingId={order.trackingId}
              shippingAddress={order.shippingAddress}
            />
          </div>

          {/* Right Column - Shipping Info */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-3xl border-2 border-neutral-200 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPinIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Shipping Address
                </h3>
              </div>

              {order.shippingAddress ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-600">
                      Full Name
                    </p>
                    <p className="text-neutral-900 font-medium">
                      {order.shippingAddress.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-600">
                      Address
                    </p>
                    <p className="text-neutral-900">
                      {order.shippingAddress.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-600">
                      Location
                    </p>
                    <p className="text-neutral-900">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}
                    </p>
                    {order.shippingAddress.zipCode && (
                      <p className="text-sm text-neutral-600">
                        {order.shippingAddress.zipCode}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-600">
                      Phone
                    </p>
                    <a
                      href={`tel:${order.shippingAddress.phone}`}
                      className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-2"
                    >
                      <PhoneIcon className="h-4 w-4" />
                      {order.shippingAddress.phone}
                    </a>
                  </div>
                  {order.shippingAddress.email && (
                    <div>
                      <p className="text-sm font-semibold text-neutral-600">
                        Email
                      </p>
                      <a
                        href={`mailto:${order.shippingAddress.email}`}
                        className="text-blue-600 font-medium hover:text-blue-700"
                      >
                        {order.shippingAddress.email}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-neutral-600">No shipping address recorded</p>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl border-2 border-neutral-200 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">
                Payment Method
              </h3>
              <p className="text-neutral-700 font-medium">
                {order.paymentMethod}
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl border-2 border-blue-200 p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-700">Items</span>
                  <span className="font-semibold text-neutral-900">
                    {order.items.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-700">Status</span>
                  <span className="font-semibold text-neutral-900">
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-blue-200">
                  <span className="font-bold text-neutral-900">Total</span>
                  <span className="font-bold text-blue-600">
                    ₦{order.total.toLocaleString()}
                  </span>
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
