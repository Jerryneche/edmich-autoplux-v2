// app/api/products/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // AWAIT params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Transform data
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
      supplierId: product.supplierId,
      supplier:
        product.supplier?.businessName ||
        product.supplier?.user?.name ||
        "Verified Supplier",
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
