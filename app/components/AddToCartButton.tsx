"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addToCart, getCartCount } from "@/lib/cart";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    image?: string | null;
    stock: number;
    supplierId: string;
  };
  variant?: "icon" | "default";
  onAdd?: () => void;
}

export default function AddToCartButton({
  product,
  variant = "default",
  onAdd,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());
    const handleStorage = () => setCartCount(getCartCount());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleAdd = () => {
    if (product.stock === 0) {
      toast.error("Out of stock");
      return;
    }

    setIsAdding(true);
    addToCart(product);
    toast.success(`Added "${product.name}" to cart!`);
    setCartCount(getCartCount());
    onAdd?.();

    setTimeout(() => setIsAdding(false), 300);
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleAdd}
        disabled={isAdding || product.stock === 0}
        className={`relative p-3 rounded-full transition-all ${
          product.stock > 0
            ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg hover:shadow-xl"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        <ShoppingCartIcon
          className={`w-5 h-5 ${isAdding ? "animate-spin" : ""}`}
        />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {cartCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isAdding || product.stock === 0}
      className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
        product.stock > 0
          ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 shadow-lg"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
    >
      {isAdding ? (
        <>Adding...</>
      ) : (
        <>
          <ShoppingCartIcon className="w-5 h-5" />
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </>
      )}
    </button>
  );
}
