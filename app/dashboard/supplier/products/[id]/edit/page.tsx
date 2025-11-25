"use client";

import { useState, useEffect, use } from "react"; // Add 'use' import
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

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Unwrap params using React.use()
  const { id: productId } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [product, setProduct] = useState<any>(null);
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

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "SUPPLIER") {
      router.push("/dashboard");
      return;
    }
    fetchProduct();
  }, [status, session, router, productId]); // Use productId instead of params.id

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/supplier/products/${productId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }

      const data = await response.json();
      setProduct(data);
      setFormData({
        name: data.name,
        description: data.description || "",
        price: data.price.toString(),
        category: data.category,
        stock: data.stock.toString(),
      });

      if (data.image) {
        setImagePreview(data.image);
        setUploadedImageUrl(data.image);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
      router.push("/dashboard/supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    // Create preview
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
      setImagePreview(product?.image || "");
      setUploadedImageUrl(product?.image || "");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error("Valid stock quantity is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        imageUrl: uploadedImageUrl || product.image,
      };

      const response = await fetch(`/api/supplier/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      toast.success("Product updated successfully!");

      setTimeout(() => {
        router.push("/dashboard/supplier");
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-neutral-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
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
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <CubeIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Edit Product
              </h1>
              <p className="text-neutral-600">Update product information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Product Image
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-8 text-center hover:border-purple-400 transition-all">
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
                            Uploading...
                          </p>
                        </div>
                      </div>
                    )}

                    {!isUploading && (
                      <div className="flex gap-3 justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload-edit"
                        />
                        <label
                          htmlFor="image-upload-edit"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 cursor-pointer transition-all"
                        >
                          <PhotoIcon className="h-5 w-5" />
                          Change Image
                        </label>
                        {uploadedImageUrl !== product.image && (
                          <button
                            type="button"
                            onClick={removeImage}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-all"
                          >
                            <XMarkIcon className="h-5 w-5" />
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <PhotoIcon className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload-edit"
                    />
                    <label
                      htmlFor="image-upload-edit"
                      className="inline-block px-8 py-4 bg-purple-600 text-white rounded-xl font-bold cursor-pointer hover:bg-purple-700 transition-all"
                    >
                      Upload Image
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Rest of the form - same as new product page */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none transition-colors"
              />
            </div>

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
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
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
                  min="0"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
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

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                isSubmitting || isUploading
                  ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:scale-105"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Updating Product...
                </span>
              ) : (
                "Update Product"
              )}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
