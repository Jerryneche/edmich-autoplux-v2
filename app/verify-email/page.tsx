"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { EnvelopeOpenIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Verification failed");
        return;
      }

      toast.success("Email verified successfully!");
      setTimeout(() => router.push("/login"), 1500);
    } catch (error) {
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("New code sent to your email!");
        setTimer(60);
        setCanResend(false);
      } else {
        toast.error("Failed to resend code");
      }
    } catch (error) {
      toast.error("Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="relative pt-32 pb-24">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
              <EnvelopeOpenIcon className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              Verify Your Email
            </h1>
            <p className="text-lg text-neutral-600">
              We sent a 6-digit verification code to
            </p>
            <p className="text-lg font-semibold text-blue-600">{email}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border-2 border-neutral-200 p-8 md:p-10">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-4 text-center">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-6 py-6 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-center text-4xl font-bold tracking-widest focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  required
                />
                <p className="text-sm text-neutral-500 text-center mt-3">
                  Code expires in 15 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Email</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              {canResend ? (
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Resend Code"}
                </button>
              ) : (
                <p className="text-sm text-neutral-500">
                  Resend code in{" "}
                  <span className="font-semibold text-neutral-700">
                    {timer}s
                  </span>
                </p>
              )}
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
