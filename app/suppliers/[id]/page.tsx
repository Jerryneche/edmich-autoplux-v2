"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import Link from "next/link";
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  CheckBadgeIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  CubeIcon,
  ClockIcon,
  ShareIcon,
  SparklesIcon,
  TrophyIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import { useCart } from "@/app/context/CartContext";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
  stock: number;
  createdAt: string;
}

interface SupplierData {
  supplier: {
    id: string;
    businessName: string;
    description: string | null;
    city: string;
    state: string;
    verified: boolean;
    createdAt: string;
    tagline?: string | null;
    website?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    twitter?: string | null;
    whatsapp?: string | null;
    tiktok?: string | null;
    businessHours?: string | null;
    coverImage?: string | null;
    logo?: string | null;
  };
  contact: {
    name: string | null;
    email: string;
    phone: string | null;
    image: string | null;
  };
  products: Product[];
  stats: {
    totalProducts: number;
    inStockProducts: number;
    categories: number;
    completedOrders: number;
    averageRating: string;
    totalReviews: number;
  };
}

export default function SupplierPublicPage() {
  const params = useParams();
  const supplierId = params.id as string;
  const { addItem } = useCart();

  const [data, setData] = useState<SupplierData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSupplierData();
  }, [supplierId]);

  const fetchSupplierData = async () => {
    try {
      const res = await fetch(`/api/suppliers/public/${supplierId}`);
      if (!res.ok) throw new Error("Supplier not found");
      const supplierData = await res.json();
      setData(supplierData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: data?.supplier.businessName || "Check out this supplier",
        text: `Shop from ${data?.supplier.businessName} on AutoPlux`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      toast.error("This product is out of stock");
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "/placeholder.jpg",
      stock: product.stock,
    });

    toast.success(`${product.name} added to cart!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Loading supplier...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-white">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-neutral-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <BuildingStorefrontIcon className="h-12 w-12 text-neutral-400" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-3">
            Supplier Not Found
          </h1>
          <p className="text-neutral-600 mb-8">
            This supplier doesn't exist or is not verified yet.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 hover:shadow-xl transition-all"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const categories = ["All", ...new Set(data.products.map((p) => p.category))];

  const filteredProducts = data.products.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="bg-gradient-to-br from-neutral-50 via-white to-neutral-50 min-h-screen">
      <Toaster position="top-center" />
      <Header />

      {/* Hero Section - Light & Modern */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
            <Link
              href="/suppliers"
              className="hover:text-blue-600 transition-colors"
            >
              All Suppliers
            </Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">
              {data.supplier.businessName}
            </span>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
            {/* Cover Image */}
            {data.supplier.coverImage ? (
              <div className="relative h-64 bg-gradient-to-r from-blue-50 to-purple-50">
                <Image
                  src={data.supplier.coverImage}
                  alt={data.supplier.businessName}
                  fill
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50"></div>
            )}

            {/* Profile Content */}
            <div className="relative px-8 pb-8 -mt-20">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Logo */}
                <div className="relative">
                  <div className="w-32 h-32 bg-white rounded-3xl shadow-lg border-4 border-white overflow-hidden flex-shrink-0">
                    {data.supplier.logo ? (
                      <Image
                        src={data.supplier.logo}
                        alt={data.supplier.businessName}
                        fill
                        className="object-cover"
                      />
                    ) : data.contact.image ? (
                      <Image
                        src={data.contact.image}
                        alt={data.supplier.businessName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                        <BuildingStorefrontIcon className="h-16 w-16 text-blue-600" />
                      </div>
                    )}
                  </div>
                  {data.supplier.verified && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <CheckBadgeIcon className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Business Info */}
                <div className="flex-1 pt-4">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                        {data.supplier.businessName}
                      </h1>
                      {data.supplier.tagline && (
                        <p className="text-lg text-neutral-600 mb-3">
                          {data.supplier.tagline}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <MapPinIcon className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">
                            {data.supplier.city}, {data.supplier.state}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= parseFloat(data.stats.averageRating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-neutral-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-neutral-900">
                            {data.stats.averageRating}
                          </span>
                          <span className="text-sm text-neutral-500">
                            ({data.stats.totalReviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {(data.supplier.whatsapp || data.contact.phone) && (
                        <a
                          href={`https://wa.me/${(
                            data.supplier.whatsapp || data.contact.phone
                          )?.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-semibold hover:bg-green-700 hover:shadow-lg transition-all"
                        >
                          <span className="text-xl">💬</span>
                          WhatsApp
                        </a>
                      )}
                      {data.contact.phone && (
                        <a
                          href={`tel:${data.contact.phone}`}
                          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 hover:shadow-lg transition-all"
                        >
                          <PhoneIcon className="h-5 w-5" />
                          Call Now
                        </a>
                      )}
                      <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-2xl font-semibold hover:bg-neutral-200 transition-all"
                      >
                        <ShareIcon className="h-5 w-5" />
                        Share
                      </button>
                    </div>
                  </div>

                  {data.supplier.description && (
                    <p className="text-neutral-600 leading-relaxed max-w-3xl">
                      {data.supplier.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CubeIcon className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-neutral-900">
                    {data.stats.totalProducts}
                  </div>
                  <div className="text-sm text-neutral-600">Products</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-neutral-900">
                    {data.stats.inStockProducts}
                  </div>
                  <div className="text-sm text-neutral-600">In Stock</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <TrophyIcon className="h-7 w-7 text-purple-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-neutral-900">
                    {data.stats.completedOrders}
                  </div>
                  <div className="text-sm text-neutral-600">Orders Done</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <ShoppingBagIcon className="h-7 w-7 text-orange-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-neutral-900">
                    {data.stats.categories}
                  </div>
                  <div className="text-sm text-neutral-600">Categories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">
              Our Products
            </h2>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-6 py-4 bg-white border border-neutral-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-6 py-4 bg-white border border-neutral-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all"
                >
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="relative w-full aspect-square bg-neutral-50">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <CubeIcon className="h-20 w-20 text-neutral-300" />
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      {product.stock > 0 && product.stock <= 5 && (
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-orange-500 text-white rounded-xl font-bold text-xs">
                            Only {product.stock} left
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-5">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                      {product.description || "Quality auto part"}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        ₦{product.price.toLocaleString()}
                      </span>
                      {product.stock > 0 && (
                        <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                          In Stock
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all"
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                        Add to Cart
                      </button>
                      <Link
                        href={`/products/${product.id}`}
                        className="flex items-center justify-center w-12 h-12 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-all"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CubeIcon className="h-10 w-10 text-neutral-400" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                No products found
              </h3>
              <p className="text-neutral-600">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Social Media & Contact */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Social Media */}
          {(data.supplier.instagram ||
            data.supplier.facebook ||
            data.supplier.twitter ||
            data.supplier.tiktok ||
            data.supplier.website) && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
                Connect With Us
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {data.supplier.instagram && (
                  <a
                    href={`https://instagram.com/${data.supplier.instagram.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <span className="text-2xl">📷</span>
                    <div>
                      <div className="text-xs opacity-90">Instagram</div>
                      <div className="font-bold">{data.supplier.instagram}</div>
                    </div>
                  </a>
                )}

                {data.supplier.facebook && (
                  <a
                    href={`https://facebook.com/${data.supplier.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <span className="text-2xl">👥</span>
                    <div>
                      <div className="text-xs opacity-90">Facebook</div>
                      <div className="font-bold">{data.supplier.facebook}</div>
                    </div>
                  </a>
                )}

                {data.supplier.twitter && (
                  <a
                    href={`https://twitter.com/${data.supplier.twitter.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-4 bg-neutral-900 text-white rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <span className="text-2xl">𝕏</span>
                    <div>
                      <div className="text-xs opacity-90">Twitter/X</div>
                      <div className="font-bold">{data.supplier.twitter}</div>
                    </div>
                  </a>
                )}

                {data.supplier.tiktok && (
                  <a
                    href={`https://tiktok.com/@${data.supplier.tiktok.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-4 bg-black text-white rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <span className="text-2xl">🎵</span>
                    <div>
                      <div className="text-xs opacity-90">TikTok</div>
                      <div className="font-bold">{data.supplier.tiktok}</div>
                    </div>
                  </a>
                )}

                {data.supplier.website && (
                  <a
                    href={data.supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <span className="text-2xl">🌐</span>
                    <div>
                      <div className="text-xs opacity-90">Website</div>
                      <div className="font-bold">Visit Site</div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {data.contact.phone && (
              <a
                href={`tel:${data.contact.phone}`}
                className="flex items-center gap-4 p-6 bg-white border border-neutral-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-neutral-900 mb-1">Phone</div>
                  <div className="text-sm text-neutral-600">
                    {data.contact.phone}
                  </div>
                </div>
              </a>
            )}

            <a
              href={`mailto:${data.contact.email}`}
              className="flex items-center gap-4 p-6 bg-white border border-neutral-200 rounded-2xl hover:border-purple-300 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <EnvelopeIcon className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <div className="font-bold text-neutral-900 mb-1">Email</div>
                <div className="text-sm text-neutral-600 truncate">
                  {data.contact.email}
                </div>
              </div>
            </a>
          </div>

          {/* Business Hours */}
          {data.supplier.businessHours && (
            <div className="bg-white border border-neutral-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
                Business Hours
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(JSON.parse(data.supplier.businessHours)).map(
                  ([day, hours]) => (
                    <div
                      key={day}
                      className="flex justify-between items-center p-4 bg-neutral-50 rounded-xl"
                    >
                      <span className="font-semibold text-neutral-900 capitalize">
                        {day}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          hours === "Closed"
                            ? "text-red-600"
                            : "text-neutral-600"
                        }`}
                      >
                        {hours as string}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
