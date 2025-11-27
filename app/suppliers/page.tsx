"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import Image from "next/image";
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

interface Supplier {
  id: string;
  businessName: string;
  description: string | null;
  city: string;
  state: string;
  verified: boolean;
  productCount: number;
  ownerName: string | null;
  ownerImage: string | null;
}

export default function SuppliersDirectory() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("All");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/suppliers/public");
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      const data = await res.json();
      setSuppliers(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load suppliers");
    } finally {
      setIsLoading(false);
    }
  };

  const states = ["All", ...new Set(suppliers.map((s) => s.state))];

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === "All" || s.state === selectedState;
    return matchesSearch && matchesState;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-br from-neutral-50 via-white to-neutral-50 min-h-screen">
      <Toaster position="top-center" />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-neutral-200 mb-6">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-neutral-900">
              Verified Suppliers
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Trusted Auto Parts Suppliers
          </h1>
          <p className="text-xl text-neutral-600 mb-12 max-w-3xl mx-auto">
            Connect directly with verified suppliers across Nigeria for quality
            auto parts
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-2">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search suppliers by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none text-neutral-900"
                  />
                </div>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                >
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state === "All" ? "All States" : state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-12">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {suppliers.length}
              </div>
              <div className="text-sm text-neutral-600">Verified Suppliers</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {suppliers.reduce((sum, s) => sum + s.productCount, 0)}+
              </div>
              <div className="text-sm text-neutral-600">Products Available</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {states.length - 1}
              </div>
              <div className="text-sm text-neutral-600">States Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Suppliers Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {filteredSuppliers.length > 0 ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900">
                  {filteredSuppliers.length} Supplier
                  {filteredSuppliers.length !== 1 ? "s" : ""} Found
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.map((supplier) => (
                  <Link
                    key={supplier.id}
                    href={`/suppliers/${supplier.id}`}
                    className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all"
                  >
                    {/* Banner */}
                    <div className="h-32 bg-gradient-to-br from-blue-100 via-purple-100 to-blue-100 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="relative px-6 pb-6">
                      {/* Avatar */}
                      <div className="relative -mt-16 mb-4">
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border-4 border-white overflow-hidden">
                          {supplier.ownerImage ? (
                            <Image
                              src={supplier.ownerImage}
                              alt={supplier.businessName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                              <BuildingStorefrontIcon className="h-12 w-12 text-blue-600" />
                            </div>
                          )}
                        </div>
                        {supplier.verified && (
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <CheckBadgeIcon className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Business Info */}
                      <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {supplier.businessName}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
                        <MapPinIcon className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">
                          {supplier.city}, {supplier.state}
                        </span>
                      </div>

                      <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                        {supplier.description ||
                          "Quality auto parts supplier serving Nigeria"}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CubeIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="text-sm font-semibold text-neutral-900">
                            {supplier.productCount} Products
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all">
                          View Store
                          <ArrowRightIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BuildingStorefrontIcon className="h-10 w-10 text-neutral-400" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                No suppliers found
              </h3>
              <p className="text-neutral-600 mb-6">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedState("All");
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-lg border border-neutral-200">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Want to Become a Supplier?
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              Join our growing network of verified suppliers and reach thousands
              of customers
            </p>
            <Link
              href="/onboarding/supplier"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              Apply to Become a Supplier
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
