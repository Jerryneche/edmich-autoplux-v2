"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchAddresses();
    }
  }, [status, router]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        console.log("Addresses loaded:", data);
        setAddresses(data);
      } else {
        const error = await res.json();
        console.error("Failed to load addresses:", error);
        toast.error(error.error || "Failed to load addresses");
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    console.log("Submitting form data:", formData);

    try {
      const url = editingId
        ? `/api/user/addresses/${editingId}`
        : "/api/user/addresses";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const responseText = await res.text();
      console.log("Response status:", res.status);
      console.log("Response body:", responseText);

      if (res.ok) {
        toast.success(editingId ? "Address updated!" : "Address saved!");
        await fetchAddresses();
        resetForm();
      } else {
        let error;
        try {
          error = JSON.parse(responseText);
        } catch {
          error = { error: responseText };
        }
        console.error("Server error:", error);
        toast.error(error.error || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode || "",
      isDefault: address.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;

    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Address deleted");
        fetchAddresses();
      } else {
        toast.error("Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Network error");
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-600 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                My Addresses
              </h1>
              <p className="text-neutral-600">
                Manage your delivery addresses for faster checkout
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Add Address
            </button>
          </div>

          {/* Address Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                  {editingId ? "Edit Address" : "Add New Address"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+234 800 000 0000"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="123 Main Street"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="Lagos"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        placeholder="Lagos"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                        placeholder="100001"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isDefault: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 rounded border-2 border-neutral-300"
                    />
                    <span className="text-sm font-medium text-neutral-700">
                      Set as default address
                    </span>
                  </label>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Saving...
                        </span>
                      ) : (
                        `${editingId ? "Update" : "Save"} Address`
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={saving}
                      className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Address List */}
          {addresses.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-neutral-300 p-16 text-center">
              <div className="w-20 h-20 bg-neutral-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <MapPinIcon className="h-10 w-10 text-neutral-400" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                No addresses saved
              </h3>
              <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                Add your delivery addresses for faster checkout. You won't have
                to fill forms every time!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-white rounded-2xl border-2 border-neutral-200 p-6 hover:border-blue-300 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-neutral-900">
                          {addr.fullName}
                        </h3>
                        {addr.isDefault && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                            <CheckCircleIcon className="h-3 w-3" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-700 mb-1">{addr.address}</p>
                      <p className="text-neutral-600 mb-2">
                        {addr.city}, {addr.state}
                        {addr.zipCode && ` ${addr.zipCode}`}
                      </p>
                      <p className="text-sm text-neutral-600 font-medium">
                        {addr.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-neutral-200">
                    <button
                      onClick={() => handleEdit(addr)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
