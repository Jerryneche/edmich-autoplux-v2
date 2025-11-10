// app/components/CartIconBadge.tsx
"use client";

import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import Link from "next/link";

export default function CartIconBadge() {
  const { totalItems, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative p-2.5 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300"
    >
      <ShoppingBagIcon className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
          {totalItems}
        </span>
      )}
    </button>
  );
}
