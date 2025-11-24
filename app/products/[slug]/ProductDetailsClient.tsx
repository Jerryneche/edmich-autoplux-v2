"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCartIcon,
  HeartIcon,
  MapPinIcon,
  CheckBadgeIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

interface ProductDetailsClientProps {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    price: number;
    category: string;
    image: string | null;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
    supplier: {
      id: string;
      businessName: string;
      city: string;
      state: string;
      verified: boolean;
    };
  };
}

export default function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = async () => {
    if (!session) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add to cart");
      }

      toast.success(`${product.name} added to cart!`);
      router.refresh();
    } catch (error: any) {
      console.error("Add to cart error:", error);
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!session) {
      toast.error("Please login to save favorites");
      router.push("/login");
      return;
    }
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 font-semibold"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="relative w-full aspect-square bg-neutral-100 rounded-3xl overflow-hidden shadow-2xl">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCartIcon className="h-32 w-32 text-neutral-300" />
                </div>
              )}
            </div>

            {/* Stock Badge */}
            <div className="absolute top-4 right-4">
              {product.stock > 0 ? (
                <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg">
                  {product.stock} in stock
                </span>
              ) : (
                <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold shadow-lg">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div>
            {/* Category */}
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
              {product.category}
            </span>

            {/* Product Name */}
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              {product.name}
            </h1>

            {/* Description */}
            {product.description && (
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="mb-8">
              <p className="text-sm text-neutral-500 mb-1">Price</p>
              <p className="text-5xl font-bold text-neutral-900">
                ₦{product.price.toLocaleString()}
              </p>
            </div>

            {/* Supplier Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border-2 border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-neutral-900">
                      {product.supplier.businessName}
                    </h3>
                    {product.supplier.verified && (
                      <CheckBadgeIcon className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-600">
                    {product.supplier.city}, {product.supplier.state}
                  </p>
                  {product.supplier.verified && (
                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      ✓ Verified Supplier
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 bg-neutral-100 rounded-xl font-bold text-xl hover:bg-neutral-200 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-neutral-900 w-16 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="w-12 h-12 bg-neutral-100 rounded-xl font-bold text-xl hover:bg-neutral-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  product.stock === 0
                    ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:scale-105"
                }`}
              >
                {isAddingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon className="h-6 w-6" />
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </>
                )}
              </button>

              <button
                onClick={handleToggleFavorite}
                className="px-6 py-4 bg-white border-2 border-neutral-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all"
              >
                {isFavorite ? (
                  <HeartSolidIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-neutral-600" />
                )}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-xl border-2 border-neutral-200">
                <TruckIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-neutral-600">
                  Fast Delivery
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border-2 border-neutral-200">
                <ShieldCheckIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-neutral-600">
                  Secure Payment
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border-2 border-neutral-200">
                <CheckBadgeIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-neutral-600">
                  Quality Assured
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
