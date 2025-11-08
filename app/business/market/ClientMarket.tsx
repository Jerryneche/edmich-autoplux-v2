// app/business/market/ClientMarket.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ProductCardData } from "@/app/types/product";

const PLACEHOLDER_PRODUCTS: ProductCardData[] = [
  /* same as before */
];

async function getProducts(
  page: number = 1,
  limit: number = 9
): Promise<ProductCardData[]> {
  try {
    const res = await fetch(`/api/products?page=${page}&limit=${limit}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Using placeholder:", error);
    return PLACEHOLDER_PRODUCTS.slice((page - 1) * limit, page * limit);
  }
}

export default function ClientMarket({
  initialProducts,
}: {
  initialProducts: ProductCardData[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [products, setProducts] = useState<ProductCardData[]>(initialProducts);
  const [page, setPage] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (page === 1) return;

    const loadMore = async () => {
      setIsLoading(true);
      const newProducts = await getProducts(page);
      setProducts((prev) => [...prev, ...newProducts]);
      setHasMore(newProducts.length === 9);
      setIsLoading(false);
    };

    loadMore();
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.supplier && p.supplier.toLowerCase().includes(query))
      );
    }

    switch (sort) {
      case "Price: Low to High":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, category, sort]);

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Header />
      {/* ... rest of your UI (same as before) ... */}
      <div ref={observerRef} className="h-1 w-full" />
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
        </div>
      )}
      <Footer />
    </main>
  );
}
