"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  WrenchScrewdriverIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

const SERVICE_TYPES = [
  { value: "oil_change", label: "Oil Change", price: 5000 },
  { value: "brake_service", label: "Brake Service", price: 15000 },
  { value: "tire_rotation", label: "Tire Rotation", price: 8000 },
  { value: "engine_diagnostic", label: "Engine Diagnostic", price: 12000 },
  { value: "battery_replacement", label: "Battery Replacement", price: 20000 },
  { value: "ac_service", label: "AC Service", price: 18000 },
  {
    value: "transmission_service",
    label: "Transmission Service",
    price: 25000,
  },
  { value: "full_service", label: "Full Service", price: 35000 },
  { value: "other", label: "Other (Specify)", price: 0 },
];

const TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

export default function MechanicsBookingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    plateNumber: "",
    serviceType: "",
    customService: "",
    date: "",
    time: "",
    location: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    additionalNotes: "",
  });

  const selectedService = SERVICE_TYPES.find(
    (s) => s.value === formData.serviceType
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (
      !formData.vehicleMake ||
      !formData.vehicleModel ||
      !formData.vehicleYear
    ) {
      toast.error("Please complete vehicle information");
      return false;
    }
    if (!formData.serviceType) {
      toast.error("Please select a service type");
      return false;
    }
    if (formData.serviceType === "other" && !formData.customService) {
      toast.error("Please specify the service you need");
      return false;
    }
    if (!formData.date || !formData.time) {
      toast.error("Please select date and time");
      return false;
    }
    if (!formData.location || !formData.address || !formData.city) {
      toast.error("Please complete location details");
      return false;
    }
    if (!formData.phone) {
      toast.error("Please provide contact phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please login to book a service");
      router.push("/login");
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const bookingData = {
        ...formData,
        estimatedPrice: selectedService?.price || 0,
        status: "PENDING",
      };

      const response = await fetch("/api/bookings/mechanics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      toast.success("Booking created successfully!");

      setTimeout(() => {
        router.push(`/dashboard/buyer/bookings?type=mechanics`);
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 mb-6">
              <WrenchScrewdriverIcon className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">
                Book a Mechanic
              </span>
            </div>
            <h1 className="text-5xl font-bold text-neutral-900 mb-4">
              Professional{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Auto Service
              </span>
            </h1>
            <p className="text-xl text-neutral-600">
              Book certified mechanics at your convenience
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Vehicle Information */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <TruckIcon className="h-6 w-6 text-purple-600" />
                Vehicle Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Vehicle Make *
                  </label>
                  <input
                    type="text"
                    name="vehicleMake"
                    value={formData.vehicleMake}
                    onChange={handleInputChange}
                    placeholder="e.g., Toyota"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Vehicle Model *
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleInputChange}
                    placeholder="e.g., Camry"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    name="vehicleYear"
                    value={formData.vehicleYear}
                    onChange={handleInputChange}
                    placeholder="2020"
                    min="1980"
                    max="2025"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleInputChange}
                    placeholder="ABC-123-XY"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Service Type */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <WrenchScrewdriverIcon className="h-6 w-6 text-purple-600" />
                Service Required
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Select service type</option>
                    {SERVICE_TYPES.map((service) => (
                      <option key={service.value} value={service.value}>
                        {service.label}{" "}
                        {service.price > 0 &&
                          `- ₦${service.price.toLocaleString()}`}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.serviceType === "other" && (
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Specify Service *
                    </label>
                    <input
                      type="text"
                      name="customService"
                      value={formData.customService}
                      onChange={handleInputChange}
                      placeholder="Describe the service you need"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {selectedService && selectedService.price > 0 && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                    <p className="text-sm text-purple-700 font-semibold mb-1">
                      Estimated Price
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      ₦{selectedService.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      Final price may vary based on actual work required
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
                Schedule
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Time *
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Select time slot</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <MapPinIcon className="h-6 w-6 text-purple-600" />
                Service Location
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Location Type *
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Select location type</option>
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
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
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Lagos"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Lagos"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Notes */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <PhoneIcon className="h-6 w-6 text-purple-600" />
                Contact Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+234 800 000 0000"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    placeholder="Any specific instructions or concerns about your vehicle..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
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
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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
