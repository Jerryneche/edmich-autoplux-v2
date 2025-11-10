// app/components/CartModal.tsx
"use client";

import { useCart } from "@/app/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useEffect } from "react";

export default function CartModal() {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    closeCart,
    isOpen,
  } = useCart();

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Your Cart {totalItems > 0 && `(${totalItems})`}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <Link
                href="/business/market"
                onClick={closeCart}
                className="mt-4 inline-block text-blue-600 hover:underline font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-2xl p-4 flex gap-4 animate-in fade-in slide-in-from-bottom duration-300"
              >
                {/* Image */}
                {item.image ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white shadow-sm">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-200 border-2 border-dashed rounded-xl" />
                )}

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col justify-between items-end gap-2">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 bg-white rounded-full shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-medium text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Total</span>
              <span className="text-3xl font-bold text-blue-600">
                ₦{totalPrice.toLocaleString()}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full block text-center py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={closeCart}
              className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Tailwind Animations */}
      <style jsx>{`
        @keyframes slide-in-from-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .slide-in-from-right {
          animation: slide-in-from-right 0.3s ease-out;
        }
        .fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .slide-in-from-bottom {
          animation: slide-in-from-bottom 0.3s ease-out;
        }
        @keyframes slide-in-from-bottom {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
