"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import {
  CheckCircleIcon,
  TruckIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import Confetti from "react-confetti";

// ─── CONTENT COMPONENT (uses useSearchParams) ─────────────────────
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!orderId) {
      router.push("/shop");
    }
  }, [orderId, router]);

  if (!orderId) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          {/* Success Card */}
          <div className="bg-white rounded-3xl border-2 border-green-200 p-8 md:p-12 shadow-xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 animate-bounce">
              <CheckCircleIcon className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              Thank you for your purchase. Your order has been confirmed!
            </p>

            <div className="inline-block bg-blue-50 border-2 border-blue-200 rounded-xl px-6 py-3 mb-8">
              <p className="text-sm text-blue-600 font-medium mb-1">
                Order Number
              </p>
              <p className="text-2xl font-bold text-blue-700 font-mono">
                #{orderId.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 text-left">
              <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <TruckIcon className="h-6 w-6 text-blue-600" />
                What happens next?
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">
                      Order Confirmation
                    </p>
                    <p className="text-sm text-neutral-600">
                      You will receive an email confirmation shortly
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">
                      Supplier Processing
                    </p>
                    <p className="text-sm text-neutral-600">
                      Your order will be prepared for shipment
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Delivery</p>
                    <p className="text-sm text-neutral-600">
                      Your order will be delivered within 3-5 business days
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white border-2 border-neutral-200 rounded-xl p-4 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                  <p className="font-semibold text-neutral-900">Email Us</p>
                </div>
                <p className="text-sm text-neutral-600">support@edmich.com</p>
              </div>

              <div className="bg-white border-2 border-neutral-200 rounded-xl p-4 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <PhoneIcon className="h-5 w-5 text-blue-600" />
                  <p className="font-semibold text-neutral-900">Call Us</p>
                </div>
                <p className="text-sm text-neutral-600">+234 800 000 0000</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard/buyer/orders"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                View Order Details
              </Link>

              <Link
                href="/shop"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:border-blue-300 hover:shadow-md transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-600">
              Need help?{" "}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

// ─── PAGE COMPONENT (with Suspense) ─────────────────────
export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading order details...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
