"use client";

import { useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import {
  WrenchScrewdriverIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  TruckIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function BookingPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    carModel: "",
    service: "",
    appointmentDate: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
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
          carModel: "",
          service: "",
          appointmentDate: "",
          notes: "",
        });

        // Reset success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        alert("Error submitting booking. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    "General Inspection",
    "Oil Change",
    "Brake Repair",
    "Engine Diagnostics",
    "Transmission Service",
    "Tire Replacement",
    "Battery Service",
    "AC Repair",
    "Other",
  ];

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Header />

      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Side - Info */}
            <div className="md:sticky md:top-32">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 mb-6">
                <WrenchScrewdriverIcon className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Professional Service
                </span>
              </div>

              <h1 className="text-5xl font-bold text-neutral-900 mb-6 leading-tight">
                Book a Certified{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Mechanic
                </span>
              </h1>

              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Get your vehicle serviced by experienced, verified mechanics at
                your convenience.
              </p>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: CheckCircleIcon,
                    text: "Certified & verified mechanics",
                  },
                  { icon: ClockIcon, text: "Flexible scheduling options" },
                  { icon: SparklesIcon, text: "Quality service guaranteed" },
                  { icon: PhoneIcon, text: "Real-time updates via SMS" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-neutral-700 font-medium">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing Info */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-neutral-900 mb-2">
                  Service Pricing
                </h3>
                <p className="text-neutral-600 text-sm mb-4">
                  Our mechanics provide transparent quotes before starting any
                  work. No hidden charges.
                </p>
                <div className="flex items-center gap-2 text-purple-600 font-semibold">
                  <span>Starting from ₦5,000</span>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl blur-2xl opacity-30"></div>

              <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-neutral-200 p-8 md:p-10">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  Book Your Service
                </h2>
                <p className="text-neutral-600 mb-8">
                  Fill in the details and we will get back to you shortly
                </p>

                {/* Success Message */}
                {submitSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900">
                        Booking Submitted!
                      </p>
                      <p className="text-sm text-green-700">
                        We will contact you shortly to confirm.
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
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all"
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
                          className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all"
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
                          className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Car Model */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Car Model *
                    </label>
                    <div className="relative">
                      <TruckIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        name="carModel"
                        placeholder="e.g., Toyota Camry 2018"
                        value={form.carModel}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Service Needed *
                    </label>
                    <div className="relative">
                      <WrenchScrewdriverIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
                      <select
                        name="service"
                        value={form.service}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all appearance-none"
                        required
                      >
                        <option value="">Select a service</option>
                        {services.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Appointment Date */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Preferred Date & Time *
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
                      <input
                        type="datetime-local"
                        name="appointmentDate"
                        value={form.appointmentDate}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all"
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
                      placeholder="Any specific issues or requirements..."
                      value={form.notes}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>Submit Booking</span>
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-neutral-600">
                  Need help?{" "}
                  <a
                    href="tel:+2349025579441"
                    className="font-semibold text-purple-600 hover:text-purple-700"
                  >
                    Call us
                  </a>{" "}
                  or{" "}
                  <a
                    href="mailto:edmichservices@gmail.com"
                    className="font-semibold text-purple-600 hover:text-purple-700"
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
    </main>
  );
}
