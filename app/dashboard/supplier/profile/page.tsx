"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  BuildingStorefrontIcon,
  LinkIcon,
  ShareIcon,
  QrCodeIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PencilSquareIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import QRCode from "qrcode";

export default function SupplierProfileSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [publicPageUrl, setPublicPageUrl] = useState<string>("");

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

      setProfile(data.supplierProfile);

      // Generate public page URL
      const baseUrl = window.location.origin;
      const pageUrl = `${baseUrl}/suppliers/${data.supplierProfile.id}`;
      setPublicPageUrl(pageUrl);

      // Generate QR Code
      try {
        const qr = await QRCode.toDataURL(pageUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: "#2563eb",
            light: "#ffffff",
          },
        });
        setQrCodeUrl(qr);
      } catch (err) {
        console.error("QR generation error:", err);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.businessName} - Auto Parts Supplier`,
          text: `Check out my store on EagleDom!`,
          url: publicPageUrl,
        });
      } catch (err) {
        console.error("Share error:", err);
      }
    } else {
      copyToClipboard(publicPageUrl);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement("a");
    link.download = `${profile.businessName}-QR.png`;
    link.href = qrCodeUrl;
    link.click();
    toast.success("QR code downloaded!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Supplier Profile Settings
          </h1>
          <p className="text-neutral-600">
            Manage your public storefront and business information
          </p>
        </div>

        {/* Public Page Preview */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-2xl p-8 text-white mb-8 shadow-2xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Your Public Storefront
              </h2>
              <p className="text-blue-100">
                Share your custom page with customers
              </p>
            </div>
            <Link
              href={`/suppliers/${profile.id}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl font-bold hover:shadow-xl transition-all"
            >
              <EyeIcon className="h-5 w-5" />
              Preview
            </Link>
          </div>

          {/* URL Display */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <LinkIcon className="h-6 w-6 text-blue-200 flex-shrink-0" />
              <code className="text-sm text-white flex-1 break-all">
                {publicPageUrl}
              </code>
              <button
                onClick={() => copyToClipboard(publicPageUrl)}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="Copy link"
              >
                <DocumentDuplicateIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl font-bold hover:bg-white/30 transition-all"
            >
              <ShareIcon className="h-5 w-5" />
              Share Link
            </button>
            <button
              onClick={() => copyToClipboard(publicPageUrl)}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl font-bold hover:bg-white/30 transition-all"
            >
              <DocumentDuplicateIcon className="h-5 w-5" />
              Copy Link
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Business Information */}
          <div className="bg-white border-2 border-neutral-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900">
                Business Information
              </h3>
              <Link
                href="/dashboard/supplier/settings"
                className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-700"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Edit
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-600 mb-1 block">
                  Business Name
                </label>
                <p className="text-lg font-semibold text-neutral-900">
                  {profile.businessName}
                </p>
              </div>

              <div>
                <label className="text-sm text-neutral-600 mb-1 block">
                  Location
                </label>
                <div className="flex items-center gap-2 text-neutral-900">
                  <MapPinIcon className="h-5 w-5 text-blue-600" />
                  <span>
                    {profile.city}, {profile.state}
                  </span>
                </div>
              </div>

              {profile.description && (
                <div>
                  <label className="text-sm text-neutral-600 mb-1 block">
                    Description
                  </label>
                  <p className="text-neutral-700">{profile.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm text-neutral-600 mb-1 block">
                  Status
                </label>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                    profile.verified
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {profile.verified ? "✓ Verified" : "⏳ Pending Verification"}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white border-2 border-neutral-200 rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                Your QR Code
              </h3>
              <p className="text-sm text-neutral-600">
                Print and display this QR code in your store for customers to
                scan
              </p>
            </div>

            {qrCodeUrl && (
              <div className="text-center">
                <div className="inline-block p-4 bg-white border-2 border-neutral-200 rounded-2xl mb-4">
                  <img
                    src={qrCodeUrl}
                    alt="Store QR Code"
                    className="w-64 h-64"
                  />
                </div>
                <button
                  onClick={downloadQRCode}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  <QrCodeIcon className="h-5 w-5" />
                  Download QR Code
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Marketing Tips */}
        <div className="mt-8 bg-gradient-to-br from-neutral-50 to-white border-2 border-neutral-200 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-neutral-900 mb-4">
            🚀 Marketing Tips for Your Storefront
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">1️⃣</span>
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 mb-1">
                  Share Your Link
                </h4>
                <p className="text-sm text-neutral-600">
                  Add your storefront link to WhatsApp status, Instagram bio,
                  and business cards
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">2️⃣</span>
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 mb-1">
                  Display QR Code
                </h4>
                <p className="text-sm text-neutral-600">
                  Print and place your QR code at your physical store entrance
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">3️⃣</span>
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 mb-1">
                  Keep Products Updated
                </h4>
                <p className="text-sm text-neutral-600">
                  Regular updates with new products keep customers coming back
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">4️⃣</span>
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 mb-1">
                  Respond Quickly
                </h4>
                <p className="text-sm text-neutral-600">
                  Fast responses to customer inquiries build trust and sales
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
