"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  UserIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">(
    "password"
  );
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Password Login (Existing - Unchanged)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        emailOrUsername: formData.emailOrUsername,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Login successful!");
        window.location.href = "/dashboard";
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign In (Existing - Unchanged)
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      toast.error("Google sign in failed");
      setIsLoading(false);
    }
  };

  // OTP Request
  const handleOtpRequest = async () => {
    setError("");

    if (!otpEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send code");
        toast.error(data.error || "Failed to send code");
        return;
      }

      toast.success("Login code sent to your email!");
      setStep("otp");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // OTP Login - FIXED with proper NextAuth integration
  const handleOtpLogin = async () => {
    setError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit code");
      toast.error("Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Verify OTP with backend
      const verifyResponse = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, otp: otpCode }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setError(verifyData.error || "Invalid code");
        toast.error(verifyData.error || "Invalid code");
        return;
      }

      // Step 2: Create NextAuth session using credentials provider with OTP
      const signInResult = await signIn("credentials", {
        email: otpEmail,
        otp: otpCode,
        redirect: false,
      });

      if (signInResult?.error) {
        setError(signInResult.error);
        toast.error(signInResult.error);
        return;
      }

      // Success!
      toast.success("Login successful!");

      // Give NextAuth time to set cookies
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Marketing */}
            <div className="hidden md:block">
              <h1 className="text-5xl font-bold text-neutral-900 mb-6 leading-tight">
                Welcome back to{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EDMICH
                </span>
              </h1>

              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Access your dashboard and manage your automotive business with
                ease.
              </p>

              <div className="space-y-4">
                {[
                  "Manage your products and orders",
                  "Track bookings and deliveries",
                  "Connect with verified partners",
                  "Grow your business",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-neutral-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl blur-2xl opacity-30"></div>

              <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-neutral-200 p-8 md:p-10">
                <div className="md:hidden mb-6">
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Welcome Back
                  </h1>
                  <p className="text-neutral-600">
                    Sign in to continue to EDMICH
                  </p>
                </div>

                <h2 className="hidden md:block text-2xl font-bold text-neutral-900 mb-2">
                  Sign In
                </h2>
                <p className="hidden md:block text-neutral-600 mb-8">
                  Access your dashboard
                </p>

                {/* Error Alert */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-900 text-sm font-medium">{error}</p>
                  </div>
                )}

                {step === "email" && (
                  <>
                    {/* Google Button */}
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-neutral-300 py-4 rounded-xl font-semibold text-neutral-700 hover:border-blue-400 hover:shadow-lg transition-all disabled:opacity-50 mb-8"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-neutral-500 font-medium">
                          Or
                        </span>
                      </div>
                    </div>

                    {/* Login Method Toggle */}
                    <div className="flex gap-2 bg-neutral-100 p-1 rounded-xl mb-6">
                      <button
                        onClick={() => setLoginMethod("password")}
                        className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                          loginMethod === "password"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-neutral-600"
                        }`}
                      >
                        Password
                      </button>
                      <button
                        onClick={() => setLoginMethod("otp")}
                        className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                          loginMethod === "otp"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-neutral-600"
                        }`}
                      >
                        Email Code
                      </button>
                    </div>

                    {/* Password Login Form */}
                    {loginMethod === "password" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Email or Username
                          </label>
                          <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <input
                              type="text"
                              name="emailOrUsername"
                              value={formData.emailOrUsername}
                              onChange={handleChange}
                              placeholder="email@example.com or username"
                              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <input
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              placeholder="••••••••"
                              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-neutral-600">
                              Remember me
                            </span>
                          </label>
                          <Link
                            href="/forgot-password"
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Forgot password?
                          </Link>
                        </div>

                        <button
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Signing in...</span>
                            </>
                          ) : (
                            <>
                              <span>Sign In</span>
                              <ArrowRightIcon className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* OTP Login Form */}
                    {loginMethod === "otp" && (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                          <p className="text-sm text-blue-900">
                            <strong>No password?</strong> We'll send a code to
                            your email for quick login.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <input
                              type="email"
                              value={otpEmail}
                              onChange={(e) => setOtpEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                              required
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleOtpRequest}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Sending code...</span>
                            </>
                          ) : (
                            <>
                              <span>Send Login Code</span>
                              <ArrowRightIcon className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* OTP Verification Step */}
                {step === "otp" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-2">
                        Check your email
                      </h3>
                      <p className="text-neutral-600 text-sm">
                        We sent a login code to
                        <br />
                        <span className="font-semibold text-neutral-900">
                          {otpEmail}
                        </span>
                      </p>
                    </div>

                    {/* OTP Input */}
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-3 text-center">
                        Enter login code
                      </label>
                      <div className="flex gap-2 justify-center">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-12 h-14 text-center text-2xl font-bold bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleOtpLogin}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Login</span>
                          <CheckCircleIcon className="h-5 w-5" />
                        </>
                      )}
                    </button>

                    {/* Resend & Back */}
                    <div className="text-center space-y-3">
                      <button
                        onClick={handleOtpRequest}
                        disabled={isLoading}
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50 transition-all"
                      >
                        Resend code
                      </button>

                      <button
                        onClick={() => {
                          setStep("email");
                          setOtp(["", "", "", "", "", ""]);
                          setError("");
                        }}
                        className="block w-full text-sm text-neutral-600 hover:text-neutral-900 transition-all"
                      >
                        Change email address
                      </button>
                    </div>
                  </div>
                )}

                {/* Sign Up Link */}
                {step === "email" && (
                  <p className="mt-6 text-center text-sm text-neutral-600">
                    Don't have an account?{" "}
                    <Link
                      href="/signup"
                      className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Sign up for free
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
