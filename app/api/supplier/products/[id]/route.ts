import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";

// GET - Get single product for editing
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        supplier: {
          select: {
            businessName: true,
            userId: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user owns this product
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

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

    // Get supplier profile
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { error: "Supplier profile not found" },
        { status: 404 }
      );
    }

    // Check ownership
    const product = await prisma.product.findUnique({
      where: { id: params.id },
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

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        stock: newStock,
        image,
      },
    });

    // Revalidate pages to show updated product
    try {
      revalidatePath("/shop");
      revalidatePath("/business/market");
      revalidatePath("/dashboard/supplier");
      revalidatePath(`/shop/${params.id}`);
    } catch (revalidateError) {
      console.error("Revalidation error:", revalidateError);
    }

    // Send notification for product update
    await createNotification({
      userId: session.user.id,
      type: "PRODUCT",
      title: "Product Updated",
      message: `${name} has been updated successfully`,
      link: `/shop/${params.id}`,
    });

    // Check stock levels and notify
    if (newStock === 0 && oldStock > 0) {
      // Product just went out of stock
      await createNotification({
        userId: session.user.id,
        type: "PRODUCT",
        title: "Product Out of Stock",
        message: `${name} is now out of stock`,
        link: `/dashboard/supplier`,
      });
    } else if (newStock <= 5 && newStock > 0 && oldStock > 5) {
      // Product just became low stock
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

// DELETE - Delete a product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPPLIER") {
      return NextResponse.json(
        { error: "Only suppliers can delete products" },
        { status: 403 }
      );
    }

    // Get supplier profile
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { error: "Supplier profile not found" },
        { status: 404 }
      );
    }

    // Check if product exists and belongs to this supplier
    const product = await prisma.product.findUnique({
      where: { id: params.id },
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

    // Delete product
    await prisma.product.delete({
      where: { id: params.id },
    });

    // Revalidate pages to remove deleted product
    try {
      revalidatePath("/shop");
      revalidatePath("/business/market");
      revalidatePath("/dashboard/supplier");
    } catch (revalidateError) {
      console.error("Revalidation error:", revalidateError);
    }

    // Send notification
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
