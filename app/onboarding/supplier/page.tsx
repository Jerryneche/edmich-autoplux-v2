"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import {
  BuildingStorefrontIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

export default function SupplierOnboarding() {
  const { data: session, status, update } = useSession(); // Added 'update' function
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [formData, setFormData] = useState({
    businessName: "",
    businessAddress: "",
    city: "",
    state: "",
    description: "",
    cacNumber: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];

  // Check if user already has a profile
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "SUPPLIER") {
      router.push("/dashboard");
      return;
    }

    checkExistingProfile();
  }, [session, status, router]);

  const checkExistingProfile = async () => {
    try {
      const response = await fetch("/api/onboarding/supplier");

      if (response.ok) {
        const data = await response.json();

        // If profile exists, redirect to dashboard
        if (data.hasProfile && data.supplierProfile) {
          toast.success("Welcome back!");
          router.push("/dashboard/supplier");
          return;
        }
      }

      // No profile found, allow onboarding
      setCheckingProfile(false);
    } catch (error) {
      console.error("Profile check error:", error);
      setCheckingProfile(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/onboarding/supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete onboarding");
      }

      toast.success("Profile created successfully! Redirecting...");

      // 🔥 CRITICAL FIX: Update the session to reflect the new profile
      await update();

      // Small delay to ensure session update completes
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Force navigation with replace to prevent back button issues
      router.replace("/dashboard/supplier");

      // Force a hard refresh if soft navigation doesn't work
      setTimeout(() => {
        window.location.href = "/dashboard/supplier";
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
      setIsLoading(false);
    }
    // Note: Don't set isLoading to false on success - let the redirect happen
  };

  if (status === "loading" || checkingProfile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
            <BuildingStorefrontIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Supplier Registration
            </span>
          </div>

          <h1 className="text-5xl font-bold text-neutral-900 mb-4">
            Setup Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Supplier Profile
            </span>
          </h1>
          <p className="text-xl text-neutral-600">
            Complete your profile to start selling on EDMICH
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl border-2 border-neutral-200 p-8 md:p-10 space-y-8"
        >
          {/* Business Information */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <BuildingStorefrontIcon className="h-6 w-6 text-blue-600" />
              Business Information
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g., AutoParts Nigeria Ltd"
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Business Address *
                </label>
                <input
                  type="text"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  placeholder="e.g., 123 Allen Avenue, Ikeja"
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g., Lagos"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    required
                  >
                    <option value="">Select State</option>
                    {nigerianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Business Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your business..."
                  rows={4}
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Business Verification */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
              Business Verification (Optional)
            </h3>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                CAC Number
              </label>
              <input
                type="text"
                name="cacNumber"
                value={formData.cacNumber}
                onChange={handleChange}
                placeholder="Corporate Affairs Commission Number"
                className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
              />
              <p className="mt-2 text-xs text-neutral-500">
                Adding CAC number increases buyer trust
              </p>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <BanknotesIcon className="h-6 w-6 text-purple-600" />
              Bank Details (Optional)
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="e.g., First Bank"
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    placeholder="0123456789"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                    placeholder="Business Account Name"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Profile...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                <span>Complete Setup</span>
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
