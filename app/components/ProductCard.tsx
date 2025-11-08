"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, Star, TrendingUp } from "lucide-react";
import AddToCartButton from "@/app/components/AddToCartButton";
import { ProductCardData } from "@/app/types/product";

export default function ProductCard({
  product,
  searchQuery = "",
}: {
  product: ProductCardData;
  searchQuery?: string;
}) {
  // Escape regex special chars and create case-insensitive match
  const escapeRegExp = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const escapedQuery = escapeRegExp(query);
    const regex = new RegExp(`(${escapedQuery})`, "gi");

    return text.replace(
      regex,
      '<span class="bg-yellow-200 text-yellow-900 font-medium px-0.5 rounded">$1</span>'
    );
  };

  return (
    <div className="group relative rounded-2xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg shadow-black/5 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 hover:border-cyan-400/60">
      {/* Animated gradient overlay - Tesla cyan glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/0 via-cyan-500/0 to-cyan-600/0 group-hover:from-cyan-600/12 group-hover:via-cyan-500/8 group-hover:to-cyan-600/12 transition-all duration-500 rounded-2xl" />

      {/* Glow effect - Tesla style */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-25 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Image Container */}
        <Link href={`/business/market/${product.id}`} className="block">
          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-800 mb-4">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-neutral-600" />
              </div>
            )}

            {/* Stock Badge */}
            <div className="absolute top-3 right-3">
              {product.stock > 0 ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg">
                  <Package className="w-3 h-3" />
                  In Stock
                </div>
              ) : (
                <div className="px-3 py-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg">
                  Out of Stock
                </div>
              )}
            </div>

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full shadow-lg">
                {product.category}
              </div>
            </div>

            {/* Trending indicator */}
            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                <TrendingUp className="w-3 h-3" />
                Hot
              </div>
            </div>
          </div>
        </Link>

        {/* Product Info */}
        <div className="space-y-3">
          {/* Product Name - HIGHLIGHTED */}
          <Link href={`/business/market/${product.id}`}>
            <h3
              className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-cyan-600 transition-colors duration-300"
              dangerouslySetInnerHTML={{
                __html: highlightText(product.name, searchQuery),
              }}
            />
          </Link>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Supplier Info */}
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500">
              By:{" "}
              <span className="text-gray-800 font-semibold">
                {product.supplier || "Supplier"}
              </span>
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-gray-700 text-xs font-medium">4.5</span>
            </div>
          </div>

          {/* Price & Stock */}
          <div className="flex items-end justify-between pt-2 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">Price</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent">
                ₦{product.price.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {product.stock > 0
                  ? `${product.stock} available`
                  : "Out of stock"}
              </p>
            </div>

            {/* Quick Add Icon Button */}
            {/* Quick Add Icon Button */}
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                description: product.description ?? undefined,
                price: product.price,
                image: product.image ?? undefined,
                stock: product.stock,
                supplierId: product.supplierId,
              }}
              variant="icon"
            />
          </div>

          {/* Action Buttons - ONLY ONE "View Details" */}
          <div className="pt-3">
            <Link
              href={`/business/market/${product.id}`}
              className="block w-full text-center px-4 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl text-sm font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
