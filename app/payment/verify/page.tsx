// app/payment/verify/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [data, setData] = useState<any>(null);

  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref");

  useEffect(() => {
    const verifyPayment = async () => {
      const ref = reference || trxref;

      if (!ref) {
        setStatus("failed");
        return;
      }

      try {
        const response = await fetch(`/api/payment/verify?reference=${ref}`);
        const result = await response.json();

        if (result.verified) {
          setStatus("success");
          setData(result.data);
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
      }
    };

    verifyPayment();
  }, [reference, trxref]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600 text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-neutral-600 mb-6">
            Your order has been confirmed.
          </p>

          {data && (
            <div className="bg-neutral-50 rounded-xl p-4 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-neutral-500">Reference</span>
                <span className="font-mono text-sm">{data.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Amount</span>
                <span className="font-bold text-green-600">
                  ₦{data.amount?.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href={
                data?.orderId
                  ? `/track?orderId=${data.orderId}`
                  : "/dashboard/buyer"
              }
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Track Order
            </Link>
            <Link
              href="/shop"
              className="block w-full px-6 py-3 border-2 border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <XCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-neutral-600 mb-6">
          We couldn't verify your payment. Please try again.
        </p>

        <div className="space-y-3">
          <Link
            href="/cart"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Return to Cart
          </Link>
          <Link
            href="/shop"
            className="block w-full px-6 py-3 border-2 border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
