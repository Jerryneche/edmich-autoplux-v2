"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  KeyIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast.success("Password reset link sent!");
      } else {
        toast.error(data.error || "Failed to send reset link");
      }
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="relative pt-32 pb-24">
        <div className="max-w-2xl mx-auto px-6">
          {!emailSent ? (
            <>
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
                  <KeyIcon className="h-12 w-12 text-blue-600" />
                </div>
                <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                  Forgot Password?
                </h1>
                <p className="text-lg text-neutral-600">
                  Enter your email and we'll send you instructions to reset your
                  password
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-2xl border-2 border-neutral-200 p-8 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRightIcon className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <Link
                      href="/login"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Back to Login
                    </Link>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                Check Your Email
              </h1>
              <p className="text-lg text-neutral-600 mb-8">
                We've sent password reset instructions to
              </p>
              <p className="text-lg font-semibold text-blue-600 mb-8">
                {email}
              </p>

              <div className="bg-white rounded-3xl shadow-lg border-2 border-neutral-200 p-8 mb-8">
                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-xs">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">
                        Check your inbox
                      </p>
                      <p className="text-sm text-neutral-600">
                        Look for an email from EDMICH
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-xs">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">
                        Click the reset link
                      </p>
                      <p className="text-sm text-neutral-600">
                        The link expires in 1 hour
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-xs">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">
                        Create new password
                      </p>
                      <p className="text-sm text-neutral-600">
                        Choose a strong, unique password
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                Back to Login
                <ArrowRightIcon className="h-4 w-4" />
              </Link>

              <p className="mt-6 text-sm text-neutral-600">
                Didn't receive the email?{" "}
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Try again
                </button>
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
