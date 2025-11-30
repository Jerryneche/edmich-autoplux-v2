"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

interface KYCStatus {
  id: string;
  status: string;
  idType: string;
  idNumber: string;
  businessName: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export default function KYCStatusPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [kyc, setKyc] = useState<KYCStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (authStatus === "authenticated") {
      fetchKYCStatus();
    }
  }, [authStatus, router]);

  const fetchKYCStatus = async () => {
    try {
      const response = await fetch("/api/kyc/status");
      if (response.ok) {
        const data = await response.json();
        setKyc(data.kyc);
      }
    } catch (error) {
      console.error("Failed to fetch KYC status:", error);
      toast.error("Failed to load KYC status");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (kyc?.status) {
      case "approved":
        return <CheckCircleIcon className="h-20 w-20 text-green-500" />;
      case "pending":
        return <ClockIcon className="h-20 w-20 text-yellow-500" />;
      case "rejected":
        return <XCircleIcon className="h-20 w-20 text-red-500" />;
      default:
        return <DocumentTextIcon className="h-20 w-20 text-neutral-400" />;
    }
  };

  const getStatusColor = () => {
    switch (kyc?.status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const getStatusMessage = () => {
    switch (kyc?.status) {
      case "approved":
        return "Your KYC verification has been approved! You can now access all features.";
      case "pending":
        return "Your KYC documents are under review. This typically takes 2-3 business days.";
      case "rejected":
        return "Your KYC submission was rejected. Please review the feedback and resubmit.";
      default:
        return "You haven't submitted KYC documents yet.";
    }
  };

  if (isLoading || authStatus === "loading") {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            KYC Status
          </h1>
          <p className="text-neutral-600">Check your verification status</p>
        </div>

        {!kyc ? (
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-12 text-center shadow-lg">
            <DocumentTextIcon className="h-20 w-20 text-neutral-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">
              No KYC Submission
            </h2>
            <p className="text-neutral-600 mb-8">
              You haven't submitted your KYC documents yet. Complete
              verification to unlock all features.
            </p>
            <Link
              href="/dashboard/kyc/submit"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Verification
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
            <div className="text-center mb-8">
              {getStatusIcon()}
              <h2 className="text-3xl font-bold text-neutral-900 mt-6 mb-3">
                {kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1)}
              </h2>
              <span
                className={`inline-block px-6 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor()}`}
              >
                {kyc.status.toUpperCase()}
              </span>
            </div>

            <div className="bg-neutral-50 rounded-lg p-6 mb-8">
              <p className="text-neutral-700 text-center">
                {getStatusMessage()}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-3 border-b border-neutral-200">
                <span className="font-semibold text-neutral-700">ID Type</span>
                <span className="text-neutral-900">
                  {kyc.idType.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-neutral-200">
                <span className="font-semibold text-neutral-700">
                  ID Number
                </span>
                <span className="text-neutral-900">{kyc.idNumber}</span>
              </div>
              {kyc.businessName && (
                <div className="flex justify-between py-3 border-b border-neutral-200">
                  <span className="font-semibold text-neutral-700">
                    Business Name
                  </span>
                  <span className="text-neutral-900">{kyc.businessName}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-b border-neutral-200">
                <span className="font-semibold text-neutral-700">
                  Submitted On
                </span>
                <span className="text-neutral-900">
                  {new Date(kyc.submittedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              {kyc.reviewedAt && (
                <div className="flex justify-between py-3">
                  <span className="font-semibold text-neutral-700">
                    Reviewed On
                  </span>
                  <span className="text-neutral-900">
                    {new Date(kyc.reviewedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            {kyc.status === "rejected" && (
              <Link
                href="/dashboard/kyc/submit"
                className="block w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Resubmit Documents
              </Link>
            )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

// ==========================================
// FILE 3: app/dashboard/buyer/wallet/withdraw/page.tsx
