"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import {
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

const SPECIALIZATIONS = [
  "Engine Repair",
  "Transmission",
  "Brakes",
  "Electrical",
  "AC/Heating",
  "Suspension",
  "Body Work",
  "Diagnostics",
  "Oil Change",
  "Tire Service",
];

const CERTIFICATIONS = [
  "ASE Certified",
  "Manufacturer Certified",
  "Vocational Training",
  "Apprenticeship",
  "Other",
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

export default function MechanicOnboarding() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [formData, setFormData] = useState({
    businessName: "",
    specialty: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    experience: "",
    hourlyRate: "",
    bio: "",
    workingHours: "",
    responseTime: "",
  });
  const [selectedSpecializations, setSelectedSpecializations] = useState<
    string[]
  >([]);
  const [selectedCertifications, setSelectedCertifications] = useState<
    string[]
  >([]);

  // Check if user already has a profile
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "MECHANIC") {
      router.push("/dashboard");
      return;
    }

    checkExistingProfile();
  }, [session, status, router]);

  const checkExistingProfile = async () => {
    try {
      const response = await fetch("/api/onboarding/mechanic");

      if (response.ok) {
        const data = await response.json();

        // If profile exists, redirect to dashboard
        if (data.hasProfile && data.mechanicProfile) {
          toast.success("Welcome back!");
          router.push("/dashboard/mechanic");
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

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const toggleCertification = (cert: string) => {
    setSelectedCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSpecializations.length === 0) {
      toast.error("Please select at least one specialization");
      return;
    }

    if (
      !formData.businessName ||
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
        businessName: formData.businessName.trim(),
        specialty: selectedSpecializations[0],
        specialization: selectedSpecializations,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state,
        phone: formData.phone.trim(),
        experience: parseInt(formData.experience) || 0,
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
        bio: formData.bio.trim() || null,
        description: formData.bio.trim() || null,
        certifications:
          selectedCertifications.length > 0 ? selectedCertifications : [],
        workingHours: formData.workingHours.trim() || null,
        responseTime: formData.responseTime.trim() || null,
        location: `${formData.city.trim()}, ${formData.state}`,
      };

      const response = await fetch("/api/onboarding/mechanic", {
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
      router.replace("/dashboard/mechanic");

      // Force a hard refresh if soft navigation doesn't work
      setTimeout(() => {
        window.location.href = "/dashboard/mechanic";
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
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 mb-6">
            <WrenchScrewdriverIcon className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">
              Mechanic Registration
            </span>
          </div>

          <h1 className="text-5xl font-bold text-neutral-900 mb-4">
            Setup Your{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Mechanic Profile
            </span>
          </h1>
          <p className="text-xl text-neutral-600">
            Join our network of certified mechanics
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl border-2 border-neutral-200 p-8 md:p-10 space-y-8"
        >
          {/* Business Information */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <WrenchScrewdriverIcon className="h-6 w-6 text-purple-600" />
              Business Information
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Business/Workshop Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g., AutoFix Garage"
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="5"
                    min="0"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Hourly Rate (₦) *
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    placeholder="5000"
                    min="0"
                    step="100"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Bio/Description
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about your expertise and services..."
                  rows={4}
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              Specializations *
            </h3>
            <p className="text-sm text-neutral-600 mb-3">
              Select at least one specialization
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpecialization(spec)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    selectedSpecializations.includes(spec)
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
              Certifications (Optional)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CERTIFICATIONS.map((cert) => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => toggleCertification(cert)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    selectedCertifications.includes(cert)
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {cert}
                </button>
              ))}
            </div>
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
                  Workshop Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g., 123 Mechanic Village, Ikeja"
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
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
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
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
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
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
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              Availability (Optional)
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Working Hours
                </label>
                <input
                  type="text"
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleChange}
                  placeholder="e.g., Mon-Sat: 8AM-6PM"
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Response Time
                </label>
                <input
                  type="text"
                  name="responseTime"
                  value={formData.responseTime}
                  onChange={handleChange}
                  placeholder="e.g., Within 2 hours"
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
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
