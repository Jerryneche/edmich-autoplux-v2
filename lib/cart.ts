// lib/cart.ts
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  stock: number;
  supplierId: string;
  quantity: number;
}

export const CART_STORAGE_KEY = "edmich_cart";

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem(CART_STORAGE_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const addToCart = (product: Omit<CartItem, "quantity">): void => {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

export const updateQuantity = (id: string, quantity: number): void => {
  if (quantity <= 0) {
    removeFromCart(id);
    return;
  }

  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.quantity = quantity;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }
};

export const removeFromCart = (id: string): void => {
  const cart = getCart().filter((i) => i.id !== id);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

export const clearCart = (): void => {
  localStorage.removeItem(CART_STORAGE_KEY);
};

export const getCartCount = (): number => {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
};

export const getCartTotal = (): number => {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
};
