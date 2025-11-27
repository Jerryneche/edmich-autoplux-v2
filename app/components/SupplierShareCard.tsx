// components/SupplierShareCard.tsx
// Add this to your supplier settings page for social media marketing

import { useRef } from "react";
import Image from "next/image";
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  CheckBadgeIcon,
  QrCodeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

interface SupplierShareCardProps {
  businessName: string;
  tagline?: string | null;
  city: string;
  state: string;
  logo?: string | null;
  verified: boolean;
  productCount: number;
  qrCodeUrl?: string;
  publicUrl: string;
}

export default function SupplierShareCard({
  businessName,
  tagline,
  city,
  state,
  logo,
  verified,
  productCount,
  qrCodeUrl,
  publicUrl,
}: SupplierShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `${businessName}-share-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("Card downloaded! Share it on social media 🎉");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download card");
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="bg-neutral-100 p-8 rounded-2xl">
        <div
          ref={cardRef}
          className="w-full max-w-2xl mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 p-12 text-white relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-start gap-6 mb-6">
                {/* Logo */}
                <div className="w-24 h-24 bg-white rounded-2xl shadow-xl overflow-hidden flex-shrink-0">
                  {logo ? (
                    <Image
                      src={logo}
                      alt={businessName}
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                      <BuildingStorefrontIcon className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    <h3 className="text-3xl font-bold">{businessName}</h3>
                    {verified && (
                      <CheckBadgeIcon className="h-7 w-7 text-blue-300 flex-shrink-0" />
                    )}
                  </div>

                  {tagline && (
                    <p className="text-lg text-blue-100 mb-3">{tagline}</p>
                  )}

                  <div className="flex items-center gap-2 text-blue-100">
                    <MapPinIcon className="h-5 w-5" />
                    <span>
                      {city}, {state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">{productCount}</div>
                  <div className="text-sm text-blue-100">Quality Products</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">✓</div>
                  <div className="text-sm text-blue-100">Verified Supplier</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with QR and CTA */}
          <div className="p-8 bg-gradient-to-br from-neutral-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-neutral-900 mb-2">
                  Shop Our Products
                </h4>
                <p className="text-neutral-600 mb-4">
                  Scan QR code or visit our store
                </p>
                <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">
                  eagledom.com/suppliers
                </div>
              </div>

              {qrCodeUrl && (
                <div className="w-32 h-32 bg-white border-4 border-neutral-200 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={downloadCard}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all"
      >
        <ArrowDownTrayIcon className="h-6 w-6" />
        Download Share Card
      </button>

      {/* Usage Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6">
        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span className="text-2xl">📱</span>
          Share This Card
        </h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>Post on Instagram, Facebook, Twitter stories</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>Use as WhatsApp status to reach customers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>Print and display in your physical store</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>Add to business presentations and marketing materials</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// You'll need to install html2canvas:
// npm install html2canvas
// npm install --save-dev @types/html2canvas
