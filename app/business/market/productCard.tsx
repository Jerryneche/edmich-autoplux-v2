// app/business/market/ProductCard.tsx
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

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

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border-2 border-neutral-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square bg-neutral-50 p-8">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
            {product.category}
          </div>
          <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <span>₦{product.stock}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-neutral-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-neutral-600 line-clamp-2 mt-1">
            {product.description}
          </p>

          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-xs text-neutral-600">By: {product.supplier}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.rating}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-neutral-900">
                ₦{product.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
