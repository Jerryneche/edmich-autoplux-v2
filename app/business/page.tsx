import Header from "../components/Header";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import {
  BuildingStorefrontIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface Supplier {
  id: string;
  name: string;
  location: string;
  approved: string;
  businessName: string;
  company: string;
  product: string;
  price: string;
}

export const dynamic = "force-dynamic";
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const res = await fetch("/api/suppliers", {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`Fetch error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
}

export default async function BusinessPage() {
  const suppliers: Supplier[] = await getSuppliers();

  return (
    <main className="bg-gradient-to-b from-white via-neutral-50 to-white min-h-screen">
      <Header />

      {/* Hero Section */}
      <Hero
        image="/hero-business.jpg"
        title="Business Hub"
        subtitle="Market, mechanics, and logistics in one place."
        primaryCta={{ label: "Enter Market", href: "/business/market" }}
        secondaryCta={{
          label: "Request Mechanics",
          href: "/business/mechanics/booking",
        }}
      />

      {/* Quick Access Cards */}
      <section className="relative -mt-20 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Market Card */}
            <Link href="/business/market" className="group">
              <div className="relative bg-white rounded-2xl p-8 shadow-xl border-2 border-neutral-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <BuildingStorefrontIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    Marketplace
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Browse verified suppliers and source genuine auto parts
                    instantly
                  </p>
                  <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                    <span>Enter Market</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Mechanics Card */}
            <Link href="/business/mechanics/booking" className="group">
              <div className="relative bg-white rounded-2xl p-8 shadow-xl border-2 border-neutral-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <WrenchScrewdriverIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    Mechanics
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Book certified mechanics with flexible scheduling and
                    transparent pricing
                  </p>
                  <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                    <span>Book Service</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Logistics Card */}
            <Link href="/business/logistics" className="group">
              <div className="relative bg-white rounded-2xl p-8 shadow-xl border-2 border-neutral-200 hover:border-green-300 hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <TruckIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    Logistics
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Track deliveries in real-time with our trusted logistics
                    network
                  </p>
                  <div className="flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
                    <span>Request Delivery</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Suppliers Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-4">
                <SparklesIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Live from our database
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-neutral-900">
                Featured{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Suppliers
                </span>
              </h2>
              <p className="text-lg text-neutral-600 mt-3">
                Verified businesses ready to serve you
              </p>
            </div>
            <Link
              href="/business/market"
              className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              View All
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Suppliers Grid */}
          {suppliers &&
          suppliers.filter((s: Supplier) => s.approved).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers
                ?.filter((s: Supplier) => s.approved)
                .slice(0, 6)
                .map((s: Supplier) => (
                  <div key={s.id} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                    <div className="relative bg-white border-2 border-neutral-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl transition-all">
                      {/* Verified Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                          <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-semibold text-green-700">
                            Verified
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500">
                          #{s.id.slice(0, 8)}
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {s.product || s.businessName || "Premium Parts"}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-3">
                        {s.company || s.location || "Lagos, Nigeria"}
                      </p>

                      {/* Price */}
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                        <div>
                          <p className="text-xs text-neutral-500">
                            Starting from
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {s.price || "₦25,000"}
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-neutral-200">
              <BuildingStorefrontIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-neutral-900 mb-2">
                No suppliers yet
              </p>
              <p className="text-neutral-600 mb-6">
                Be the first to join our verified supplier network
              </p>
              <Link
                href="/business/market"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Become a Supplier
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Mobile View All Button */}
          <div className="md:hidden mt-8 text-center">
            <Link
              href="/business/market"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold"
            >
              View All Suppliers
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 bg-gradient-to-b from-blue-50 to-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Active Suppliers" },
              { number: "10K+", label: "Parts Listed" },
              { number: "1K+", label: "Happy Customers" },
              { number: "99.9%", label: "Uptime" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <p className="text-neutral-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
