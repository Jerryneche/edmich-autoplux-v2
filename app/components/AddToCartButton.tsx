// app/components/AddToCartButton.tsx
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    description?: string | null; // ACCEPT null
    price: number;
    image?: string | null; // ACCEPT null
    stock: number;
    supplierId: string;
  };
  variant?: "icon" | "default";
}

export default function AddToCartButton({
  product,
  variant = "default",
}: AddToCartButtonProps) {
  const handleClick = () => {
    console.log("Added to cart:", product.name);
    // Add to cart logic
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={product.stock === 0}
        className={`p-2 rounded-full transition-all ${
          product.stock > 0
            ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg hover:shadow-xl"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        <ShoppingCartIcon className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={product.stock === 0}
      className={`w-full py-3 rounded-xl font-semibold transition-all ${
        product.stock > 0
          ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 shadow-lg"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
    >
      {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
    </button>
  );
}
