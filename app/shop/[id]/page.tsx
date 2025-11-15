// app/shop/[id]/page.tsx — ELITE EDITION
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AddToCartButton from "@/app/components/AddToCartButton";
import {
  Star,
  Package,
  MapPin,
  Building2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ShopProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product;
  try {
    product = await prisma.product.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            businessName: true,
            businessAddress: true,
            city: true,
            state: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
        <Header />
        <div className="pt-32 pb-16 max-w-7xl mx-auto px-6 text-center">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-10 shadow-lg">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-800 mb-2">
              Service Unavailable
            </h1>
            <p className="text-red-600 mb-6">
              We're having trouble connecting. Please try again later.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
            >
              Back to Shop
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) notFound();

  const inStock = product.stock > 0;
  const lowStock = product.stock <= 10 && product.stock > 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Header />

      {/* Hero Section */}
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-600 mb-10 font-medium transition-colors group"
        >
          <div className="w-5 h-5 border border-neutral-300 rounded-full flex items-center justify-center group-hover:border-blue-600 transition-colors">
            <div className="w-2 h-2 bg-neutral-400 rounded-full group-hover:bg-blue-600 transition-colors"></div>
          </div>
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl overflow-hidden shadow-2xl border border-neutral-200">
              <Image
                src={product.image || "/placeholder.png"}
                alt={product.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute top-4 left-4">
                {inStock ? (
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-green-700 shadow-md">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    {product.stock} in stock
                  </div>
                ) : (
                  <div className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
                    Out of stock
                  </div>
                )}
              </div>
            </div>

            {/* Mini thumbnails (future) */}
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-neutral-100 rounded-xl border-2 border-neutral-200 hover:border-blue-500 transition-colors cursor-pointer"
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title & Rating */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < 4
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-neutral-200 text-neutral-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-neutral-600">
                  4.5 (124 reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="py-6 border-y border-neutral-200">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ₦{product.price.toLocaleString()}
                </span>
                {lowStock && (
                  <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    Low stock — order soon!
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-bold text-neutral-900 mb-2">Description</h3>
              <p className="text-neutral-600 leading-relaxed">
                {product.description ||
                  "Premium quality auto part designed for Nigerian roads. Built to last with superior materials and engineering."}
              </p>
            </div>

            {/* Supplier Badge */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-600">
                    Sold by
                  </p>
                  <p className="font-bold text-neutral-900">
                    {product.supplier?.businessName || "AutoParts Ltd"}
                  </p>
                  <p className="text-sm text-neutral-600 flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {product.supplier?.city}, {product.supplier?.state}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>

            {/* Add to Cart */}
            <div className="pt-4">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image || "/placeholder.png",
                  stock: product.stock,
                }}
              />
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-8 pt-8 border-t border-neutral-200">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Genuine Product
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Fast Delivery
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Secure Payment
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
