// app/dashboard/supplier/products/new/page.tsx
// app/dashboard/supplier/products/new/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ImageUploader from "@/app/components/ImageUploader";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import toast from "react-hot-toast";
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

export default function NewProductPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });

  // Fixed & robust input handler
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const name = target.name;
    let value: string = (target as HTMLInputElement).value ?? "";

    // If you later add checkboxes / files, handle them here
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
    if (!formData.image) {
      toast.error("Please upload a product image");
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
        image: formData.image,
      };

      const response = await fetch("/api/supplier/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Failed to create product");

      // Revalidate shop and market pages to show new product immediately
      await Promise.all([
        fetch("/api/revalidate?path=/shop", { method: "POST" }),
        fetch("/api/revalidate?path=/business/market", { method: "POST" }),
      ]);

      toast.success("Product added successfully! Now live in shop!");

      // Small delay to ensure revalidation completes
      setTimeout(() => {
        router.push("/dashboard/supplier");
        router.refresh();
      }, 500);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            href="/dashboard/supplier"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-600 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Dashboard
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Add New Product
            </h1>
            <p className="text-neutral-600">
              List a new auto part - it will appear instantly in the marketplace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="Describe your product features, compatibility, specifications..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none text-neutral-900"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    A detailed description helps buyers find and trust your
                    product
                  </p>
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
                    <p className="text-xs text-neutral-500 mt-1">
                      Set a competitive price for your product
                    </p>
                  </div>
                </div>

                {/* Stock */}
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
                  <p className="text-xs text-neutral-500 mt-1">
                    Number of units available for sale
                  </p>
                </div>

                {/* Product Image */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Product Image *
                  </label>
                  <ImageUploader
                    onUpload={(url) => {
                      console.log("UPLOADED URL:", url);
                      setFormData((prev) => ({ ...prev, image: url }));
                      toast.success("Image uploaded successfully!");
                    }}
                  />
                  <p className="text-sm text-neutral-500 mt-2">
                    Upload a clear, high-quality image of your product
                  </p>

                  {/* Preview */}
                  {formData.image && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-neutral-700 mb-2">
                        Preview:
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
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, image: "" }))
                        }
                        className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Publishing Notice */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex gap-3">
                <div className="text-2xl">🚀</div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">
                    Instant Publishing
                  </h3>
                  <p className="text-sm text-blue-800">
                    Your product will appear immediately in the shop and
                    marketplace once you click "Add Product". Make sure all
                    information is correct!
                  </p>
                </div>
              </div>
            </div>

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
                    Publishing Product...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-5 w-5" /> Add Product to Shop
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
