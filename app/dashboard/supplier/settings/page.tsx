"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  BuildingStorefrontIcon,
  GlobeAltIcon,
  PhotoIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

const SOCIAL_PLATFORMS = [
  {
    name: "whatsapp",
    label: "WhatsApp",
    icon: "💬",
    placeholder: "2348012345678",
    prefix: "https://wa.me/",
  },
  {
    name: "instagram",
    label: "Instagram",
    icon: "📷",
    placeholder: "@yourbusiness",
    prefix: "https://instagram.com/",
  },
  {
    name: "facebook",
    label: "Facebook",
    icon: "👥",
    placeholder: "your.page.name",
    prefix: "https://facebook.com/",
  },
  {
    name: "twitter",
    label: "Twitter/X",
    icon: "🐦",
    placeholder: "@yourbusiness",
    prefix: "https://twitter.com/",
  },
  {
    name: "tiktok",
    label: "TikTok",
    icon: "🎵",
    placeholder: "@yourbusiness",
    prefix: "https://tiktok.com/@",
  },
  {
    name: "website",
    label: "Website",
    icon: "🌐",
    placeholder: "https://yourbusiness.com",
    prefix: "",
  },
];

const BUSINESS_HOURS_TEMPLATE = {
  monday: "9:00 AM - 6:00 PM",
  tuesday: "9:00 AM - 6:00 PM",
  wednesday: "9:00 AM - 6:00 PM",
  thursday: "9:00 AM - 6:00 PM",
  friday: "9:00 AM - 6:00 PM",
  saturday: "9:00 AM - 4:00 PM",
  sunday: "Closed",
};

export default function SupplierSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    city: "",
    state: "",
    businessAddress: "",
    tagline: "",
    website: "",
    instagram: "",
    facebook: "",
    twitter: "",
    whatsapp: "",
    tiktok: "",
    businessHours: JSON.stringify(BUSINESS_HOURS_TEMPLATE),
    coverImage: "",
    logo: "",
    metaDescription: "",
  });

  const [activeTab, setActiveTab] = useState<
    "basic" | "social" | "hours" | "branding"
  >("basic");

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

    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/onboarding/supplier");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();

      if (!data.hasProfile) {
        router.push("/onboarding/supplier");
        return;
      }

      const profile = data.supplierProfile;
      setFormData({
        businessName: profile.businessName || "",
        description: profile.description || "",
        city: profile.city || "",
        state: profile.state || "",
        businessAddress: profile.businessAddress || "",
        tagline: profile.tagline || "",
        website: profile.website || "",
        instagram: profile.instagram || "",
        facebook: profile.facebook || "",
        twitter: profile.twitter || "",
        whatsapp: profile.whatsapp || "",
        tiktok: profile.tiktok || "",
        businessHours:
          profile.businessHours || JSON.stringify(BUSINESS_HOURS_TEMPLATE),
        coverImage: profile.coverImage || "",
        logo: profile.logo || "",
        metaDescription: profile.metaDescription || "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/supplier/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const parseBusinessHours = () => {
    try {
      return JSON.parse(formData.businessHours);
    } catch {
      return BUSINESS_HOURS_TEMPLATE;
    }
  };

  const updateBusinessHours = (day: string, value: string) => {
    const hours = parseBusinessHours();
    hours[day] = value;
    setFormData((prev) => ({
      ...prev,
      businessHours: JSON.stringify(hours),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const businessHours = parseBusinessHours();

  return (
    <main className="bg-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Business Settings
          </h1>
          <p className="text-neutral-600">
            Manage your business profile and social media presence
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: "basic", label: "Basic Info", icon: "📋" },
            { id: "social", label: "Social Media", icon: "🔗" },
            { id: "hours", label: "Business Hours", icon: "⏰" },
            { id: "branding", label: "Branding", icon: "🎨" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="bg-white border-2 border-neutral-200 rounded-2xl p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="e.g., Quality Auto Parts Since 2010"
                  maxLength={60}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
                <p className="text-sm text-neutral-500 mt-1">
                  {formData.tagline.length}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell customers about your business..."
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  Business Address *
                </label>
                <input
                  type="text"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === "social" && (
            <div className="bg-white border-2 border-neutral-200 rounded-2xl p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Social Media Links
                </h3>
                <p className="text-neutral-600">
                  Connect your social media accounts to build trust and reach
                  more customers
                </p>
              </div>

              <div className="space-y-6">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div key={platform.name}>
                    <label className="block text-sm font-bold text-neutral-900 mb-2">
                      <span className="mr-2">{platform.icon}</span>
                      {platform.label}
                    </label>
                    <div className="flex items-center gap-3">
                      {platform.prefix && (
                        <span className="text-sm text-neutral-500 bg-neutral-100 px-3 py-3 rounded-xl">
                          {platform.prefix}
                        </span>
                      )}
                      <input
                        type="text"
                        name={platform.name}
                        value={(formData as any)[platform.name]}
                        onChange={handleChange}
                        placeholder={platform.placeholder}
                        className="flex-1 px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <h4 className="font-bold text-blue-900 mb-2">💡 Pro Tip</h4>
                <p className="text-sm text-blue-800">
                  Customers are 3x more likely to trust businesses with active
                  social media presence. Make sure to link all your active
                  accounts!
                </p>
              </div>
            </div>
          )}

          {/* Business Hours Tab */}
          {activeTab === "hours" && (
            <div className="bg-white border-2 border-neutral-200 rounded-2xl p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Business Hours
                </h3>
                <p className="text-neutral-600">
                  Let customers know when you're open
                </p>
              </div>

              <div className="space-y-4">
                {Object.keys(businessHours).map((day) => (
                  <div key={day} className="flex items-center gap-4">
                    <label className="w-32 text-sm font-bold text-neutral-900 capitalize">
                      {day}
                    </label>
                    <input
                      type="text"
                      value={businessHours[day]}
                      onChange={(e) => updateBusinessHours(day, e.target.value)}
                      placeholder="9:00 AM - 6:00 PM or Closed"
                      className="flex-1 px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-6 bg-neutral-50 border-2 border-neutral-200 rounded-xl">
                <h4 className="font-bold text-neutral-900 mb-2">
                  Example Formats:
                </h4>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• 9:00 AM - 6:00 PM</li>
                  <li>• 8AM - 5PM</li>
                  <li>• Closed</li>
                  <li>• 24 Hours</li>
                  <li>• By Appointment Only</li>
                </ul>
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === "branding" && (
            <div className="bg-white border-2 border-neutral-200 rounded-2xl p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
                {formData.logo && (
                  <div className="mt-4 relative w-32 h-32 bg-neutral-100 rounded-xl overflow-hidden">
                    <Image
                      src={formData.logo}
                      alt="Logo preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
                {formData.coverImage && (
                  <div className="mt-4 relative w-full h-48 bg-neutral-100 rounded-xl overflow-hidden">
                    <Image
                      src={formData.coverImage}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  SEO Description
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows={3}
                  maxLength={160}
                  placeholder="Brief description for search engines (160 characters max)"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                />
                <p className="text-sm text-neutral-500 mt-1">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>

              <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <h4 className="font-bold text-purple-900 mb-2">
                  🎨 Upload Images
                </h4>
                <p className="text-sm text-purple-800 mb-3">
                  Use image hosting services like:
                </p>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Cloudinary (cloudinary.com)</li>
                  <li>• ImgBB (imgbb.com)</li>
                  <li>• Imgur (imgur.com)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}
