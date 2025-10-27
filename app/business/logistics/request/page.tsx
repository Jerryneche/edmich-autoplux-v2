"use client";

import { useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import {
  TruckIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function LogisticsRequestPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    pickup: "",
    dropoff: "",
    vehicle: "",
    deliveryDate: "",
    weight: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // Calculate estimated price based on vehicle type
    if (e.target.name === "vehicle" && e.target.value) {
      const prices: { [key: string]: number } = {
        bike: 2500,
        van: 5000,
        truck: 8500,
        "pickup-truck": 7000,
      };
      setEstimatedPrice(prices[e.target.value] || 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/logistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setForm({
          name: "",
          email: "",
          phone: "",
          pickup: "",
          dropoff: "",
          vehicle: "",
          deliveryDate: "",
          weight: "",
          notes: "",
        });
        setEstimatedPrice(null);

        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        alert("Error submitting logistics request. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const vehicleTypes = [
    {
      value: "bike",
      label: "Motorcycle/Bike",
      capacity: "Up to 20kg",
      price: "₦2,500",
    },
    { value: "van", label: "Van", capacity: "Up to 500kg", price: "₦5,000" },
    {
      value: "pickup-truck",
      label: "Pickup Truck",
      capacity: "Up to 1000kg",
      price: "₦7,000",
    },
    {
      value: "truck",
      label: "Truck",
      capacity: "Up to 3000kg",
      price: "₦8,500",
    },
  ];

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Header />

      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Info */}
            <div className="lg:sticky lg:top-32">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 mb-6">
                <TruckIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Fast & Reliable Delivery
                </span>
              </div>

              <h1 className="text-5xl font-bold text-neutral-900 mb-6 leading-tight">
                Request{" "}
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Logistics
                </span>
              </h1>

              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Get instant quotes and book delivery services for your auto
                parts across Nigeria.
              </p>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: CheckCircleIcon, text: "Instant pricing calculator" },
                  { icon: ClockIcon, text: "Same-day & express delivery" },
                  { icon: MapPinIcon, text: "Nationwide coverage" },
                  { icon: SparklesIcon, text: "Real-time GPS tracking" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-neutral-700 font-medium">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Vehicle Types Info */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-neutral-900 mb-4">
                  Vehicle Options
                </h3>
                <div className="space-y-3">
                  {vehicleTypes.map((vehicle, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {vehicle.label}
                        </p>
                        <p className="text-neutral-600">{vehicle.capacity}</p>
                      </div>
                      <span className="font-bold text-green-600">
                        {vehicle.price}+
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimated Price Display */}
              {estimatedPrice && (
                <div className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-2">
                    <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                    <h3 className="font-bold text-lg text-neutral-900">
                      Estimated Price
                    </h3>
                  </div>
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    ₦{estimatedPrice.toLocaleString()}
                  </p>
                  <p className="text-sm text-neutral-600">
                    Base rate for local delivery. Final price depends on
                    distance.
                  </p>
                </div>
              )}
            </div>

            {/* Right Side - Form */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl blur-2xl opacity-30"></div>

              <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-neutral-200 p-8 lg:p-10">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  Delivery Details
                </h2>
                <p className="text-neutral-600 mb-8">
                  Fill in the information below to get started
                </p>

                {/* Success Message */}
                {submitSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900">
                        Request Submitted!
                      </p>
                      <p className="text-sm text-green-700">
                        We will send you a quote within 15 minutes.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        name="name"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-100 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                          type="email"
                          name="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-100 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Phone *
                      </label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+234 800 000 0000"
                          value={form.phone}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-100 transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pickup Location */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Pickup Location *
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        name="pickup"
                        placeholder="e.g., 123 Allen Avenue, Ikeja, Lagos"
                        value={form.pickup}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-100 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Dropoff Location */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Drop-off Location *
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-400" />
                      <input
                        name="dropoff"
                        placeholder="e.g., 456 Victoria Island, Lagos"
                        value={form.dropoff}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-100 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Vehicle Type & Weight */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Vehicle Type *
                      </label>
                      <div className="relative">
                        <TruckIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
                        <select
                          name="vehicle"
                          value={form.vehicle}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-100 transition-all appearance-none"
                          required
                        >
                          <option value="">Select vehicle</option>
                          {vehicleTypes.map((vehicle) => (
                            <option key={vehicle.value} value={vehicle.value}>
                              {vehicle.label} - {vehicle.capacity}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        placeholder="e.g., 50"
                        value={form.weight}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-100 transition-all"
                      />
                    </div>
                  </div>

                  {/* Delivery Date */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Preferred Delivery Date *
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
                      <input
                        type="datetime-local"
                        name="deliveryDate"
                        value={form.deliveryDate}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-100 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      placeholder="Special handling instructions, fragile items, etc..."
                      value={form.notes}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-100 transition-all resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-neutral-600">
                  Questions?{" "}
                  <a
                    href="tel:+2349025579441"
                    className="font-semibold text-green-600 hover:text-green-700"
                  >
                    Call us
                  </a>{" "}
                  or{" "}
                  <a
                    href="mailto:edmichservices@gmail.com"
                    className="font-semibold text-green-600 hover:text-green-700"
                  >
                    send an email
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}
