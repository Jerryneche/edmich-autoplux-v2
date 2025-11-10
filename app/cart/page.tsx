"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getCart,
  removeFromCart,
  updateQuantity,
  getCartTotal,
} from "@/lib/cart";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
  const [cart, setCart] = useState(() => getCart()); // ← Initial load

  // Sync cart on storage change (multi-tab support)
  const syncCart = useCallback(() => {
    setCart(getCart());
  }, []);

  useEffect(() => {
    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, [syncCart]);

  // Re-sync on mount & focus (handles back/forward, tab switch)
  useEffect(() => {
    const handleFocus = () => setCart(getCart());
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 py-24 text-center">
        <h1 className="text-4xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/business/market" className="text-cyan-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Your Cart</h1>

        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-xl shadow-lg flex gap-4 items-center"
            >
              {/* Image */}
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-20 h-20" />
              )}

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-cyan-600 font-bold">
                  ₦{item.price.toLocaleString()}
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600 hover:text-red-700 p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center">
            <p className="text-xl font-semibold">Total</p>
            <p className="text-3xl font-bold text-cyan-600">
              ₦{getCartTotal().toLocaleString()}
            </p>
          </div>
          <button className="mt-4 w-full py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-cyan-700 transition-all">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
