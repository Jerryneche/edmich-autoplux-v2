"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

export default function CartIconBadge() {
  const { totalItems, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300 group"
      aria-label="Open shopping cart"
    >
      <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />

      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce-subtle">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}

      <style jsx>{`
        @keyframes bounce-subtle {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 0.5s ease-in-out;
        }
      `}</style>
    </button>
  );
}
