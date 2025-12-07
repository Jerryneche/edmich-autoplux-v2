"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

const ROLES = [
  {
    value: "BUYER",
    label: "Buyer",
    icon: ShoppingBagIcon,
    description: "Shop for auto parts and services",
    color: "blue",
  },
  {
    value: "SUPPLIER",
    label: "Supplier",
    icon: BuildingStorefrontIcon,
    description: "Sell auto parts online",
    color: "purple",
  },
  {
    value: "MECHANIC",
    label: "Mechanic",
    icon: WrenchScrewdriverIcon,
    description: "Offer repair services",
    color: "orange",
  },
  {
    value: "LOGISTICS",
    label: "Logistics Provider",
    icon: TruckIcon,
    description: "Provide delivery services",
    color: "green",
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      // STEP 1 — GET USER EMAIL FIRST
      const profile = await fetch("/api/user/profile");

      if (!profile.ok) {
        toast.error("Unable to fetch your profile");
        setIsLoading(false);
        return;
      }

      const userData = await profile.json();

      if (!userData?.email) {
        toast.error("No active account found");
        setIsLoading(false);
        return;
      }

      const email = userData.email;

      // STEP 2 — UPDATE ROLE
      const response = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, email }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to update role");
        setIsLoading(false);
        return;
      }

      toast.success("Role updated successfully!");

      // STEP 3 — ENSURE A VALID SESSION EXISTS
      await signIn("credentials", {
        email,
        verified: "true",
        redirect: false,
      });

      // STEP 4 — REDIRECT BASED ON ROLE
      setTimeout(() => {
        switch (selectedRole) {
          case "SUPPLIER":
            router.push("/onboarding/supplier");
            break;
          case "MECHANIC":
            router.push("/onboarding/mechanic");
            break;
          case "LOGISTICS":
            router.push("/onboarding/logistics");
            break;
          case "BUYER":
            router.push("/dashboard/buyer");
            break;
          default:
            router.push("/dashboard");
        }
      }, 1000);
    } catch (err) {
      console.error("[ROLE] ERROR:", err);
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
        {/* Background Blobs */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-neutral-900 mb-4">
              Choose Your Role
            </h1>
            <p className="text-xl text-neutral-600">
              Select how you want to use EDMICH AutoPlux
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`relative p-8 bg-white rounded-3xl border-2 transition-all text-left hover:shadow-xl hover:scale-[1.02] ${
                    selectedRole === role.value
                      ? "border-blue-500 shadow-2xl scale-[1.02]"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                      selectedRole === role.value
                        ? "bg-blue-100"
                        : "bg-neutral-100"
                    }`}
                  >
                    <Icon
                      className={`h-8 w-8 ${
                        selectedRole === role.value
                          ? "text-blue-600"
                          : "text-neutral-600"
                      }`}
                    />
                  </div>

                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    {role.label}
                  </h3>
                  <p className="text-neutral-600 mb-4">{role.description}</p>

                  {selectedRole === role.value && (
                    <div className="absolute top-6 right-6 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleConfirm}
              disabled={!selectedRole || isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Setting up your account...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-neutral-500 mt-6">
              You can change your role later in profile settings
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
