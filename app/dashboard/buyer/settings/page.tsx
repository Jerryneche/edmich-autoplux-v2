// app/dashboard/buyer/settings/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function BuyerSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === "loading") return null;
  if (!session || session.user.role !== "BUYER") {
    router.push("/dashboard");
    return null;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast.success("Password updated!");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <Toaster />
      <Header />
      <div className="pt-32 pb-20 max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">Settings</h1>
        <p className="text-neutral-600 mb-10">
          Manage your account and preferences
        </p>

        <div className="space-y-6">
          {/* Profile */}
          <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Profile</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  defaultValue={session.user.name || ""}
                  className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={session.user.email || ""}
                  disabled
                  className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl bg-neutral-50"
                />
              </div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                Save Changes
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-blue-500 outline-none"
              />
              <input
                type="password"
                placeholder="New password"
                className="w-full px-4 py-2 border-2 border-neutral-200 rounded-xl focus:border-blue-500 outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Notifications
            </h2>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-neutral-700">Email notifications</span>
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
