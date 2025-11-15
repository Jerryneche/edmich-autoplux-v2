// app/dashboard/logistics/settings/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function LogisticsSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return null;
  if (!session || session.user.role !== "LOGISTICS") {
    router.push("/dashboard");
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <Header />
      <div className="pt-32 pb-20 max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">
          Logistics Settings
        </h1>
        <p className="text-neutral-600 mb-10">
          Manage your delivery operations
        </p>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Company Info
            </h2>
            <input
              type="text"
              placeholder="Company Name"
              defaultValue={session.user.name}
              className="w-full mb-3 px-4 py-2 border-2 border-neutral-200 rounded-xl"
            />
            <textarea
              placeholder="Coverage Areas (Lagos, Abuja...)"
              rows={3}
              className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl"
            />
            <button className="mt-3 px-6 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">
              Update
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Fleet Status
            </h2>
            <label className="flex items-center justify-between">
              <span className="text-neutral-700">Available for delivery</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-green-600 rounded"
              />
            </label>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
