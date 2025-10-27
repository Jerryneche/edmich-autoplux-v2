import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { headers } from "next/headers";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingCartIcon,
  CheckBadgeIcon,
  SparklesIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import Link from "next/link";
import { Supplier } from "@prisma/client";

interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
  reviews: string;
  company: string;
  suplier: string;
  product: string;
  rating: string;
  verified: string;
  inStock: string;
  category: string;

  // Add other fields as needed
}

// Placeholder products when API fails or no data
const PLACEHOLDER_PRODUCTS = [
  {
    id: "1",
    name: "Premium Brake Pads Set",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
    price: "₦15,000",
    supplier: "AutoParts Nigeria",
    category: "Brakes",
    rating: 4.8,
    reviews: 124,
    verified: true,
    inStock: true,
  },
  {
    id: "2",
    name: "Engine Oil Filter",
    image:
      "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400&h=300&fit=crop",
    price: "₦8,500",
    supplier: "Quality Motors Ltd",
    category: "Filters",
    rating: 4.9,
    reviews: 89,
    verified: true,
    inStock: true,
  },
  {
    id: "3",
    name: "Air Filter Assembly",
    image:
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=300&fit=crop",
    price: "₦12,000",
    supplier: "Parts Express",
    category: "Filters",
    rating: 4.7,
    reviews: 56,
    verified: true,
    inStock: true,
  },
  {
    id: "4",
    name: "Spark Plugs (Set of 4)",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop",
    price: "₦18,000",
    supplier: "AutoParts Nigeria",
    category: "Engine",
    rating: 4.9,
    reviews: 203,
    verified: true,
    inStock: true,
  },
  {
    id: "5",
    name: "LED Headlight Assembly",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop",
    price: "₦45,000",
    supplier: "Lightning Auto Parts",
    category: "Lighting",
    rating: 4.6,
    reviews: 67,
    verified: true,
    inStock: false,
  },
  {
    id: "6",
    name: "Wiper Blades (Pair)",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop",
    price: "₦6,500",
    supplier: "ClearView Auto",
    category: "Accessories",
    rating: 4.5,
    reviews: 142,
    verified: true,
    inStock: true,
  },
  {
    id: "7",
    name: "Battery 12V 70Ah",
    image:
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop",
    price: "₦35,000",
    supplier: "Power Auto",
    category: "Electrical",
    rating: 4.8,
    reviews: 98,
    verified: true,
    inStock: true,
  },
  {
    id: "8",
    name: "Radiator Assembly",
    image:
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop",
    price: "₦28,000",
    supplier: "Cool Parts Ltd",
    category: "Cooling",
    rating: 4.7,
    reviews: 45,
    verified: true,
    inStock: true,
  },
  {
    id: "9",
    name: "Shock Absorbers (Pair)",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop",
    price: "₦22,000",
    supplier: "Suspension Pro",
    category: "Suspension",
    rating: 4.9,
    reviews: 156,
    verified: true,
    inStock: true,
  },
];

async function getSuppliers() {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const res = await fetch(`${protocol}://${host}/api/suppliers`, {
      cache: "no-store",
    });

    if (!res.ok) return PLACEHOLDER_PRODUCTS;
    const data = await res.json();
    return data.length > 0 ? data : PLACEHOLDER_PRODUCTS;
  } catch {
    console.warn("API failed, using placeholder data");
    return PLACEHOLDER_PRODUCTS;
  }
}

export default async function MarketPage() {
  const suppliers = await getSuppliers();
  const approved = suppliers.filter((s: Supplier) => s.approved !== false);

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
                10,000+ Genuine Parts
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
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                Search
              </button>
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
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    cat === "All"
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
              {approved.length} Products
            </span>
            <select className="px-4 py-2 bg-white border-2 border-neutral-200 rounded-xl text-neutral-700 font-medium focus:border-blue-500 focus:outline-none">
              <option>Sort by: Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Top Rated</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {approved.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {approved.map((product: Product) => (
              <div key={product.id} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>

                <div className="relative bg-white border-2 border-neutral-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all">
                  {/* Image Placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                    {product.image ? (
                      <Image
                        src={supplier.image}
                        alt={supplier.name}
                        width={300}
                        height={200}
                        className="object-cover"
                      />
                    ) : (
                      <ShoppingCartIcon className="h-16 w-16 text-neutral-300" />
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.verified && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-500 rounded-lg">
                          <CheckBadgeIcon className="h-3 w-3 text-white" />
                          <span className="text-xs font-semibold text-white">
                            Verified
                          </span>
                        </div>
                      )}
                      {!product.inStock && product.inStock !== undefined && (
                        <div className="px-2 py-1 bg-red-500 rounded-lg">
                          <span className="text-xs font-semibold text-white">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <HeartIcon className="h-4 w-4 text-neutral-300 hover:text-red-500 transition-colors" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Category */}
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      {product.category || "Auto Parts"}
                    </span>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-neutral-900 mt-2 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name || product.product || "Premium Auto Part"}
                    </h3>

                    {/* Supplier */}
                    <p className="text-sm text-neutral-600 mb-3">
                      {product.suplier ||
                        product.company ||
                        "Verified Supplier"}
                    </p>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-1 mb-4">
                        <StarSolid className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-neutral-900">
                          {product.rating}
                        </span>
                        <span className="text-sm text-neutral-500">
                          ({product.reviews || 0} reviews)
                        </span>
                      </div>
                    )}

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <div>
                        <p className="text-xs text-neutral-500">Price</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {product.price || "₦10,000"}
                        </p>
                      </div>
                      <Link
                        href={`/business/market/${product.id}`}
                        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
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

        {/* Load More */}
        {approved.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-white border-2 border-neutral-200 rounded-xl text-neutral-700 font-semibold hover:border-blue-300 hover:shadow-lg transition-all">
              Load More Products
            </button>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
