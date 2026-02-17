"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import {
  TruckIcon,
  MapPinIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

const VEHICLE_TYPES = [
  "Motorcycle/Bike",
  "Van",
  "Pickup Truck",
  "Truck",
  "Mini Truck",
  "Container Truck",
];

const NIGERIAN_STATES = [
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

export default function LogisticsOnboarding() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [formData, setFormData] = useState({
    companyName: "",
    vehicleType: "",
    vehicleNumber: "",
    licenseNumber: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    description: "",
  });
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [coverageAreas, setCoverageAreas] = useState<string[]>([]);

  // Check if user already has a profile
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "LOGISTICS") {
      router.push("/dashboard");
      return;
    }

    checkExistingProfile();
  }, [session, status, router]);

  const checkExistingProfile = async () => {
    try {
      const response = await fetch("/api/onboarding/logistics");

      if (response.ok) {
        const data = await response.json();

        // If profile exists, redirect to dashboard
        if (data.hasProfile && data.logisticsProfile) {
          toast.success("Welcome back!");
          router.push("/dashboard/logistics");
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
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleVehicleType = (vehicle: string) => {
    setVehicleTypes((prev) =>
      prev.includes(vehicle)
        ? prev.filter((v) => v !== vehicle)
        : [...prev, vehicle],
    );
  };

  const toggleCoverageArea = (state: string) => {
    setCoverageAreas((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (vehicleTypes.length === 0) {
      toast.error("Please select at least one vehicle type");
      return;
    }

    if (coverageAreas.length === 0) {
      toast.error("Please select at least one coverage area");
      return;
    }

    if (
      !formData.companyName ||
      !formData.vehicleType ||
      !formData.vehicleNumber ||
      !formData.licenseNumber ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.phone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const profileData = {
        companyName: formData.companyName.trim(),
        vehicleType: formData.vehicleType.trim(),
        vehicleNumber: formData.vehicleNumber.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state,
        phone: formData.phone.trim(),
        description: formData.description.trim() || null,
        vehicleTypes: vehicleTypes,
        coverageAreas: coverageAreas,
      };

      const response = await fetch("/api/onboarding/logistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
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
      router.replace("/dashboard/logistics");

      // Force a hard refresh if soft navigation doesn't work
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard/logistics";
        }
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
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 mb-6">
            <TruckIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Logistics Registration
            </span>
          </div>

          <h1 className="text-5xl font-bold text-neutral-900 mb-4">
            Setup Your{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Logistics Profile
            </span>
          </h1>
          <p className="text-xl text-neutral-600">
            Join our network of trusted delivery partners
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl border-2 border-neutral-200 p-8 md:p-10 space-y-8"
        >
          {/* Company Information */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <TruckIcon className="h-6 w-6 text-green-600" />
              Company Information
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g., Fast Logistics Nigeria"
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:bg-white focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your logistics services..."
                  rows={4}
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              Primary Vehicle Details
            </h3>
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:bg-white focus:outline-none transition-all"
                    required
                  >
                    <option value="">Select Vehicle Type</option>
                    {VEHICLE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder="e.g., ABC-123-XY"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:bg-white focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Driver's License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="e.g., LAG12345678"
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:bg-white focus:outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* All Vehicle Types */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              Available Vehicle Types *
            </h3>
            <p className="text-sm text-neutral-600 mb-3">
              Select all vehicle types you have
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {VEHICLE_TYPES.map((vehicle) => (
                <button
                  key={vehicle}
                  type="button"
                  onClick={() => toggleVehicleType(vehicle)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    vehicleTypes.includes(vehicle)
                      ? "border-green-500 bg-green-50"
                      : "border-neutral-200 hover:border-green-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900">
                      {vehicle}
                    </span>
                    {vehicleTypes.includes(vehicle) && (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            {vehicleTypes.length > 0 && (
              <p className="mt-3 text-sm text-green-600 font-medium">
                {vehicleTypes.length} vehicle type(s) selected
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="h-6 w-6 text-purple-600" />
              Location
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Office/Garage Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g., 456 Transport Avenue, Ikeja"
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:bg-white focus:outline-none transition-all"
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
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:bg-white focus:outline-none transition-all"
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
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:bg-white focus:outline-none transition-all"
                    required
                  >
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234 800 000 0000"
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:bg-white focus:outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Coverage Areas */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="h-6 w-6 text-orange-600" />
              Coverage Areas *
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Select all states where you provide delivery services
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto p-4 bg-neutral-50 rounded-xl border-2 border-neutral-200">
              {NIGERIAN_STATES.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => toggleCoverageArea(state)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    coverageAreas.includes(state)
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
            {coverageAreas.length > 0 && (
              <p className="mt-3 text-sm text-green-600 font-medium">
                {coverageAreas.length} state(s) selected
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
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
