// app/components/AddToCartButton.tsx
"use client";

import { useCart } from "@/app/context/CartContext";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
    });

    toast.success("Added to cart!"); // ONLY HERE
  };

  return (
    <button
      onClick={handleAdd}
      className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
    >
      <ShoppingCart className="h-6 w-6" />
      Add to Cart
    </button>
  );
}
