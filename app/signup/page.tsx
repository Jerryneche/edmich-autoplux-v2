// app/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShoppingCartIcon,
  PackageIcon,
  WrenchIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import { signIn } from "next-auth/react";

const roles = [
  {
    value: "BUYER",
    label: "Buyer",
    description: "Purchase auto parts and services",
    icon: ShoppingCartIcon,
  },
  {
    value: "SUPPLIER",
    label: "Supplier",
    description: "Sell auto parts to verified buyers",
    icon: PackageIcon,
  },
  {
    value: "MECHANIC",
    label: "Mechanic",
    description: "Offer repair and maintenance services",
    icon: WrenchIcon,
  },
  {
    value: "LOGISTICS",
    label: "Logistics",
    description: "Provide delivery and transport services",
    icon: TruckIcon,
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRoleSelect = (role: string) => {
    setFormData({ ...formData, role });
    setError("");
  };

  const validateStep1 = () => {
    if (!formData.role) {
      setError("Please select your role");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill in all fields");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (formData.phone.length < 10) {
      setError("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep3()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success("Account created successfully!");

      // AUTO SIGN IN
      setTimeout(async () => {
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          router.push("/dashboard");
          router.refresh();
        } else {
          router.push("/login");
        }
      }, 1000);
    } catch (error) {
      setError("Something went wrong. Please try again.");
      toast.error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-neutral-900 mb-4">
              Join{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EDMICH
              </span>
            </h1>
            <p className="text-xl text-neutral-600">
              Create your account and start growing your automotive business
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      step >= s
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-neutral-200 text-neutral-500"
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 transition-all duration-300 ${
                        step > s ? "bg-blue-600" : "bg-neutral-200"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl blur-2xl opacity-30"></div>

            <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-neutral-200 p-8 md:p-10">
              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-900 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Step 1: Role Selection */}
              {step === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                      Choose Your Role
                    </h2>
                    <p className="text-neutral-600">
                      Select how you want to use EDMICH
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => handleRoleSelect(role.value)}
                          className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                            formData.role === role.value
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-neutral-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-md">
                            <Icon className="h-7 w-7 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-neutral-900 mb-1">
                            {role.label}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {role.description}
                          </p>
                          {formData.role === role.value && (
                            <div className="mt-3 flex items-center gap-2 text-blue-600 font-semibold text-sm">
                              <CheckCircleIcon className="h-5 w-5" />
                              <span>Selected</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                  >
                    <span>Continue</span>
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                      Personal Information
                    </h2>
                    <p className="text-neutral-600">Tell us about yourself</p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+234 800 000 0000"
                          className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all"
                    >
                      <span>Continue</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Password */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                      Create Password
                    </h2>
                    <p className="text-neutral-600">
                      Choose a strong password for your account
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Password *
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
                      <p className="mt-2 text-xs text-neutral-500">
                        Must be at least 8 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-900">
                        By creating an account, you agree to our{" "}
                        <Link href="/terms" className="font-semibold underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="font-semibold underline"
                        >
                          Privacy Policy
                        </Link>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isLoading}
                      className="flex-1 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-all disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <CheckCircleIcon className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Login Link */}
              <p className="mt-8 text-center text-sm text-neutral-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
