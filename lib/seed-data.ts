// lib/seed-data.ts
import { prisma } from "@/lib/prisma";
import { ProductCardData } from "@/types/product"; // ← ADD THIS

let cachedProducts: ProductCardData[] | null = null;

export async function getSeedProducts(): Promise<ProductCardData[]> {
  if (cachedProducts) return cachedProducts;

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      category: true,
      image: true,
      stock: true,
      supplier: {
        select: {
          id: true,
          businessName: true,
        },
      },
    },
  });

  cachedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "Premium auto part for Nigerian roads.",
    price: p.price,
    category: p.category,
    image: p.image || "/placeholder.jpg",
    stock: p.stock,
    supplierId: p.supplier?.id || "",
    supplier: p.supplier?.businessName || "AutoParts Ltd",
  }));

  return cachedProducts;
}
