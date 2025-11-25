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
  XMarkIcon,
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
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState<string>("");
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

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/heic",
      "image/heif",
    ];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error("Please upload a valid image file");
      return;
    }

    // Validate file size (10MB for Cloudinary)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    const uploadToast = toast.loading("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      setUploadedImageUrl(data.url);
      setCloudinaryPublicId(data.publicId);
      toast.success("Image uploaded successfully!", { id: uploadToast });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image", {
        id: uploadToast,
      });
      setImagePreview("");
      setUploadedImageUrl("");
      setCloudinaryPublicId("");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async () => {
    // Delete from Cloudinary if exists
    if (cloudinaryPublicId) {
      try {
        await fetch(`/api/upload?publicId=${cloudinaryPublicId}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }

    setImagePreview("");
    setUploadedImageUrl("");
    setCloudinaryPublicId("");
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
    if (!uploadedImageUrl) {
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
        imageUrl: uploadedImageUrl,
      };

      const response = await fetch("/api/supplier/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      toast.success("Product created successfully!");

      // Revalidate pages
      Promise.all([
        fetch("/api/revalidate?path=/shop", { method: "POST" }).catch(() => {}),
        fetch("/api/revalidate?path=/business/market", {
          method: "POST",
        }).catch(() => {}),
      ]);

      setTimeout(() => {
        router.push("/dashboard/supplier");
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-neutral-600">Loading...</p>
        </div>
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
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 font-semibold transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl p-8 border-2 border-neutral-200 shadow-lg">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
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
            {/* Product Image Upload - FIRST */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Product Image *
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-all">
                {imagePreview ? (
                  <div className="relative">
                    <div className="relative w-full aspect-square max-w-md mx-auto mb-4 rounded-xl overflow-hidden bg-neutral-100">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>

                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl backdrop-blur-sm">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-3" />
                          <p className="text-white font-bold text-lg">
                            Uploading to cloud...
                          </p>
                          <p className="text-white/80 text-sm">Please wait</p>
                        </div>
                      </div>
                    )}

                    {uploadedImageUrl && (
                      <div className="mb-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Image uploaded successfully
                        </div>
                      </div>
                    )}

                    {!isUploading && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-all"
                      >
                        <XMarkIcon className="h-5 w-5" />
                        Remove & Upload New
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PhotoIcon className="h-10 w-10 text-blue-600" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold cursor-pointer hover:shadow-xl hover:scale-105 transition-all ${
                        isUploading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Choose Image to Upload
                    </label>
                    <p className="text-sm text-neutral-500 mt-3">
                      Supports: JPG, PNG, WebP, GIF, HEIC • Max 10MB
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Image will be optimized automatically
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rest of form - Only show when image is uploaded */}
            {uploadedImageUrl && (
              <>
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
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
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
                    placeholder="Describe your product in detail..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none transition-colors"
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
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
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
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Number of units available
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
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    isSubmitting || isUploading
                      ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:scale-105"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Creating Product...
                    </span>
                  ) : (
                    "Create Product & List in Marketplace"
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
