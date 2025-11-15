// app/components/ShoppingCartDrawer.tsx
"use client";

import { useCart } from "@/app/context/CartContext";
import { X, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function ShoppingCartDrawer() {
  const { items, itemCount, total, clearCart } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="fixed right-4 top-20 bg-white rounded-2xl shadow-2xl p-6 w-80 z-50 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Cart ({itemCount})
        </h3>
        <button
          onClick={clearCart}
          className="text-neutral-500 hover:text-red-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 py-2 border-b">
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm line-clamp-1">{item.name}</p>
              <p className="text-xs text-neutral-600">
                ₦{item.price.toLocaleString()} × {item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t font-bold text-lg">
        Total: ₦{total.toLocaleString()}
      </div>

      <Link
        href="/checkout"
        className="mt-4 w-full block text-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold"
      >
        Checkout
      </Link>
    </div>
  );
}
