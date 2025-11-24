"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import {
  ArrowLeftIcon,
  PhotoIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

const CATEGORIES = [
  "Engine",
  "Transmission",
  "Suspension",
  "Brakes",
  "Electrical",
  "Body Parts",
  "Interior",
  "Exhaust",
  "Cooling",
  "Fuel System",
  "Other",
];

export default function NewProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required");
      return false;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error("Valid stock quantity is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create FormData instead of JSON
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description.trim() || "");
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("stock", formData.stock);

      // Append the actual file if it exists
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const response = await fetch("/api/supplier/products", {
        method: "POST",
        body: formDataToSend,
        // Don't set Content-Type header - browser will set it automatically with boundary
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      const data = await response.json();

      // Revalidate shop and market pages
      await Promise.all([
        fetch("/api/revalidate?path=/shop", { method: "POST" }),
        fetch("/api/revalidate?path=/business/market", { method: "POST" }),
      ]);

      toast.success("Product added successfully! Now live in shop!");

      // Redirect with refresh
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-4xl mx-auto px-6">
        <Link
          href="/dashboard/supplier"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 font-semibold"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl p-8 border-2 border-neutral-200 shadow-lg">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <CubeIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Add New Product
              </h1>
              <p className="text-neutral-600">
                List a new auto part in the marketplace
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="e.g., Toyota Camry Engine Oil Filter"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
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
                placeholder="Detailed product description..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Price and Stock */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Price (₦) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="50000"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

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
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Number of units available for sale
                </p>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Product Image *
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                {imagePreview ? (
                  <div className="relative w-full h-64 mb-4">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <PhotoIcon className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  {imagePreview ? "Change Image" : "Upload Image"}
                </label>
                <p className="text-sm text-neutral-500 mt-2">
                  Upload a clear, high-quality image of your product
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                isSubmitting
                  ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:scale-105"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Creating Product...
                </span>
              ) : (
                "Create Product"
              )}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
