"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPinIcon,
  CheckBadgeIcon,
  ArrowLeftIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

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
      userId: string;
    };
  };
}

export default function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const { data: session } = useSession();
  const isOwnProduct = session?.user?.id === product.supplier.userId;

  // Optional: redirect if not owner (safe way)
  // Remove if you handle this server-side instead

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          href="/dashboard/supplier/products"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 font-semibold"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to My Products
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
                  <div className="text-neutral-400 text-6xl font-bold">
                    AUTOPLUX
                  </div>
                </div>
              )}
            </div>

            {/* Stock Badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`px-5 py-2 rounded-full text-sm font-bold shadow-lg ${
                  product.stock > 0
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </span>
            </div>

            {/* Your Product Badge */}
            {isOwnProduct && (
              <div className="absolute top-4 left-4">
                <span className="px-5 py-2 bg-purple-600 text-white rounded-full text-sm font-bold shadow-lg">
                  Your Product
                </span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
              {product.category}
            </span>

            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              {product.name}
            </h1>

            {product.description ? (
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                {product.description}
              </p>
            ) : (
              <p className="text-neutral-500 italic mb-8">
                No description added yet.
              </p>
            )}

            <div className="mb-10">
              <p className="text-sm text-neutral-500 mb-2">Selling Price</p>
              <p className="text-5xl font-bold text-neutral-900">
                ₦{product.price.toLocaleString()}
              </p>
            </div>

            {/* Supplier Card */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-100 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPinIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
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
                </div>
              </div>
            </div>

            {/* Edit Button - Only for Owner */}
            {isOwnProduct && (
              <Link
                href={`/dashboard/supplier/products/${product.id}/edit`}
                className="w-full block text-center py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
              >
                <PencilIcon className="inline h-5 w-5 mr-2" />
                Edit Product
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
