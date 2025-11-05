import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AddToCartButton from "@/app/components/AddToCartButton";
import {
  ArrowLeftIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  Package,
} from "lucide-react";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import Link from "next/link";
import Image from "next/image";

const PLACEHOLDER_PRODUCTS = [
  {
    id: "1",
    name: "Premium Brake Pads Set",
    description: "High-quality brake pads for optimal stopping power",
    price: 15000,
    category: "Brakes",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
    stock: 25,
    supplierId: "supplier-1",
    supplier: "AutoParts Nigeria",
  },
  {
    id: "2",
    name: "Engine Oil Filter",
    description: "Premium oil filter for engine protection",
    price: 8500,
    category: "Filters",
    image:
      "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400&h=300&fit=crop",
    stock: 40,
    supplierId: "supplier-2",
    supplier: "Quality Motors Ltd",
  },
  {
    id: "3",
    name: "Air Filter Assembly",
    description: "High-flow air filter for better engine performance",
    price: 12000,
    category: "Filters",
    image:
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=300&fit=crop",
    stock: 30,
    supplierId: "supplier-3",
    supplier: "Parts Express",
  },
  {
    id: "4",
    name: "Spark Plugs (Set of 4)",
    description: "OEM quality spark plugs for smooth ignition",
    price: 18000,
    category: "Engine",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop",
    stock: 50,
    supplierId: "supplier-1",
    supplier: "AutoParts Nigeria",
  },
  {
    id: "5",
    name: "LED Headlight Assembly",
    description: "Bright LED headlights for better visibility",
    price: 45000,
    category: "Lighting",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop",
    stock: 0,
    supplierId: "supplier-4",
    supplier: "Lightning Auto Parts",
  },
  {
    id: "6",
    name: "Wiper Blades (Pair)",
    description: "All-weather wiper blades for clear visibility",
    price: 6500,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop",
    stock: 60,
    supplierId: "supplier-5",
    supplier: "ClearView Auto",
  },
  {
    id: "7",
    name: "Car Battery 12V 70Ah",
    description: "Long-lasting maintenance-free battery",
    price: 35000,
    category: "Electrical",
    image:
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop",
    stock: 15,
    supplierId: "supplier-6",
    supplier: "Power Auto",
  },
  {
    id: "8",
    name: "Radiator Assembly",
    description: "Efficient cooling radiator for your engine",
    price: 28000,
    category: "Cooling",
    image:
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop",
    stock: 12,
    supplierId: "supplier-7",
    supplier: "Cool Parts Ltd",
  },
  {
    id: "9",
    name: "Shock Absorbers (Pair)",
    description: "Heavy-duty shock absorbers for smooth ride",
    price: 22000,
    category: "Suspension",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop",
    stock: 20,
    supplierId: "supplier-8",
    supplier: "Suspension Pro",
  },
];

async function getProduct(id: string) {
  // FORCE USE PLACEHOLDER — IGNORE API FOR NOW
  const product = PLACEHOLDER_PRODUCTS.find((p) => p.id === id);
  if (!product) {
    console.log("Product not found in placeholder:", id);
    return null;
  }
  console.log("Found product:", product.name);
  return product;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ← AWAIT THE PROMISE
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }
  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Button */}
          <Link
            href="/shop" // ← Change this line
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-600 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Marketplace
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 shadow-xl">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-32 h-32 text-neutral-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category Badge */}
              <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                {product.category}
              </div>

              {/* Product Name */}
              <h1 className="text-4xl font-bold text-neutral-900">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarSolid
                      key={star}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-neutral-600">4.8 (124 reviews)</span>
              </div>

              {/* Price */}
              <div className="py-6 border-y border-neutral-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ₦{product.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-neutral-600 mt-2">
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-medium">
                      ✓ In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      Out of Stock
                    </span>
                  )}
                </p>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">
                  Product Description
                </h2>
                <p className="text-neutral-600 leading-relaxed">
                  {product.description ||
                    "High-quality auto part designed for optimal performance and durability."}
                </p>
              </div>

              {/* Supplier */}
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-sm text-neutral-600">Sold by</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {product.supplier}
                </p>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-4">
                <AddToCartButton
                  product={product}
                  variant="primary"
                  className="w-full text-lg py-4"
                />

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="flex flex-col items-center text-center">
                    <TruckIcon className="h-8 w-8 text-blue-600 mb-2" />
                    <p className="text-xs text-neutral-600">Fast Delivery</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <ShieldCheckIcon className="h-8 w-8 text-green-600 mb-2" />
                    <p className="text-xs text-neutral-600">Verified Quality</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <StarIcon className="h-8 w-8 text-yellow-500 mb-2" />
                    <p className="text-xs text-neutral-600">Top Rated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
