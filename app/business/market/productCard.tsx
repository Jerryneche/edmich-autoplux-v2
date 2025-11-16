// app/components/ProductCard.tsx
import Image from "next/image";
import Link from "next/link";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

interface ProductCardProps {
  product: {
    id: string;
    slug?: string;
    name: string;
    description: string | null;
    price: number;
    category: string;
    image: string | null;
    stock: number;
    supplier?: {
      businessName: string | null;
    } | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const supplierName = product.supplier?.businessName || "Edmich Supplier";

  return (
    <Link href={`/shop/${product.slug || product.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border-2 border-neutral-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square bg-neutral-50">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBagIcon className="h-20 w-20 text-neutral-300" />
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 left-3 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
            {product.category}
          </div>

          {/* Stock Badge */}
          {product.stock > 0 ? (
            <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
              In Stock
            </div>
          ) : (
            <div className="absolute top-3 right-3 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
              Out of Stock
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-bold text-neutral-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Supplier</p>
              <p className="text-sm font-medium text-neutral-700">
                {supplierName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500 mb-1">Price</p>
              <p className="text-2xl font-bold text-blue-600">
                ₦{product.price.toLocaleString()}
              </p>
            </div>
          </div>

          <button className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}
