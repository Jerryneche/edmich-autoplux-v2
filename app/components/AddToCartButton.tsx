"use client";

import { useState } from "react";
import { ShoppingCart, Check, AlertCircle } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import toast from "react-hot-toast";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    stock: number;
    supplierId: string;
  };
  variant?: "primary" | "secondary" | "icon";
  className?: string;
}

export default function AddToCartButton({
  product,
  variant = "primary",
  className = "",
}: AddToCartButtonProps) {
  const { addItem, items, openCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const existingItem = items.find((item) => item.id === product.id);
  const isOutOfStock = product.stock === 0;
  const isAtStockLimit = existingItem && existingItem.quantity >= product.stock;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("This item is out of stock");
      return;
    }

    if (isAtStockLimit) {
      toast.error("Maximum stock reached for this item");
      return;
    }

    setIsAdding(true);

    // Add item to cart
    addItem(product);

    // Show success state
    setJustAdded(true);
    toast.success("Added to cart!");

    // Reset states
    setTimeout(() => {
      setIsAdding(false);
      setJustAdded(false);
    }, 1500);
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAtStockLimit || isAdding}
        className={`
          relative p-2.5 rounded-xl transition-all duration-300
          ${
            isOutOfStock || isAtStockLimit
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : justAdded
              ? "bg-green-500 text-white"
              : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:scale-105"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        aria-label="Add to cart"
      >
        {justAdded ? (
          <Check className="w-5 h-5" />
        ) : isOutOfStock ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <ShoppingCart className="w-5 h-5" />
        )}
      </button>
    );
  }

  if (variant === "secondary") {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAtStockLimit || isAdding}
        className={`
          flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
          font-medium transition-all duration-300
          ${
            isOutOfStock || isAtStockLimit
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : justAdded
              ? "bg-green-500 text-white"
              : "bg-white text-gray-900 border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 hover:shadow-md"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {justAdded ? (
          <>
            <Check className="w-5 h-5" />
            Added!
          </>
        ) : isOutOfStock ? (
          <>
            <AlertCircle className="w-5 h-5" />
            Out of Stock
          </>
        ) : isAtStockLimit ? (
          <>
            <AlertCircle className="w-5 h-5" />
            Max Reached
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </>
        )}
      </button>
    );
  }

  // Primary variant
  return (
    <button
      onClick={handleAddToCart}
      disabled={isOutOfStock || isAtStockLimit || isAdding}
      className={`
        relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl
        font-semibold transition-all duration-300 overflow-hidden
        ${
          isOutOfStock || isAtStockLimit
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : justAdded
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105"
        }
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
    >
      <div className="flex items-center gap-2">
        {justAdded ? (
          <>
            <Check className="w-5 h-5" />
            Added to Cart!
          </>
        ) : isOutOfStock ? (
          <>
            <AlertCircle className="w-5 h-5" />
            Out of Stock
          </>
        ) : isAtStockLimit ? (
          <>
            <AlertCircle className="w-5 h-5" />
            Max Stock Reached
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </>
        )}
      </div>

      {/* Ripple effect on add */}
      {isAdding && (
        <span className="absolute inset-0 bg-white opacity-30 animate-ping rounded-xl" />
      )}
    </button>
  );
}
