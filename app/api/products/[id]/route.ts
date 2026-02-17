// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            businessName: true,
            userId: true,
            user: {
              select: { name: true, email: true, phone: true },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
      supplierId: product.supplierId,
      supplierUserId: product.supplier?.userId || null,
      supplier:
        product.supplier?.businessName ||
        product.supplier?.user?.name ||
        "Verified Supplier",
      supplierContact: product.supplier?.user
        ? {
            name: product.supplier.user.name,
            email: product.supplier.user.email,
            phone: product.supplier.user.phone,
          }
        : null,
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
