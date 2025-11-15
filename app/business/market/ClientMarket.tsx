// app/business/market/ClientMarket.tsx
"use client";

import { useState } from "react";
import ProductCard from "@/app/components/ProductCard";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  supplier: string;
  rating: number;
}

export default function ClientMarket({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(initialProducts.map((p) => p.category))),
  ];
  const filtered = initialProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {filtered.length === 0 ? (
        <p className="col-span-full text-center text-neutral-600 py-12">
          No products found
        </p>
      ) : (
        filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
    </div>
  );
}
