"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

export default function KYCSubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    idType: "national_id",
    idNumber: "",
    businessName: "",
    businessRegNumber: "",
    address: "",
    city: "",
    state: "",
  });

  const [files, setFiles] = useState({
    idFront: null as File | null,
    idBack: null as File | null,
    selfie: null as File | null,
    businessCert: null as File | null,
  });

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles({ ...files, [field]: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload files first (you'll need to implement file upload API)
      const uploadedUrls: any = {};

      // For now, we'll just submit the form data
      // In production, you'd upload files to S3 or similar first
      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          idFrontUrl: uploadedUrls.idFront || null,
          idBackUrl: uploadedUrls.idBack || null,
          selfieUrl: uploadedUrls.selfie || null,
          businessCertUrl: uploadedUrls.businessCert || null,
        }),
      });

      if (response.ok) {
        toast.success("KYC submitted successfully!");
        router.push("/dashboard/kyc/status");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to submit KYC");
      }
    } catch (error) {
      toast.error("Failed to submit KYC");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            KYC Verification
          </h1>
          <p className="text-neutral-600">
            Submit your documents for verification
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg space-y-6"
        >
          {/* ID Type */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              ID Type *
            </label>
            <select
              value={formData.idType}
              onChange={(e) =>
                setFormData({ ...formData, idType: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="national_id">National ID</option>
              <option value="drivers_license">Driver's License</option>
              <option value="passport">International Passport</option>
              <option value="voters_card">Voter's Card</option>
            </select>
          </div>

          {/* ID Number */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              ID Number *
            </label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) =>
                setFormData({ ...formData, idNumber: e.target.value })
              }
              placeholder="Enter your ID number"
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Business Info (Optional for suppliers) */}
          {session?.user?.role === "SUPPLIER" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  placeholder="Enter business name"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Business Registration Number
                </label>
                <input
                  type="text"
                  value={formData.businessRegNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessRegNumber: e.target.value,
                    })
                  }
                  placeholder="CAC registration number"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Enter your address"
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
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
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="City"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                State *
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                placeholder="State"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="border-t-2 border-neutral-200 pt-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              Document Uploads
            </h3>

            <div className="space-y-4">
              {[
                { key: "idFront", label: "ID Front *", required: true },
                { key: "idBack", label: "ID Back *", required: true },
                { key: "selfie", label: "Selfie with ID *", required: true },
                {
                  key: "businessCert",
                  label: "Business Certificate (Optional)",
                  required: false,
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    {field.label}
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      handleFileChange(
                        field.key as keyof typeof files,
                        e.target.files?.[0] || null
                      )
                    }
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    required={field.required}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Your documents will be reviewed within 2-3
              business days. Please ensure all information is accurate and
              documents are clear.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit for Verification"}
          </button>
        </form>
      </section>

      <Footer />
    </main>
  );
}
