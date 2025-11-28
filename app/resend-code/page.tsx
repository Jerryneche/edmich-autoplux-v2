"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { EnvelopeIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

// Extract search params in a separate component so it can be wrapped in Suspense
function ResendCodeContent() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const router = useRouter();
  const [email, setEmail] = useState(emailFromUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setMessage("Verification code sent! Check your email.");

      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <ArrowPathIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Resend Verification Code
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email to receive a new verification code
            </p>
          </div>

          <form
            onSubmit={handleResend}
            className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md"
          >
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Sending...
                </>
              ) : (
                "Resend Verification Code"
              )}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Back to Login
              </Link>
            </div>
          </form>

          <div className="text-center text-sm text-gray-600">
            <p>
              Didn't receive the code?{" "}
              <Link
                href="/signup"
                className="text-indigo-600 hover:text-indigo-500"
              >
                Sign up again
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Main page component — wraps content in Suspense
export default function ResendCodePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResendCodeContent />
    </Suspense>
  );
}
