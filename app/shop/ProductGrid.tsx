// app/shop/ProductGrid.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  stock: number;
  supplier: { businessName: string } | null;
}

export default function ProductGrid({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(initialProducts);

  // Client-side search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const matches = initialProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(value) ||
        p.description?.toLowerCase().includes(value) ||
        p.supplier?.businessName.toLowerCase().includes(value)
    );
    setFiltered(matches);
  };

  return (
    <div>
      {/* Search */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search parts, brands, or suppliers..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-4 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600">No products found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.id}`}
              className="group block"
            >
              <div className="bg-white rounded-2xl overflow-hidden border-2 border-neutral-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-square bg-neutral-50 p-8">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-20 h-20 text-neutral-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-neutral-900 text-lg line-clamp-1 group-hover:text-blue-600">
                    {product.name}
                  </h3>
                  <p className="text-sm text-neutral-600 line-clamp-2 mt-1">
                    {product.description || "High-quality auto part"}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">
                    By: {product.supplier?.businessName || "Unknown"}
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 mt-4">
                    ₦{product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
