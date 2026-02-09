// app/business/market/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Package, Star, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Match exactly what Prisma returns
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  supplier: {
    businessName: string;
    supplierId: string;
    businessAddress: string;
    city: string;
    state: string;
    userId: string;
    phone: string | null;
  };
}

async function getProduct(id: string): Promise<Product | null> {
  if (!id) return null;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            businessName: true,
            businessAddress: true,
            city: true,
            state: true,
            userId: true,
            user: {
              select: {
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!product || !product.supplier) return null;

    return {
      id: product.id,
      name: product.name,
      description: product.description ?? "High-quality auto part",
      price: product.price,
      category: product.category,
      image: product.image || "/placeholder.png",
      stock: product.stock,
      supplier: {
        businessName: product.supplier.businessName,
        supplierId: product.supplier.id, // ← FROM Prisma
        businessAddress: product.supplier.businessAddress || "",
        city: product.supplier.city,
        state: product.supplier.state,
        userId: product.supplier.userId,
        phone: product.supplier.user?.phone || null,
      },
    };
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export default async function MarketProductDetail({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            href="/business/market"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-600 mb-8"
          >
            Back to Marketplace
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-xl">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-32 h-32 text-neutral-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <span>18 Parts Found</span>
              </div>

              <h1 className="text-5xl font-bold text-neutral-900">
                {product.name}
              </h1>

              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="ml-2 text-neutral-600">4.5 (89 reviews)</span>
              </div>

              <div className="py-6 border-y border-neutral-200">
                <span className="text-5xl font-bold text-neutral-900">
                  ₦{product.price.toLocaleString()}
                </span>
                <p className="mt-2 text-neutral-600">
                  <span className="text-green-600 font-medium">
                    In Stock: {product.stock}
                  </span>
                </p>
              </div>

              <p className="text-neutral-600 leading-relaxed">
                {product.description}
              </p>

              <div className="bg-white rounded-xl p-6 border-2 border-neutral-200">
                <p className="text-sm text-neutral-600 mb-2">Supplier</p>
                <p className="font-bold text-neutral-900">
                  {product.supplier.businessName}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-neutral-600">
                  <MapPin className="h-4 w-4" />
                  {product.supplier.businessAddress}, {product.supplier.city},{" "}
                  {product.supplier.state}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href={`/chat?userId=${product.supplier.userId}`}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all text-center"
                >
                  Chat Supplier
                </Link>
                {product.supplier.phone && (
                  <Link
                    href={`tel:${product.supplier.phone}`}
                    className="w-full py-4 bg-white text-blue-700 border-2 border-blue-200 rounded-xl font-bold hover:shadow-xl transition-all text-center"
                  >
                    Call Supplier
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
