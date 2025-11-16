// app/dashboard/mechanic/settings/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function MechanicSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === "loading") return null;
  if (!session || session.user.role !== "MECHANIC") {
    router.push("/dashboard");
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <Toaster />
      <Header />
      <div className="pt-32 pb-20 max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">
          Mechanic Settings
        </h1>
        <p className="text-neutral-600 mb-10">
          Update your service profile and preferences
        </p>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Service Info
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Company Name"
                defaultValue={session.user.name || ""}
                className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="License Number"
                className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl"
              />
              <select className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl">
                <option>Vehicle Type</option>
                <option>Sedan</option>
                <option>SUV</option>
                <option>Truck</option>
              </select>
              <button className="px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700">
                Save
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Availability
            </h2>
            <label className="flex items-center justify-between">
              <span className="text-neutral-700">Accepting new jobs</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-purple-600 rounded"
              />
            </label>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
