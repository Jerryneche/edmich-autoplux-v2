import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";

// GET - Get single product
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> } // ← Promise!
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params; // ← MUST AWAIT
    const { id } = params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        supplier: {
          select: { businessName: true, userId: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (
      product.supplier.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Not authorized to view this product" },
        { status: 403 }
      );
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;
    const { id } = params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Only suppliers can update products" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, category, stock, image } = body;

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { error: "Supplier profile not found" },
        { status: 404 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.supplierId !== supplierProfile.id) {
      return NextResponse.json(
        { error: "You can only update your own products" },
        { status: 403 }
      );
    }

    const oldStock = product.stock;
    const newStock = parseInt(stock);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        stock: newStock,
        image,
      },
    });

    try {
      revalidatePath("/shop");
      revalidatePath("/business/market");
      revalidatePath("/dashboard/supplier");
      revalidatePath(`/shop/${id}`);
    } catch (e) {
      console.error("Revalidation error:", e);
    }

    await createNotification({
      userId: session.user.id,
      type: "PRODUCT",
      title: "Product Updated",
      message: `${name} has been updated successfully`,
      link: `/shop/${id}`,
    });

    if (newStock === 0 && oldStock > 0) {
      await createNotification({
        userId: session.user.id,
        type: "PRODUCT",
        title: "Product Out of Stock",
        message: `${name} is now out of stock`,
        link: `/dashboard/supplier`,
      });
    } else if (newStock <= 5 && newStock > 0 && oldStock > 5) {
      await createNotification({
        userId: session.user.id,
        type: "PRODUCT",
        title: "Low Stock Alert",
        message: `${name} has only ${newStock} units left`,
        link: `/dashboard/supplier`,
      });
    }

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;
    const { id } = params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Only suppliers can delete products" },
        { status: 403 }
      );
    }

    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { error: "Supplier profile not found" },
        { status: 404 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.supplierId !== supplierProfile.id) {
      return NextResponse.json(
        { error: "You can only delete your own products" },
        { status: 403 }
      );
    }

    const productName = product.name;

    await prisma.product.delete({
      where: { id },
    });

    try {
      revalidatePath("/shop");
      revalidatePath("/business/market");
      revalidatePath("/dashboard/supplier");
    } catch (e) {
      console.error("Revalidation error:", e);
    }

    await createNotification({
      userId: session.user.id,
      type: "PRODUCT",
      title: "Product Deleted",
      message: `${productName} has been removed from the marketplace`,
      link: `/dashboard/supplier`,
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
