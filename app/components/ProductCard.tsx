// app/components/ProductCard.tsx
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
  // Highlight search matches
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    return text.replace(
      regex,
      '<span class="bg-yellow-200 text-yellow-900 font-medium px-1 rounded">$1</span>'
    );
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Image Section */}
      <Link href={`/business/market/${product.id}`} className="block relative">
        <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-800 rounded-full">
              {product.category}
            </span>
            {product.stock === 0 && (
              <span className="px-3 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3">
            {product.stock > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full">
                <Package className="w-3 h-3" />
                {product.stock}
              </div>
            )}
          </div>

          {/* Trending Badge */}
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
              <TrendingUp className="w-3 h-3" />
              Hot
            </div>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <Link href={`/business/market/${product.id}`}>
          <h3
            className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors"
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

        {/* Supplier & Rating */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">
            By:{" "}
            <span className="font-semibold text-gray-800">
              {product.supplier || "Supplier"}
            </span>
          </p>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-700">4.5</span>
          </div>
        </div>

        {/* Price & Stock */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-2xl font-bold text-blue-600">
              ₦{product.price.toLocaleString()}
            </p>
            {product.stock > 0 ? (
              <p className="text-xs text-green-600 font-medium">
                {product.stock} available
              </p>
            ) : (
              <p className="text-xs text-red-600 font-medium">Out of stock</p>
            )}
          </div>

          {/* Add to Cart */}
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              description: product.description,
              price: product.price,
              image: product.image,
              stock: product.stock,
              supplierId: product.supplierId,
            }}
            variant="default"
          />
        </div>

        {/* View Details Button */}
        <Link
          href={`/business/market/${product.id}`}
          className="block w-full mt-4 text-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
