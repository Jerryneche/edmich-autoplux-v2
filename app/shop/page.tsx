import { headers } from "next/headers";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { ProductCardData } from "@/app/types/product";

// Placeholder products when API fails
const PLACEHOLDER_PRODUCTS: ProductCardData[] = [
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

async function getProducts() {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const res = await fetch(`${protocol}://${host}/api/products?limit=50`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("Products API failed, using placeholder data");
      return PLACEHOLDER_PRODUCTS;
    }

    const data = await res.json();
    return data.length > 0 ? data : PLACEHOLDER_PRODUCTS;
  } catch (error) {
    console.warn("Products API error, using placeholder data:", error);
    return PLACEHOLDER_PRODUCTS;
  }
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Header />

      {/* Hero Banner */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
            <SparklesIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              {products.length}+ Genuine Parts
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Find the Perfect{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Auto Parts
            </span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Browse verified suppliers offering genuine parts at competitive
            prices
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search for brake pads, filters, engine parts..."
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Products */}
      <section className="max-w-7xl mx-auto px-6 py-12">
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
                "Filters",
                "Engine",
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
              {products.length} Products
            </span>
            <select className="px-4 py-2 bg-white border-2 border-neutral-200 rounded-xl text-neutral-700 font-medium focus:border-blue-500 focus:outline-none">
              <option>Sort by: Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Top Rated</option>
              <option>Proximity</option>
            </select>
          </div>
        </div>

        {/* Products Grid - Using the new ProductCard */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: ProductCardData) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-white border-2 border-neutral-200 rounded-xl text-neutral-700 font-semibold hover:border-blue-300 hover:shadow-lg transition-all">
            Load More Products
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
