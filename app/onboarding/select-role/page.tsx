"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

const roles = [
  {
    value: "BUYER",
    label: "Buyer",
    description: "Purchase auto parts and services",
    icon: "🛒",
  },
  {
    value: "SUPPLIER",
    label: "Supplier",
    description: "Sell auto parts to verified buyers",
    icon: "📦",
  },
  {
    value: "MECHANIC",
    label: "Mechanic",
    description: "Offer repair and maintenance services",
    icon: "🔧",
  },
  {
    value: "LOGISTICS",
    label: "Logistics",
    description: "Provide delivery and transport services",
    icon: "🚚",
  },
];

export default function SelectRolePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      // Update session
      await update();

      toast.success("Role selected successfully!");

      // Redirect based on role
      setTimeout(() => {
        if (selectedRole === "BUYER") {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }, 1000);
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-neutral-900 mb-4">
            Welcome, {session?.user?.name}! 👋
          </h1>
          <p className="text-xl text-neutral-600">
            Please select how you want to use EDMICH
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelectedRole(role.value)}
              className={`p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg ${
                selectedRole === role.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-neutral-200 hover:border-blue-300"
              }`}
            >
              <div className="text-4xl mb-3">{role.icon}</div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">
                {role.label}
              </h3>
              <p className="text-sm text-neutral-600">{role.description}</p>
              {selectedRole === role.value && (
                <div className="mt-3 flex items-center gap-2 text-blue-600 font-semibold text-sm">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Selected</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !selectedRole}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Continue"}
        </button>
      </section>
    </main>
  );
}
