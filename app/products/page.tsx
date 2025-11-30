"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: string;
  image: string | null;
  createdAt: string;
}

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "ACTIVE" | "INACTIVE">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      if (session.user.role !== "SUPPLIER") {
        router.push("/dashboard");
        return;
      }
      fetchProducts();
    }
  }, [status, session, router, filter]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);

      const response = await fetch(
        `/api/products/my-products?${params.toString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Product deleted!");
        fetchProducts();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleStatus = async (
    productId: string,
    currentStatus: string
  ) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Product ${newStatus.toLowerCase()}!`);
        fetchProducts();
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "ACTIVE").length,
    inactive: products.filter((p) => p.status === "INACTIVE").length,
    lowStock: products.filter((p) => p.stock < 10).length,
  };

  if (isLoading || status === "loading") {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <section className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              My Products
            </h1>
            <p className="text-neutral-600">Manage your product inventory</p>
          </div>
          <Link
            href="/products/add"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border-2 border-neutral-200">
            <p className="text-sm text-neutral-600 mb-1">Total Products</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
            <p className="text-sm text-neutral-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-yellow-200">
            <p className="text-sm text-neutral-600 mb-1">Low Stock</p>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.lowStock}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-red-200">
            <p className="text-sm text-neutral-600 mb-1">Inactive</p>
            <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-4 mb-8">
          <div className="flex gap-3">
            {["all", "ACTIVE", "INACTIVE"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {status === "all" ? "All Products" : status}
              </button>
            ))}
          </div>
        </div>

        {/* Products List */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-12 text-center">
            <p className="text-2xl font-bold text-neutral-900 mb-2">
              No products found
            </p>
            <p className="text-neutral-600 mb-6">
              Start adding products to your inventory
            </p>
            <Link
              href="/products/add"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700">
                      Product
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700">
                      Category
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700">
                      Price
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700">
                      Stock
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-neutral-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-neutral-200 hover:bg-neutral-50"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                📦
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900">
                              {product.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {new Date(product.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-neutral-700">
                        {product.category}
                      </td>
                      <td className="py-4 px-6 font-bold text-neutral-900">
                        ₦{product.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            product.stock < 10
                              ? "bg-red-100 text-red-700"
                              : product.stock < 50
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() =>
                            handleToggleStatus(product.id, product.status)
                          }
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            product.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.status}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/shop/${product.id}`}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="View"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/products/edit/${product.id}`}
                            className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
