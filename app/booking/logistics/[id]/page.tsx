"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CubeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

interface BookingContext {
  orderId: string;
  trackingId: string;
  returnUrl: string;
}

export default function LogisticsBookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const providerId = params.id as string;

  const [provider, setProvider] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingContext, setBookingContext] = useState<BookingContext | null>(
    null
  );

  const [formData, setFormData] = useState({
    packageType: "",
    weight: "",
    dimensions: "",
    deliverySpeed: "STANDARD",
    pickupLocation: "",
    deliveryLocation: "",
    recipientName: "",
    recipientPhone: "",
    specialInstructions: "",
  });

  // Load booking context from sessionStorage (from tracking modal)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const context = sessionStorage.getItem("bookingContext");
      if (context) {
        const parsed = JSON.parse(context);
        setBookingContext(parsed);
      }
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch provider
  useEffect(() => {
    if (status === "loading" || !providerId) return;

    const fetchProvider = async () => {
      try {
        const response = await fetch(`/api/logistics/${providerId}`);
        if (response.ok) {
          const data = await response.json();
          setProvider(data);
        } else {
          toast.error("Logistics provider not found");
        }
      } catch (error) {
        console.error("Error fetching provider:", error);
        toast.error("Failed to load provider details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvider();
  }, [status, providerId]);

  const calculatePrice = () => {
    const basePrice = 5000;
    const speedMultipliers = {
      STANDARD: 1,
      EXPRESS: 1.5,
      SAME_DAY: 2,
    };
    const weight = parseFloat(formData.weight) || 0;
    const weightPrice = weight * 100;
    return (
      (basePrice + weightPrice) *
      speedMultipliers[formData.deliverySpeed as keyof typeof speedMultipliers]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      providerId,
      packageType: formData.packageType,
      deliverySpeed: formData.deliverySpeed,
      packageDescription: formData.dimensions || "No description provided",
      weight: parseFloat(formData.weight) || 0,
      pickupAddress: formData.pickupLocation,
      pickupCity: "Lagos",
      deliveryAddress: formData.deliveryLocation,
      deliveryCity: "Lagos",
      phone: session?.user?.email || formData.recipientPhone,
      recipientName: formData.recipientName,
      recipientPhone: formData.recipientPhone,
      specialInstructions: formData.specialInstructions || null,
      estimatedPrice: calculatePrice(),
    };

    try {
      // Step 1: Create the logistics booking
      const response = await fetch("/api/bookings/logistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = "Failed to submit booking";
        try {
          const text = await response.text();
          if (text) {
            try {
              const errorData = JSON.parse(text);
              errorMessage = errorData.error || errorMessage;
            } catch {
              errorMessage = text;
            }
          }
        } catch {}
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      const booking = await response.json();
      console.log("Booking created:", booking);

      // Step 2: If this is for an order, create service link
      if (bookingContext?.orderId) {
        console.log("Creating service link for order:", bookingContext.orderId);

        const linkResponse = await fetch(
          `/api/orders/${bookingContext.orderId}/service-links`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: booking.id,
              type: "LOGISTICS",
            }),
          }
        );

        if (!linkResponse.ok) {
          console.error("Failed to create service link");
          toast.error("Booking created but failed to link to order");
        } else {
          console.log("Service link created successfully");
        }
      }

      // Step 3: Clean up and redirect
      toast.success("Delivery service booked successfully!");
      sessionStorage.removeItem("bookingContext");

      setTimeout(() => {
        if (bookingContext?.returnUrl) {
          router.push(bookingContext.returnUrl);
        } else {
          router.push("/dashboard/buyer/bookings?type=logistics");
        }
      }, 1500);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </>
    );
  }

  if (!provider) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">
              Logistics provider not found
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-green-600 hover:text-green-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Toaster position="top-right" />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Services
          </button>

          {/* Linked Order Banner */}
          {bookingContext && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShoppingBagIcon className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-900">
                    This booking is linked to your order
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-xl font-bold text-purple-700">
                      {bookingContext.orderId}
                    </span>
                    <span className="text-sm text-gray-600">
                      Tracking: {bookingContext.trackingId}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Book Logistics Service
                </h1>
                <p className="text-gray-600 mb-8">
                  Fill in the details below to arrange your delivery
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Package Information */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <CubeIcon className="h-6 w-6 text-green-600" />
                      Package Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Package Type *
                        </label>
                        <select
                          required
                          value={formData.packageType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              packageType: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select type</option>
                          <option value="Engine">Engine</option>
                          <option value="Suspension System">
                            Suspension system
                          </option>
                          <option value="Car Body Parts">Car body Parts</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (kg) *
                        </label>
                        <input
                          type="number"
                          required
                          step="0.1"
                          placeholder="e.g., 25"
                          value={formData.weight}
                          onChange={(e) =>
                            setFormData({ ...formData, weight: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Speed */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <ClockIcon className="h-6 w-6 text-green-600" />
                      Delivery Speed
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["STANDARD", "EXPRESS", "SAME_DAY"].map((speed) => (
                        <button
                          key={speed}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, deliverySpeed: speed })
                          }
                          className={`p-4 border-2 rounded-lg transition-all ${
                            formData.deliverySpeed === speed
                              ? "border-green-600 bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <p className="font-medium">
                            {speed === "STANDARD"
                              ? "Standard"
                              : speed === "EXPRESS"
                              ? "Express"
                              : "Same Day"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {speed === "STANDARD"
                              ? "3-5 days"
                              : speed === "EXPRESS"
                              ? "1-2 days"
                              : "Today"}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {speed === "STANDARD"
                              ? "Base rate"
                              : speed === "EXPRESS"
                              ? "+50%"
                              : "+100%"}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <MapPinIcon className="h-6 w-6 text-green-600" />
                      Pickup & Delivery
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Location *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter pickup address"
                        value={formData.pickupLocation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pickupLocation: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Location *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter delivery address"
                        value={formData.deliveryLocation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deliveryLocation: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Recipient Information */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Recipient Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recipient Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Full name"
                          value={formData.recipientName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recipientName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recipient Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g., 08012345678"
                          value={formData.recipientPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recipientPhone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Instructions
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Any special handling instructions..."
                        value={formData.specialInstructions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialInstructions: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Confirm Booking"}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Provider Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Company Name</p>
                    <p className="font-semibold text-gray-900">
                      {provider.companyName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Vehicle Types</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {provider.vehicleTypes?.map(
                        (type: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full"
                          >
                            {type}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Coverage Areas</p>
                    <p className="text-gray-900">
                      {provider.coverageAreas?.length || 0} locations
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Estimated Cost</p>
                    <p className="text-3xl font-bold text-green-600">
                      ₦{calculatePrice().toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on weight and delivery speed
                    </p>
                  </div>

                  {provider.phone && (
                    <div className="pt-4 border-t border-gray-200">
                      <a
                        href={`tel:${provider.phone}`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                        Call Provider
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
