"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  category: string;
}

interface Supplier {
  id: string;
  businessName: string;
  city: string;
  state: string;
  verified: boolean;
  approved: boolean;
  phone?: string;
  description?: string;
  user: {
    name: string;
    email: string;
    image: string | null;
    createdAt: string;
  };
  products: Product[];
  _count: {
    products: number;
  };
}

export default function SupplierDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const supplierId = params.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && supplierId) {
      fetchSupplier();
    }
  }, [status, supplierId]);

  const fetchSupplier = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/suppliers/${supplierId}`);
      if (response.ok) {
        const data = await response.json();
        setSupplier(data);
      } else {
        toast.error("Failed to load supplier");
        router.push("/dashboard/admin");
      }
    } catch (error) {
      console.error("Error fetching supplier:", error);
      toast.error("Failed to load supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleApproval = async () => {
    if (!supplier) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/suppliers/${supplierId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !supplier.approved }),
      });

      if (!response.ok) {
        throw new Error("Failed to update approval");
      }

      const updatedSupplier = await response.json();
      setSupplier(updatedSupplier);
      toast.success(
        `Supplier ${updatedSupplier.approved ? "approved" : "unapproved"}`
      );
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update supplier");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleVerification = async () => {
    if (!supplier) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/suppliers/${supplierId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !supplier.verified }),
      });

      if (!response.ok) {
        throw new Error("Failed to update verification");
      }

      const updatedSupplier = await response.json();
      setSupplier(updatedSupplier);
      toast.success(
        `Supplier ${updatedSupplier.verified ? "verified" : "unverified"}`
      );
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update supplier");
    } finally {
      setIsUpdating(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </>
    );
  }

  if (!supplier) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">Supplier not found</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Toaster position="top-right" />
      <main className="min-h-screen bg-gradient-to-b from-white to-neutral-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Suppliers
          </button>

          {/* Header */}
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-3xl font-bold">
                  {supplier.businessName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    {supplier.businessName}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {supplier.verified && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-1">
                        <CheckCircleIcon className="h-4 w-4" />
                        Verified
                      </span>
                    )}
                    {supplier.approved && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                        <CheckCircleIcon className="h-4 w-4" />
                        Approved
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleToggleApproval}
                  disabled={isUpdating}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 ${
                    supplier.approved
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {supplier.approved ? "Revoke Approval" : "Approve Supplier"}
                </button>

                <button
                  onClick={handleToggleVerification}
                  disabled={isUpdating}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 ${
                    supplier.verified
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {supplier.verified ? "Unverify" : "Verify Supplier"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Products List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                  Products ({supplier._count.products})
                </h2>

                {supplier.products.length > 0 ? (
                  <div className="space-y-3">
                    {supplier.products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/dashboard/admin/products/${product.id}/edit`}
                        className="flex items-center justify-between p-4 border-2 border-neutral-100 rounded-xl hover:border-blue-300 transition-colors"
                      >
                        <div>
                          <h3 className="font-semibold text-neutral-900">
                            {product.name}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {product.category} • Stock: {product.stock}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-neutral-900">
                            ₦{product.price.toLocaleString()}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              product.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {product.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-center py-8">
                    No products yet
                  </p>
                )}
              </div>

              {supplier.description && (
                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                  <h3 className="font-bold text-neutral-900 mb-3">About</h3>
                  <p className="text-neutral-700">{supplier.description}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="h-5 w-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-500">Email</p>
                      <p className="text-neutral-900">{supplier.user.email}</p>
                    </div>
                  </div>

                  {supplier.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5 text-neutral-400" />
                      <div>
                        <p className="text-sm text-neutral-500">Phone</p>
                        <p className="text-neutral-900">{supplier.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-500">Location</p>
                      <p className="text-neutral-900">
                        {supplier.city}, {supplier.state}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  Account Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-neutral-500">Owner Name</p>
                    <p className="font-semibold text-neutral-900">
                      {supplier.user.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Joined</p>
                    <p className="text-neutral-900">
                      {format(new Date(supplier.user.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Total Products</p>
                    <p className="text-neutral-900 font-bold">
                      {supplier._count.products}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
