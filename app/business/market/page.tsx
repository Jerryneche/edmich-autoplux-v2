// app/business/market/page.tsx
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ClientMarket from "./ClientMarket";
import { prisma } from "@/lib/prisma";
import {
  Search,
  Filter,
  TrendingUp,
  Award,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Revalidate every 60 seconds

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        supplier: {
          select: {
            businessName: true,
            verified: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit for performance
    });

    return products.map((p) => ({
      id: p.id,
      slug: p.slug || p.id,
      name: p.name,
      description: p.description ?? "High-quality auto part",
      price: p.price,
      category: p.category,
      brand: p.brand || null,
      image: p.image || "/placeholder.png",
      images: p.images || [],
      stock: p.stock,
      supplier: p.supplier?.businessName || "AutoParts Ltd",
      supplierVerified: p.supplier?.verified || false,
      supplierLocation: p.supplier
        ? `${p.supplier.city}, ${p.supplier.state}`
        : "Nigeria",
      rating: 4.5, // TODO: Calculate from reviews when review system is ready
      reviews: 0, // TODO: Count from reviews table
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const categories = await prisma.product.groupBy({
      by: ["category"],
      where: {
        status: "ACTIVE",
      },
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: "desc",
        },
      },
    });

    return categories.map((cat) => ({
      name: cat.category,
      count: cat._count.category,
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export default async function MarketPage() {
  const [initialProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const productCount = initialProducts.length;
  const verifiedSuppliers = new Set(
    initialProducts.filter((p) => p.supplierVerified).map((p) => p.supplier)
  ).size;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Stats Banner */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">
                  {verifiedSuppliers}+
                </p>
                <p className="text-sm text-neutral-600">Verified Suppliers</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">
                  {productCount}
                </p>
                <p className="text-sm text-neutral-600">Quality Parts</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-green-200 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">4.8★</p>
                <p className="text-sm text-neutral-600">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Main Heading */}
          {/* Main Heading */}
          {/* Main Heading */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
              <Zap className="h-4 w-4" />
              <span>Fast Delivery • Genuine Parts • Best Prices</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
              Find Your Perfect{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Auto Parts
              </span>
            </h1>

            <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Browse thousands of verified spare parts from trusted suppliers
              across Nigeria. Quality guaranteed, delivered to your doorstep.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">
                  {productCount}+ Parts Available
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span className="font-medium">100% Verified Suppliers</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Quality Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Same-Day Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid with Client-Side Filtering */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {productCount > 0 ? (
            <ClientMarket initialProducts={initialProducts} />
          ) : (
            <div className="text-center py-24">
              <div className="w-32 h-32 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-16 w-16 text-neutral-400" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                No Products Found
              </h2>
              <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
                We're working hard to bring you the best auto parts. Check back
                soon!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
              >
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                Verified Suppliers
              </h3>
              <p className="text-neutral-600 text-sm">
                All suppliers are thoroughly vetted and verified
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                Quality Guaranteed
              </h3>
              <p className="text-neutral-600 text-sm">
                100% genuine parts with warranty protection
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                Fast Delivery
              </h3>
              <p className="text-neutral-600 text-sm">
                Quick shipping to anywhere in Nigeria
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                Best Prices
              </h3>
              <p className="text-neutral-600 text-sm">
                Competitive pricing from multiple suppliers
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
