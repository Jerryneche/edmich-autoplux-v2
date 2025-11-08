// app/types/product.ts
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  supplierId: string;
  rating?: number;
  reviewsCount?: number;
  brand?: string;
  partNumber?: string;
  compatibility?: string[];
  warranty?: string;
  createdAt: string;
  updatedAt: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type AddToCartPayload = {
  productId: string;
  quantity: number;
};
