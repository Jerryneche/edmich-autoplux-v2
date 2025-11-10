// app/context/CartContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  stock: number; // ← ADD THIS
};

export type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const newQuantity = existing.quantity + item.quantity;
        if (newQuantity > item.stock) {
          alert(`Only ${item.stock} in stock!`);
          return prev;
        }
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: newQuantity } : i
        );
      }
      if (item.quantity > item.stock) {
        alert(`Only ${item.stock} in stock!`);
        return prev;
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item && quantity > item.stock) {
        alert(`Only ${item.stock} in stock!`);
        return prev;
      }
      if (quantity <= 0) {
        return prev.filter((i) => i.id !== id);
      }
      return prev.map((i) => (i.id === id ? { ...i, quantity } : i));
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const openCart = () => setIsOpen(true);
  const isOpenCart = () => isOpen;
  const closeCart = () => setIsOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
