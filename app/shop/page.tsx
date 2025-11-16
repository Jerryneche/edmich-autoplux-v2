// app/shop/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import { useCart } from "@/app/context/CartContext";

const CATEGORIES = [
  "All",
  "Brakes",
  "Engine",
  "Filters",
  "Lighting",
  "Electrical",
  "Cooling",
  "Suspension",
  "Transmission",
  "Exhaust",
  "Accessories",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
  { value: "popular", label: "Most Popular" },
];

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
  stock: number;
  supplier: {
    businessName: string;
    city: string;
    state: string | null;
    verified: boolean;
  };
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, items } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [inStockOnly, setInStockOnly] = useState(
    searchParams.get("inStock") === "true"
  );
  const [supplierCity, setSupplierCity] = useState(
    searchParams.get("city") || ""
  );
  const [supplierState, setSupplierState] = useState(
    searchParams.get("state") || ""
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [
    searchQuery,
    selectedCategory,
    sortBy,
    minPrice,
    maxPrice,
    inStockOnly,
    supplierCity,
    supplierState,
    currentPage,
  ]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedCategory !== "All")
        params.append("category", selectedCategory);
      if (sortBy) params.append("sortBy", sortBy);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (inStockOnly) params.append("inStock", "true");
      if (supplierCity) params.append("city", supplierCity);
      if (supplierState) params.append("state", supplierState);
      params.append("page", currentPage.toString());

      const response = await fetch(`/api/products/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSupplierCity("");
    setSupplierState("");
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    selectedCategory !== "All",
    minPrice !== "",
    maxPrice !== "",
    inStockOnly,
    supplierCity !== "",
    supplierState !== "",
  ].filter(Boolean).length;

  const getItemCount = (productId: string) => {
    const item = items.find((i) => i.id === productId);
    return item?.quantity || 0;
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock > 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "",
        stock: product.stock,
      });
      toast.success("Added to cart");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      {/* Hero Banner */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Find the Perfect{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Auto Parts
            </span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
            Browse {totalCount}+ verified products from trusted suppliers
          </p>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for brake pads, filters, engine parts..."
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-4 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-all"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border-2 border-neutral-200 rounded-lg text-neutral-700 font-medium focus:border-blue-500 focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t-2 border-neutral-200">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Price Range (₦)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      className="flex-1 px-3 py-2 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <span className="flex items-center text-neutral-500">
                      —
                    </span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      className="flex-1 px-3 py-2 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Supplier City
                  </label>
                  <input
                    type="text"
                    value={supplierCity}
                    onChange={(e) => setSupplierCity(e.target.value)}
                    placeholder="e.g., Lagos"
                    className="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Supplier State
                  </label>
                  <input
                    type="text"
                    value={supplierState}
                    onChange={(e) => setSupplierState(e.target.value)}
                    placeholder="e.g., Lagos"
                    className="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="h-5 w-5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-neutral-700">
                    Show only in-stock items
                  </span>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={fetchProducts}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-neutral-600">
            Showing{" "}
            <span className="font-semibold text-neutral-900">
              {products.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-neutral-900">{totalCount}</span>{" "}
            products
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-neutral-200"></div>
                <div className="p-5">
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-2xl font-bold text-neutral-900 mb-2">
              No products found
            </p>
            <p className="text-neutral-600 mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const itemCount = getItemCount(product.id);
                return (
                  <div key={product.id} className="group relative">
                    <Link href={`/shop/${product.id}`} className="block">
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
                              <div className="text-6xl">📦</div>
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            {product.stock > 0 ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                In Stock
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          {product.supplier.verified && (
                            <div className="absolute top-3 right-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                              ✓ Verified
                            </div>
                          )}
                        </div>

                        <div className="p-5">
                          <h3 className="font-bold text-neutral-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-neutral-600 line-clamp-2 mt-1">
                            {product.description || "High-quality auto part"}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-neutral-500">
                                {product.supplier.businessName}
                              </p>
                              <p className="text-xs text-neutral-400">
                                {product.supplier.city}
                                {product.supplier.state &&
                                  `, ${product.supplier.state}`}
                              </p>
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-neutral-900 mt-4">
                            ₦{product.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Link>

                    {product.stock > 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="absolute bottom-5 right-5 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all group"
                      >
                        <ShoppingBagIcon className="h-6 w-6" />
                        {itemCount > 0 && (
                          <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full shadow">
                            {itemCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border-2 border-neutral-200 rounded-lg font-semibold hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-white border-2 border-neutral-200 hover:border-blue-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border-2 border-neutral-200 rounded-lg font-semibold hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white">
          <Header />
          <div className="pt-32 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading products...</p>
            </div>
          </div>
        </main>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
