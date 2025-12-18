// app/select-role/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import toast, { Toaster } from "react-hot-toast";

const ROLES = [
  {
    value: "BUYER",
    label: "Buyer",
    description: "Shop for auto parts and book services",
    icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
    color: "blue",
  },
  {
    value: "SUPPLIER",
    label: "Supplier",
    description: "Sell auto parts and manage inventory",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    color: "purple",
  },
  {
    value: "MECHANIC",
    label: "Mechanic",
    description: "Offer repair services to customers",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    color: "orange",
  },
  {
    value: "LOGISTICS",
    label: "Logistics",
    description: "Provide delivery and shipping services",
    icon: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0",
    color: "green",
  },
];

const colorClasses: Record<
  string,
  { border: string; bg: string; icon: string }
> = {
  blue: { border: "border-blue-500", bg: "bg-blue-100", icon: "text-blue-600" },
  purple: {
    border: "border-purple-500",
    bg: "bg-purple-100",
    icon: "text-purple-600",
  },
  orange: {
    border: "border-orange-500",
    bg: "bg-orange-100",
    icon: "text-orange-600",
  },
  green: {
    border: "border-green-500",
    bg: "bg-green-100",
    icon: "text-green-600",
  },
};

export default function SelectRolePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const verifiedEmail = sessionStorage.getItem("verifiedEmail");
    const storedPassword = sessionStorage.getItem("pendingPassword");

    if (verifiedEmail) {
      setEmail(verifiedEmail);
      if (storedPassword) {
        setPassword(storedPassword);
      }
    } else {
      toast.error("Please complete verification first");
      router.push("/signup");
    }
  }, [router]);

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Update role in database
      const response = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to save role");
        setIsLoading(false);
        return;
      }

      // Step 2: Create NextAuth session
      // Use emailOrUsername (not email) to match credentials provider
      const signInResult = await signIn("credentials", {
        emailOrUsername: email, // ✅ FIXED: Use emailOrUsername
        password: password,
        redirect: false,
      });

      // Clear session storage
      sessionStorage.removeItem("verifiedEmail");
      sessionStorage.removeItem("pendingPassword");

      if (signInResult?.error) {
        console.error("SignIn error:", signInResult.error);
        // Role is saved, redirect to login
        toast.success("Account created! Please login to continue.");
        router.push("/login");
        return;
      }

      toast.success("Welcome to EDMICH!");

      // Step 3: Redirect based on role
      if (selectedRole === "BUYER") {
        router.push("/dashboard/buyer");
      } else {
        router.push(`/onboarding/${selectedRole.toLowerCase()}`);
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-green-600 hidden sm:block">Sign Up</span>
            </div>
            <div className="w-12 h-0.5 bg-green-500" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-green-600 hidden sm:block">Verify</span>
            </div>
            <div className="w-12 h-0.5 bg-blue-500" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-blue-600 font-medium hidden sm:block">
                Role
              </span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Choose your role
            </h1>
            <p className="text-neutral-600">
              How will you use EDMICH AutoPlux?
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.value;
              const colors = colorClasses[role.color];

              return (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`relative p-6 bg-white rounded-2xl border-2 text-left transition-all hover:shadow-lg ${
                    isSelected
                      ? colors.border
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                      isSelected ? colors.bg : "bg-neutral-100"
                    }`}
                  >
                    <svg
                      className={`w-7 h-7 ${
                        isSelected ? colors.icon : "text-neutral-400"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={role.icon}
                      />
                    </svg>
                  </div>

                  <h3 className="text-xl font-bold text-neutral-900 mb-1">
                    {role.label}
                  </h3>
                  <p className="text-sm text-neutral-600">{role.description}</p>

                  {isSelected && (
                    <div
                      className={`absolute top-4 right-4 w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center`}
                    >
                      <svg
                        className={`w-4 h-4 ${colors.icon}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="max-w-md mx-auto">
            <button
              onClick={handleSubmit}
              disabled={!selectedRole || isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Continue
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>

            <p className="mt-4 text-center text-neutral-500 text-sm">
              You can change your role later in settings
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
