// app/business/market/ClientMarket.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard"; // USED
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ProductCardData } from "@/app/types/product";

const PLACEHOLDER_PRODUCTS: ProductCardData[] = [
  /* your 10+ items */
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

    // NORMALIZE null → undefined
    return Array.isArray(data)
      ? data.map((p: any) => ({
          ...p,
          description: p.description ?? undefined,
          image: p.image ?? undefined,
          supplier: p.supplier ?? undefined,
          rating: p.rating ?? undefined,
          createdAt: p.createdAt ?? undefined,
        }))
      : [];
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
              <SparklesIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {filteredProducts.length} Parts Found
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-4">
              Autoplux{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Marketplace
              </span>
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Browse verified spare parts from trusted suppliers across Nigeria
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search for parts, categories, or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-neutral-200 rounded-xl text-neutral-700 font-medium hover:border-blue-300 transition-all">
              <FunnelIcon className="h-4 w-4" />
              Filters
            </button>
            <div className="hidden md:flex gap-2">
              {[
                "All",
                "Brakes",
                "Engine",
                "Filters",
                "Lighting",
                "Electrical",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    category === cat
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-neutral-200 text-neutral-700 hover:border-blue-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">
              {filteredProducts.length} Products
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 bg-white border-2 border-neutral-200 rounded-xl text-neutral-700 font-medium focus:border-blue-500 focus:outline-none"
            >
              <option>Sort by: Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Top Rated</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-neutral-200">
            <ShoppingCartIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-xl font-semibold text-neutral-900 mb-2">
              No products available
            </p>
            <p className="text-neutral-600 mb-6">
              Check back soon for new inventory
            </p>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        <div ref={observerRef} className="h-1 w-full" />

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
