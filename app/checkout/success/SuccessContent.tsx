// app/checkout/success/SuccessContent.tsx
"use client";

import { useSearchParams } from "next/navigation";
import {
  CheckCircleIcon,
  TruckIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const trackingId = searchParams.get("trackingId");
  const total = searchParams.get("total");

  return (
    <div className="max-w-3xl mx-auto px-6 text-center">
      <div className="mb-8">
        <CheckCircleIcon className="w-20 h-20 text-green-600 mx-auto" />
        <h1 className="text-4xl font-bold text-neutral-900 mt-4">
          Order Confirmed!
        </h1>
        <p className="text-neutral-600 mt-2">
          Your order has been placed successfully.
        </p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-green-100 p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">
          Order Receipt
        </h2>

        <div className="space-y-4 text-left">
          <div className="flex justify-between">
            <span className="text-neutral-600">Order ID</span>
            <span className="font-mono font-bold">#{orderId || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600 flex items-center gap-2">
              Truck Tracking ID
            </span>
            <span className="font-mono font-bold text-blue-600">
              {trackingId || "Generating..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Total Amount</span>
            <span className="font-bold text-green-600">
              ₦{(total ? Number(total) : 0).toLocaleString()}
            </span>
          </div>

          {/* VENDOR NAME */}
          <div className="flex justify-between pt-4 border-t border-neutral-200">
            <span className="text-neutral-600">Purchased From</span>
            <span className="font-semibold text-purple-600">
              AutoParts Nigeria
            </span>
          </div>
        </div>

        <div className="mt-8 p-4 bg-green-50 rounded-xl">
          <p className="text-sm text-green-800">
            Map Your order is being prepared and will be shipped soon.
          </p>
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/shop"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
          >
            Continue Shopping
          </Link>
          <Link
            href={`/track?trackingId=${trackingId}`}
            className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition"
          >
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
