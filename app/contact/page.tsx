"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "general",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (err) {
        console.error("JSON parse error:", err);
      }

      if (!response.ok) {
        throw new Error(data?.error || "Something went wrong");
      }

      toast.success("Message sent successfully!");

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "general",
        message: "",
      });
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPinIcon,
      title: "Visit Us",
      content: "Ladipo, Mushin, Lagos, Nigeria",
      color: "blue",
    },
    {
      icon: PhoneIcon,
      title: "Call Us",
      content: "+234 902 557 9441",
      link: "tel:+2349025579441",
      color: "green",
    },
    {
      icon: EnvelopeIcon,
      title: "Email Us",
      content: "Edmichservices@gmail.com",
      link: "mailto:edmichservices@gmail.com",
      color: "purple",
    },
    {
      icon: ClockIcon,
      title: "Business Hours",
      content: "Mon - Fri: 8AM - 6PM, Sat: 9AM - 3PM",
      color: "orange",
    },
  ];

  const categories = [
    { value: "general", label: "General Inquiry" },
    { value: "supplier", label: "Become a Supplier" },
    { value: "mechanic", label: "Mechanic Partnership" },
    { value: "logistics", label: "Logistics Partnership" },
    { value: "grant", label: "Grant & Funding Partnership" },
    { value: "support", label: "Technical Support" },
    { value: "other", label: "Other" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      {/* ————————— EXISTING UI BELOW ————————— */}
      {/* NOTHING REMOVED OR REDESIGNED */}
      {/* FULL ORIGINAL UI MAINTAINED EXACTLY */}
      {/* ———————————————————————————————— */}

      {/* HERO */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-full mb-6">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-bold text-blue-600">
                We're Here to Help
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-neutral-900 mb-6">
              Get in{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>

            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Have questions about our platform, partnerships, or impact
              initiatives? We'd love to hear from you.
            </p>
          </div>

          {/* CONTACT CARDS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-xl hover:scale-105 transition-all text-center"
              >
                <div
                  className={`w-14 h-14 bg-${info.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4`}
                >
                  <info.icon className={`h-7 w-7 text-${info.color}-600`} />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">
                  {info.title}
                </h3>
                {info.link ? (
                  <a
                    href={info.link}
                    className="text-neutral-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    {info.content}
                  </a>
                ) : (
                  <p className="text-neutral-600">{info.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 border-2 border-neutral-200 shadow-xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">
                Send Us a Message
              </h2>
              <p className="text-lg text-neutral-600">
                Fill out the form below and we'll get back to you within 24
                hours
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NAME + EMAIL */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* PHONE + CATEGORY */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+234 XXX XXX XXXX"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Category *
                  </label>
                  <div className="relative">
                    <BuildingOfficeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:border-blue-500 appearance-none bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SUBJECT */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:border-blue-500 transition-colors"
                />
              </div>

              {/* MESSAGE */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Tell us more about your inquiry..."
                  className="w-full px-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5" />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-center text-sm text-neutral-500">
                By submitting this form, you agree to our privacy policy and
                terms of service.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* PARTNERSHIP CTA */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border-2 border-green-200">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-3xl font-black text-neutral-900 mb-4">
                  Interested in Partnership or Funding?
                </h3>
                <p className="text-lg text-neutral-700 mb-6">
                  We're actively seeking partners and funders to scale our
                  impact across Africa's mobility sector.
                </p>

                <a
                  href="mailto:edmichservices@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                >
                  <EnvelopeIcon className="h-5 w-5" />
                  Edmichservices@gmail.com
                </a>
              </div>

              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                  <CheckCircleIcon className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="py-16 px-6 bg-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden border-2 border-neutral-200 shadow-xl">
            <div className="aspect-video bg-neutral-200 flex items-center justify-center">
              <div className="text-center">
                <MapPinIcon className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 font-semibold">
                  Map Integration Coming Soon
                </p>
                <p className="text-sm text-neutral-500">
                  Ladipo, Mushin, Lagos, Nigeria
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
