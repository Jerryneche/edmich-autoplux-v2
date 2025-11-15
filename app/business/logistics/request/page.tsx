"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  TruckIcon,
  MapPinIcon,
  CubeIcon,
  PhoneIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

const PACKAGE_TYPES = [
  { value: "small", label: "Small Package (up to 5kg)", basePrice: 2500 },
  { value: "medium", label: "Medium Package (5-20kg)", basePrice: 5000 },
  { value: "large", label: "Large Package (20-50kg)", basePrice: 10000 },
  { value: "extra_large", label: "Extra Large (50kg+)", basePrice: 15000 },
  { value: "auto_parts", label: "Auto Parts", basePrice: 8000 },
];

const DELIVERY_SPEEDS = [
  { value: "standard", label: "Standard (3-5 days)", multiplier: 1 },
  { value: "express", label: "Express (1-2 days)", multiplier: 1.5 },
  { value: "same_day", label: "Same Day", multiplier: 2 },
];

export default function LogisticsBookingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    packageType: "",
    deliverySpeed: "",
    pickupAddress: "",
    pickupCity: "",
    pickupState: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    packageDescription: "",
    packageValue: "",
    phone: "",
    recipientName: "",
    recipientPhone: "",
    specialInstructions: "",
  });

  const selectedPackage = PACKAGE_TYPES.find(
    (p) => p.value === formData.packageType
  );
  const selectedSpeed = DELIVERY_SPEEDS.find(
    (s) => s.value === formData.deliverySpeed
  );
  const estimatedPrice =
    selectedPackage && selectedSpeed
      ? selectedPackage.basePrice * selectedSpeed.multiplier
      : 0;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.packageType || !formData.deliverySpeed) {
      toast.error("Please select package type and delivery speed");
      return false;
    }
    if (
      !formData.pickupAddress ||
      !formData.pickupCity ||
      !formData.deliveryAddress ||
      !formData.deliveryCity
    ) {
      toast.error("Please complete pickup and delivery addresses");
      return false;
    }
    if (
      !formData.phone ||
      !formData.recipientName ||
      !formData.recipientPhone
    ) {
      toast.error("Please complete contact information");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please login to book delivery");
      router.push("/login");
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const bookingData = {
        ...formData,
        estimatedPrice,
        packageValue: formData.packageValue
          ? parseFloat(formData.packageValue)
          : null,
        status: "PENDING",
      };

      const response = await fetch("/api/bookings/logistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      toast.success("Delivery booked successfully!");

      setTimeout(() => {
        router.push(`/dashboard/buyer/bookings?type=logistics`);
      }, 1500);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 mb-6">
              <TruckIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                Book Delivery
              </span>
            </div>
            <h1 className="text-5xl font-bold text-neutral-900 mb-4">
              Fast & Reliable{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Logistics
              </span>
            </h1>
            <p className="text-xl text-neutral-600">
              Get your auto parts delivered safely and on time
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Package Details */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <CubeIcon className="h-6 w-6 text-green-600" />
                Package Details
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Package Type *
                    </label>
                    <select
                      name="packageType"
                      value={formData.packageType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      required
                    >
                      <option value="">Select package type</option>
                      {PACKAGE_TYPES.map((pkg) => (
                        <option key={pkg.value} value={pkg.value}>
                          {pkg.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Delivery Speed *
                    </label>
                    <select
                      name="deliverySpeed"
                      value={formData.deliverySpeed}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      required
                    >
                      <option value="">Select delivery speed</option>
                      {DELIVERY_SPEEDS.map((speed) => (
                        <option key={speed.value} value={speed.value}>
                          {speed.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Package Description *
                  </label>
                  <input
                    type="text"
                    name="packageDescription"
                    value={formData.packageDescription}
                    onChange={handleInputChange}
                    placeholder="e.g., Brake pads, oil filter"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Package Value (₦)
                  </label>
                  <input
                    type="number"
                    name="packageValue"
                    value={formData.packageValue}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    For insurance purposes
                  </p>
                </div>

                {estimatedPrice > 0 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-700 font-semibold mb-1">
                      Estimated Delivery Cost
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      ₦{estimatedPrice.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pickup Location */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <MapPinIcon className="h-6 w-6 text-green-600" />
                Pickup Location
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Pickup Address *
                  </label>
                  <input
                    type="text"
                    name="pickupAddress"
                    value={formData.pickupAddress}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="pickupCity"
                      value={formData.pickupCity}
                      onChange={handleInputChange}
                      placeholder="Lagos"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="pickupState"
                      value={formData.pickupState}
                      onChange={handleInputChange}
                      placeholder="Lagos"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Location */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <MapPinIcon className="h-6 w-6 text-green-600" />
                Delivery Location
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    placeholder="456 Another Street"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="deliveryCity"
                      value={formData.deliveryCity}
                      onChange={handleInputChange}
                      placeholder="Abuja"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="deliveryState"
                      value={formData.deliveryState}
                      onChange={handleInputChange}
                      placeholder="FCT"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <PhoneIcon className="h-6 w-6 text-green-600" />
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Your Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+234 800 000 0000"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Recipient Phone *
                  </label>
                  <input
                    type="tel"
                    name="recipientPhone"
                    value={formData.recipientPhone}
                    onChange={handleInputChange}
                    placeholder="+234 800 000 0000"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    placeholder="Any special handling or delivery instructions..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-4 bg-white border-2 border-neutral-200 text-neutral-700 rounded-xl font-bold hover:border-neutral-300 hover:shadow-md transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
