// Product type matching your Prisma schema
export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  image?: string | null;
  stock: number;
  supplierId: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Relations (optional - for when you include them)
  supplier?: {
    id: string;
    businessName?: string | null;
    user?: {
      name?: string | null;
    };
  };
  reviews?: Review[];
  orderItems?: OrderItem[];
}

// Simplified Product for cards/lists

// app/types/product.ts
export interface ProductCardData {
  id: string;
  name: string;
  description?: string; // ← NO NULL
  price: number;
  category: string;
  image?: string; // ← NO NULL
  stock: number;
  supplierId: string;
  supplier?: string; // ← NO NULL
  rating?: number;
  createdAt?: number;
}

// Review type
export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  userId: string;
  productId: string;
  createdAt: Date;
}

// Order Item type
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

// Cart Item type (re-exported from CartContext for convenience)
export interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  quantity: number;
  stock: number;
  supplierId: string;
}
