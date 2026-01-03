// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSeedProducts } from "@/lib/seed-data";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.edmich.com";

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
        supplier: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });

    if (products.length === 0) {
      const seed = await getSeedProducts();
      return NextResponse.json(seed);
    }

    const formatted = products.map((p) => {
      // Handle image URL - ensure it's a full URL
      let imageUrl = p.image;
      if (!imageUrl) {
        imageUrl = null; // Let the client handle the placeholder
      } else if (imageUrl.startsWith("/")) {
        // Relative path - convert to full URL
        imageUrl = `${BASE_URL}${imageUrl}`;
      }
      // If it's already a full URL (Cloudinary, etc.), leave it as is

      return {
        id: p.id,
        name: p.name,
        description: p.description ?? "",
        price: p.price,
        category: p.category,
        image: imageUrl,
        stock: p.stock,
        supplierId: p.supplier?.id || "",
        supplier: p.supplier?.businessName || "AutoParts Ltd",
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Products API error:", error);
    const seed = await getSeedProducts();
    return NextResponse.json(seed);
  }
}
