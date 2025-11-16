// app/dashboard/supplier/settings/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function SupplierSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return null;
  if (!session || session.user.role !== "SUPPLIER") {
    router.push("/dashboard");
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <Header />
      <div className="pt-32 pb-20 max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">
          Supplier Settings
        </h1>
        <p className="text-neutral-600 mb-10">
          Manage your store and inventory
        </p>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Business Profile
            </h2>
            <input
              type="text"
              placeholder="Business Name"
              defaultValue={session.user.name || ""}
              className="w-full mb-3 px-4 py-2 border-2 border-neutral-200 rounded-xl"
            />
            <input
              type="text"
              placeholder="City, State"
              className="w-full mb-3 px-4 py-2 border-2 border-neutral-200 rounded-xl"
            />
            <textarea
              placeholder="Short description..."
              rows={3}
              className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl"
            />
            <button className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
              Save Profile
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Store Status
            </h2>
            <label className="flex items-center justify-between">
              <span className="text-neutral-700">Open for orders</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
