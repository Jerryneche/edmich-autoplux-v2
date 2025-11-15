// app/components/ProductCard.tsx
import Image from "next/image";
import Link from "next/link";
import { Star, Package } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  stock: number;
  supplier: { businessName: string } | null;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300">
      {/* Image + Link */}
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-square bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-20 h-20 text-neutral-300" />
            </div>
          )}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-green-600 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            {product.stock} in stock
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 space-y-3">
        <Link href={`/shop/${product.id}`}>
          <h3 className="font-bold text-lg text-neutral-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-neutral-600 line-clamp-2">
          {product.description || "Premium auto part"}
        </p>

        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">4.5</span>
          <span className="text-xs text-neutral-500">(124)</span>
        </div>

        <p className="text-xs text-neutral-500">
          By:{" "}
          <span className="font-medium text-neutral-700">
            {product.supplier?.businessName || "AutoParts Ltd"}
          </span>
        </p>

        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ₦{product.price.toLocaleString()}
          </p>
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
      </div>
    </div>
  );
}
