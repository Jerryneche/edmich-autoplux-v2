"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Profile updated!");
        setIsEditing(false);
        fetchProfile();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (isLoading || status === "loading") {
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
            My Profile
          </h1>
          <p className="text-neutral-600">Manage your account information</p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  {user?.name || "User"}
                </h2>
                <p className="text-neutral-600">{user?.role || "BUYER"}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors flex items-center gap-2"
            >
              <PencilIcon className="h-5 w-5" />
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-neutral-600">Email</p>
                  <p className="font-semibold text-neutral-900">
                    {user?.email}
                  </p>
                </div>
              </div>

              {user?.phone && (
                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                  <PhoneIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-neutral-600">Phone</p>
                    <p className="font-semibold text-neutral-900">
                      {user.phone}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                <UserCircleIcon className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-neutral-600">Account Type</p>
                  <p className="font-semibold text-neutral-900">{user?.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Link
            href="/dashboard/buyer/orders"
            className="p-6 bg-white rounded-2xl border-2 border-neutral-200 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              My Orders
            </h3>
            <p className="text-neutral-600">View your order history</p>
          </Link>

          <Link
            href="/dashboard/buyer/addresses"
            className="p-6 bg-white rounded-2xl border-2 border-neutral-200 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              My Addresses
            </h3>
            <p className="text-neutral-600">Manage delivery addresses</p>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
