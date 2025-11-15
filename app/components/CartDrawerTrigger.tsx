// app/components/CartDrawerTrigger.tsx
"use client";

import { useCart } from "@/app/context/CartContext";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function CartDrawerTrigger() {
  const { itemCount } = useCart();

  return (
    <button className="relative inline-flex items-center justify-center p-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all group">
      <ShoppingBagIcon className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-md translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform">
          {itemCount}
        </span>
      )}
    </button>
  );
}
