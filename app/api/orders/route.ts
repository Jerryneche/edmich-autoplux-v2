import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      items,
      total,
      shippingAddress,
      deliveryNotes,
      paymentMethod,
      trackingId,
    } = body;

    // Validate request
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    if (!shippingAddress || !trackingId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // STEP 1: Validate stock availability for all items
    const stockValidation = await Promise.all(
      items.map(async (item: { productId: string; quantity: number }) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, stock: true },
        });

        if (!product) {
          return {
            valid: false,
            error: `Product not found`,
            productId: item.productId,
          };
        }

        if (product.stock < item.quantity) {
          return {
            valid: false,
            error: `${product.name} - Only ${product.stock} left in stock (requested ${item.quantity})`,
            productId: item.productId,
            productName: product.name,
            availableStock: product.stock,
            requestedQuantity: item.quantity,
          };
        }

        return {
          valid: true,
          product,
        };
      })
    );

    // Check if any items failed validation
    const invalidItems = stockValidation.filter((v) => !v.valid);
    if (invalidItems.length > 0) {
      return NextResponse.json(
        {
          error: "Insufficient stock",
          message: invalidItems.map((item) => item.error).join(", "),
          insufficientStock: invalidItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            availableStock: item.availableStock,
            requestedQuantity: item.requestedQuantity,
          })),
        },
        { status: 400 }
      );
    }

    // STEP 2: Use transaction to create order and update stock atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          trackingId,
          total,
          status: paymentMethod === "BANK TRANSFER" ? "PENDING" : "CONFIRMED",
          paymentMethod,
          deliveryNotes: deliveryNotes || null,
        },
      });

      // Create order items and update stock
      const orderItems = await Promise.all(
        items.map(
          async (item: {
            productId: string;
            quantity: number;
            price: number;
          }) => {
            // Double-check stock again within transaction (race condition protection)
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { stock: true, name: true },
            });

            if (!product || product.stock < item.quantity) {
              throw new Error(
                `Stock changed: ${product?.name || "Product"} now has only ${
                  product?.stock || 0
                } left`
              );
            }

            // Update stock (decrement)
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: item.quantity },
              },
            });

            // Create order item
            return tx.orderItem.create({
              data: {
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              },
            });
          }
        )
      );

      // Create shipping address
      await tx.shippingAddress.create({
        data: {
          orderId: order.id,
          fullName: shippingAddress.fullName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode || null,
        },
      });

      return { order, orderItems };
    });

    // Send notification to user
    try {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: "ORDER",
          title: "Order Placed Successfully",
          message: `Your order ${trackingId} has been placed. Total: ₦${total.toLocaleString()}`,
          link: `/track/${trackingId}`,
        },
      });
    } catch (notifError) {
      console.error("Failed to send notification:", notifError);
      // Don't fail the order if notification fails
    }

    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      trackingId: result.order.trackingId,
      message: "Order placed successfully",
    });
  } catch (error: any) {
    console.error("Order creation error:", error);

    // Handle specific transaction errors
    if (error.message?.includes("Stock changed")) {
      return NextResponse.json(
        {
          error: "Stock availability changed",
          message: error.message,
        },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

// GET - Fetch user's orders
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                slug: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
