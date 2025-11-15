"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ImageUploader from "@/app/components/ImageUploader";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

const CATEGORIES = [
  "Brakes",
  "Engine",
  "Filters",
  "Lighting",
  "Electrical",
  "Cooling",
  "Suspension",
  "Transmission",
  "Exhaust",
  "Accessories",
  "Other",
];

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (status === "authenticated" && session?.user?.role !== "SUPPLIER") {
      router.push("/dashboard");
    }

    if (status === "authenticated") {
      fetchProduct();
    }
  }, [status, session, router, params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/supplier/products/${params.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }

      const product = await response.json();

      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        image: product.image || "",
      });
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Failed to load product");
      router.push("/dashboard/supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Please enter a valid price");
      return false;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error("Please enter a valid stock quantity");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        image: formData.image.trim() || null,
      };

      const response = await fetch(`/api/supplier/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      // Revalidate pages
      await Promise.all([
        fetch("/api/revalidate?path=/shop", { method: "POST" }),
        fetch("/api/revalidate?path=/business/market", { method: "POST" }),
      ]);

      toast.success("Product updated successfully! Changes are now live!");
      
      setTimeout(() => {
        router.push("/dashboard/supplier");
        router.refresh();
      }, 500);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
        <Toaster position="top-center" />
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading product...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back Button */}
          <Link
            href="/dashboard/supplier"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-600 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Dashboard
          </Link>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Edit Product
            </h1>
            <p className="text-neutral-600">
              Update your product - changes appear instantly in the marketplace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Information Card */}
            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Product Information
              </h2>

              <div className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Premium Brake Pads Set"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-neutral-900"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your product features, specifications, compatibility..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none text-neutral-900"
                  />
                </div>

                {/* Category & Price */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-neutral-900"
                      required
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Price (₦) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="25000"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-neutral-900"
                      required
                    />
                  </div>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="50"
                    min="0"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-neutral-900"
                    required
                  />
                  <p className="text-sm text-neutral-500 mt-2">
                    Number of units available for sale
                  </p>
                </div>

                {/* Product Image */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Product Image
                  </label>
                  <ImageUploader
                    onUpload={(url) => {
                      console.log("UPLOADED URL:", url);
                      setFormData((prev) => ({ ...prev, image: url }));
                      toast.success("Image updated successfully!");
                    }}
                  />
                  <p className="text-sm text-neutral-500 mt-2">
                    Upload a new image to replace the current one
                  </p>

                  {/* Image Preview */}
                  {formData.image && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-neutral-700 mb-2">
                        Current Image:
                      </p>
                      <div className="relative w-full h-64 bg-neutral-100 rounded-xl overflow-hidden border-2 border-neutral-200">
                        <Image
                          src={formData.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                        className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Update Notice */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex gap-3">
                <div className="text-2xl">✨</div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">
                    Live Updates
                  </h3>
                  <p className="text-sm text-blue-800">
                    Changes will be visible immediately on the shop and marketplace pages
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link
                href="/dashboard/supplier"
                className="flex-1 px-6 py-4 bg-white border-2 border-neutral-200 text-neutral-700 rounded-xl font-bold text-center hover:border-neutral-300 hover:shadow-md transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Updating Product...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    Update Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}