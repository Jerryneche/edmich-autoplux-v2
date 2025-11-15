// app/api/products/route.ts
// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSeedProducts } from "@/lib/seed-data";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        image: true,
        stock: true,
        supplier: { select: { businessName: true } },
      },
    });

    if (products.length === 0) {
      const seed = await getSeedProducts();
      return NextResponse.json(seed);
    }

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      category: p.category,
      image: p.image || "/placeholder.jpg",
      stock: p.stock,
      supplierId: p.supplier?.id || "",
      supplier: p.supplier?.businessName || "AutoParts Ltd",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Products API error:", error);
    const seed = await getSeedProducts();
    return NextResponse.json(seed);
  }
}
