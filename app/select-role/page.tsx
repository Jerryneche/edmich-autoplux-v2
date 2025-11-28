"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  ArrowRightIcon,
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
  const { data: session } = useSession();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/google-role-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        toast.error("Failed to update role");
        return;
      }

      toast.success("Role selected successfully!");

      // Redirect based on role
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="relative pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-neutral-900 mb-4">
              Choose Your Role
            </h1>
            <p className="text-xl text-neutral-600">
              Select how you want to use EDMICH AutoPlux
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {ROLES.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`relative p-8 bg-white rounded-3xl border-2 transition-all text-left ${
                  selectedRole === role.value
                    ? `border-${role.color}-500 shadow-2xl scale-[1.02]`
                    : "border-neutral-200 hover:border-neutral-300 hover:shadow-lg"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                    selectedRole === role.value
                      ? `bg-${role.color}-100`
                      : "bg-neutral-100"
                  }`}
                >
                  <role.icon
                    className={`h-8 w-8 ${
                      selectedRole === role.value
                        ? `text-${role.color}-600`
                        : "text-neutral-600"
                    }`}
                  />
                </div>

                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  {role.label}
                </h3>
                <p className="text-neutral-600 mb-4">{role.description}</p>

                {selectedRole === role.value && (
                  <div
                    className={`absolute top-6 right-6 w-8 h-8 bg-${role.color}-600 rounded-full flex items-center justify-center`}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </button>
            ))}
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
                  <span>Saving...</span>
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
