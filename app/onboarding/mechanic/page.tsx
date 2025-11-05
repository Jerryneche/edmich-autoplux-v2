"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import {
  WrenchScrewdriverIcon,
  MapPinIcon,
  ClockIcon,
  BanknotesIcon,
  CheckCircleIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

export default function MechanicOnboarding() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState("");
  const [formData, setFormData] = useState({
    specialty: "",
    experience: "",
    location: "",
    city: "",
    state: "",
    hourlyRate: "",
    bio: "",
    workingHours: "",
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

  const specialties = [
    "General Mechanic",
    "Engine Specialist",
    "Transmission Expert",
    "Electrical Systems",
    "Brake & Suspension",
    "AC & Cooling Systems",
    "Body Work & Paint",
    "Diagnostics Specialist",
  ];

  const experienceLevels = [
    "1-3 years",
    "3-5 years",
    "5-10 years",
    "10-15 years",
    "15+ years",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addCertification = () => {
    if (
      newCertification.trim() &&
      !certifications.includes(newCertification.trim())
    ) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter((c) => c !== cert));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/onboarding/mechanic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          certifications,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete onboarding");
      }

      // Update session
      await update();

      toast.success("Profile created successfully!");

      setTimeout(() => {
        router.push("/dashboard/mechanic");
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

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
            Complete your profile to start accepting bookings on EDMICH
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border-2 border-neutral-200 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Professional Information */}
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <WrenchScrewdriverIcon className="h-6 w-6 text-purple-600" />
                Professional Information
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Specialty *
                  </label>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                    required
                  >
                    <option value="">Select your specialty</option>
                    {specialties.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Years of Experience *
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                    required
                  >
                    <option value="">Select experience level</option>
                    {experienceLevels.map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    About You
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell clients about your experience and what makes you great..."
                    rows={4}
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="h-6 w-6 text-blue-600" />
                Location
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Workshop/Service Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., 123 Allen Avenue, Ikeja"
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
                      {nigerianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Availability */}
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <BanknotesIcon className="h-6 w-6 text-green-600" />
                Pricing & Availability
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Hourly Rate (₦) *
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    placeholder="e.g., 5000"
                    min="0"
                    step="500"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                    required
                  />
                  <p className="mt-2 text-xs text-neutral-500">
                    This is your base rate. You can adjust pricing for specific
                    services.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Working Hours
                  </label>
                  <input
                    type="text"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    placeholder="e.g., Mon-Sat: 8:00 AM - 6:00 PM"
                    className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <ClockIcon className="h-6 w-6 text-orange-600" />
                Certifications (Optional)
              </h3>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="e.g., ASE Certified, Toyota Training"
                    className="flex-1 px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCertification();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addCertification}
                    className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>

                {certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {certifications.map((cert, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg"
                      >
                        <span className="text-sm font-medium text-purple-900">
                          {cert}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCertification(cert)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
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
        </div>
      </section>
    </main>
  );
}
