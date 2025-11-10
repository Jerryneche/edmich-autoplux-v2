// app/components/AddToCartButton.tsx
"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ProductCardData } from "../types/product";

type AddToCartButtonProps = {
  product: ProductCardData;
  variant?: "default" | "icon";
};

export default function AddToCartButton({
  product,
  variant = "default",
}: AddToCartButtonProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      alert("Sorry, this item is out of stock.");
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      stock: product.stock,
    });
  };

  // Icon-only variant (e.g. in header)
  if (variant === "icon") {
    return (
      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className="relative p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Add to cart"
      >
        <ShoppingCart className="w-5 h-5" />
        {product.stock === 0 && (
          <span className="absolute inset-0 rounded-full bg-red-500/20" />
        )}
      </button>
    );
  }

  // Default full button
  return (
    <button
      onClick={handleAddToCart}
      disabled={product.stock === 0}
      className={`
        px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2
        ${
          product.stock > 0
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-md hover:scale-[1.02]"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }
      `}
    >
      <ShoppingCart className="w-4 h-4" />
      {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
    </button>
  );
}
