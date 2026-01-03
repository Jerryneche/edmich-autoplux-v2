// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.edmich.com";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");

    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        image: true,
        stock: true,
        createdAt: true,
        supplier: {
          select: {
            id: true,
            businessName: true,
            verified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" }, // NEWEST FIRST
      ...(limit && { take: parseInt(limit) }),
    });

    const formatted = products.map((p) => {
      // Handle image URL - ensure it's a full URL for mobile
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
        verified: p.supplier?.verified || false,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json([]);
  }
}
