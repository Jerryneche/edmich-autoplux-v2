// app/business/page.tsx
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ShoppingBagIcon,
  UserGroupIcon,
  TruckIcon,
  CheckBadgeIcon,
  MapPinIcon,
  StarIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Supplier {
  id: string;
  businessName: string;
  city: string;
  state: string;
  description: string | null;
  verified: boolean;
  approved: boolean;
  productCount: number;
}

async function getSuppliers(): Promise<Supplier[]> {
  try {
    const suppliers = await prisma.supplierProfile.findMany({
      where: {
        approved: true,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return suppliers.map((s) => ({
      id: s.id,
      businessName: s.businessName,
      city: s.city,
      state: s.state,
      description: s.description,
      verified: s.verified,
      approved: s.approved,
      productCount: s._count.products,
    }));
  } catch (error) {
    console.error("❌ Failed to fetch suppliers from database:", error);
    return [];
  }
}

async function getStats() {
  try {
    const [totalProducts, approvedSuppliers, mechanics, logistics] =
      await Promise.all([
        prisma.product.count(),
        prisma.supplierProfile.count({ where: { approved: true } }),
        prisma.mechanicProfile.count({ where: { approved: true } }),
        prisma.logisticsProfile.count({ where: { approved: true } }),
      ]);

    return {
      totalProducts,
      approvedSuppliers,
      mechanics,
      logistics,
    };
  } catch (error) {
    console.error("❌ Failed to fetch stats:", error);
    return {
      totalProducts: 500,
      approvedSuppliers: 0,
      mechanics: 0,
      logistics: 0,
    };
  }
}

export default async function BusinessPage() {
  const [suppliers, stats] = await Promise.all([getSuppliers(), getStats()]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckBadgeIcon className="h-4 w-4" />
            <span>Trusted Business Network</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-4">
            Connect with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Verified Suppliers
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto mb-10">
            Discover trusted auto parts suppliers, mechanics, and logistics
            providers across Nigeria. Quality products, reliable service.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto mb-12">
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 shadow-lg">
              <ShoppingBagIcon className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-neutral-900 mb-1">
                {stats.totalProducts}+
              </p>
              <p className="text-neutral-600 text-sm">Products</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 shadow-lg">
              <UserGroupIcon className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-neutral-900 mb-1">
                {stats.approvedSuppliers}+
              </p>
              <p className="text-neutral-600 text-sm">Suppliers</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 shadow-lg">
              <WrenchScrewdriverIcon className="h-10 w-10 text-purple-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-neutral-900 mb-1">
                {stats.mechanics}+
              </p>
              <p className="text-neutral-600 text-sm">Mechanics</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200 shadow-lg">
              <TruckIcon className="h-10 w-10 text-orange-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-neutral-900 mb-1">
                {stats.logistics}+
              </p>
              <p className="text-neutral-600 text-sm">Logistics</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/business/market"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              <ShoppingBagIcon className="h-6 w-6" />
              Browse Marketplace
            </Link>

            <Link
              href="/business/services"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              <CalendarDaysIcon className="h-6 w-6" />
              Book Services
            </Link>
          </div>
        </div>
      </section>

      {/* Suppliers Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-900 mb-3">
              Featured Suppliers
            </h2>
            <p className="text-lg text-neutral-600">
              Trusted partners providing quality auto parts
            </p>
          </div>

          {suppliers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="h-12 w-12 text-neutral-400" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                No Suppliers Yet
              </h3>
              <p className="text-lg text-neutral-600 mb-8">
                We're onboarding quality suppliers. Check back soon!
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
              >
                Become a Supplier
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:border-blue-300 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-neutral-900 mb-2 line-clamp-1">
                        {supplier.businessName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                        <MapPinIcon className="h-4 w-4" />
                        <span>
                          {supplier.city}, {supplier.state}
                        </span>
                      </div>
                    </div>
                    {supplier.verified && (
                      <CheckBadgeIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-neutral-600 mb-4 line-clamp-2">
                    {supplier.description || "Quality auto parts supplier"}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t-2 border-neutral-100">
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-neutral-900">
                        4.5
                      </span>
                      <span className="text-sm text-neutral-500">(12)</span>
                    </div>
                    <div className="text-sm text-neutral-600">
                      <span className="font-bold text-neutral-900">
                        {supplier.productCount}
                      </span>{" "}
                      products
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
