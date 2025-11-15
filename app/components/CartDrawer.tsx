// app/components/CartDrawer.tsx
// app/components/CartDrawer.tsx
// app/components/CartDrawer.tsx
"use client";

import { useCart } from "@/app/context/CartContext";
import { X, ShoppingBag, Package, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, total, clearCart, removeFromCart } = useCart();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-white to-neutral-50 shadow-2xl z-50 transform transition-transform duration-500 ease-out"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Your Cart
                </h3>
                <p className="text-sm text-neutral-600">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-neutral-100 transition-all group"
            >
              <X className="h-5 w-5 text-neutral-600 group-hover:text-neutral-900" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[55vh]">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500 font-medium">Your cart is empty</p>
              <Link
                href="/shop"
                onClick={onClose}
                className="mt-4 inline-block text-blue-600 font-semibold hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl p-4 shadow-sm border border-neutral-200 hover:shadow-md hover:border-blue-300 transition-all duration-300"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-10 w-10 text-neutral-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-neutral-900 line-clamp-2 text-sm">
                      {item.name}
                    </h4>
                    <p className="text-xs text-neutral-600 mt-1">
                      ₦{item.price.toLocaleString()} × {item.quantity}
                    </p>
                    <p className="text-sm font-bold text-blue-600 mt-1">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="self-start p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-neutral-200 bg-white/80 backdrop-blur-xl space-y-5">
            {/* Total */}
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-semibold text-neutral-700">
                Total
              </span>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ₦{total.toLocaleString()}
              </span>
            </div>

            {/* Checkout */}
            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
            >
              Checkout
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Clear */}
            <button
              onClick={() => {
                clearCart();
                onClose();
              }}
              className="w-full py-3 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-all duration-200"
            >
              Clear Cart
            </button>

            {/* Trust */}
            <p className="text-xs text-center text-neutral-500">
              Secure checkout • Fast delivery • 30-day returns
            </p>
          </div>
        )}
      </div>
    </>
  );
}
