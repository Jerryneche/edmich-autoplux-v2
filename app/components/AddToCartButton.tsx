"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ProductCardData } from "../types/product";

export default function AddToCartButton({
  product,
  variant = "default",
}: {
  product: ProductCardData;
  variant?: "default" | "icon";
}) {
  const { addItem } = useCart();

  const handleAdd = () => {
    if (product.stock <= 0) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      stock: product.stock,
    });
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleAdd}
        disabled={product.stock === 0}
        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <ShoppingCart className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={product.stock === 0}
      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Add to Cart
    </button>
  );
}
