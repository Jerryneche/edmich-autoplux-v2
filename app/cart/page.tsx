"use client";

import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
// ... other imports

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [stockInfo, setStockInfo] = useState<Record<string, number>>({});
  const [checkingStock, setCheckingStock] = useState(false);

  // Check stock availability
  useEffect(() => {
    const checkStock = async () => {
      if (items.length === 0) return;

      setCheckingStock(true);
      try {
        const stockChecks = await Promise.all(
          items.map(async (item) => {
            const res = await fetch(`/api/products/${item.id}`);
            if (res.ok) {
              const product = await res.json();
              return { id: item.id, stock: product.stock };
            }
            return { id: item.id, stock: 0 };
          })
        );

        const stockMap: Record<string, number> = {};
        stockChecks.forEach((check) => {
          stockMap[check.id] = check.stock;
        });

        setStockInfo(stockMap);

        // Alert user if any item exceeds available stock
        items.forEach((item) => {
          const availableStock = stockMap[item.id] || 0;
          if (item.quantity > availableStock) {
            toast.error(`${item.name}: Only ${availableStock} left in stock!`, {
              duration: 6000,
            });
          }
        });
      } catch (error) {
        console.error("Failed to check stock:", error);
      } finally {
        setCheckingStock(false);
      }
    };

    checkStock();
  }, [items]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const availableStock = stockInfo[itemId];

    if (availableStock !== undefined && newQuantity > availableStock) {
      toast.error(`Only ${availableStock} left in stock!`);
      return;
    }

    updateQuantity(itemId, newQuantity);
  };

  const canCheckout = () => {
    return items.every((item) => {
      const availableStock = stockInfo[item.id];
      return availableStock === undefined || item.quantity <= availableStock;
    });
  };

  // ... rest of your cart page code

  return (
    <div>
      {/* ... cart items */}

      {/* Show stock warnings */}
      {items.some((item) => {
        const availableStock = stockInfo[item.id];
        return availableStock !== undefined && item.quantity > availableStock;
      }) && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800 font-bold">⚠️ Stock Issue</p>
          <p className="text-red-600 text-sm">
            Some items exceed available stock. Please adjust quantities before
            checkout.
          </p>
        </div>
      )}

      {/* Checkout button */}
      <button
        onClick={() => router.push("/checkout")}
        disabled={!canCheckout() || checkingStock}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {checkingStock ? "Checking stock..." : "Proceed to Checkout"}
      </button>
    </div>
  );
}
