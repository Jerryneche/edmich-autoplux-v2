// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// POST: Create a new order
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Received payload:", body);

    const {
      items,
      total,
      shippingAddress,
      deliveryNotes,
      paymentMethod,
      trackingId,
    } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Get user with name for notifications
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate products and collect supplier info
    const supplierIds = new Set<string>();
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          stock: true,
          price: true,
          supplierId: true,
          name: true,
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.productId}` },
          { status: 400 }
        );
      }

      supplierIds.add(product.supplierId);
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        status: "PENDING",
        paymentMethod,
        trackingId,
        deliveryNotes,
        shippingAddress: {
          create: {
            fullName: shippingAddress.fullName,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
          },
        },
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
                supplier: {
                  select: {
                    businessName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // 🔥 CREATE NOTIFICATION FOR BUYER (Order Confirmation)
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "ORDER",
        title: "Order Placed Successfully",
        message: `Your order #${trackingId} has been placed successfully. Total: ₦${total.toLocaleString()}. You will be notified when the supplier confirms your order.`,
        link: `/dashboard/buyer/orders`,
        read: false,
      },
    });

    // 🔥 CREATE NOTIFICATIONS FOR ALL SUPPLIERS IN THE ORDER
    // Group items by supplier for better notifications
    const itemsBySupplier: { [key: string]: any[] } = {};

    for (const item of order.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          supplierId: true,
          name: true,
          supplier: {
            select: {
              userId: true,
              businessName: true,
            },
          },
        },
      });

      if (product) {
        const supplierId = product.supplier.userId;
        if (!itemsBySupplier[supplierId]) {
          itemsBySupplier[supplierId] = [];
        }
        itemsBySupplier[supplierId].push({
          name: product.name,
          quantity: item.quantity,
          price: item.price,
        });
      }
    }

    // Create notification for each supplier
    for (const [supplierId, supplierItems] of Object.entries(itemsBySupplier)) {
      const itemsList = supplierItems
        .map((item) => `${item.name} (x${item.quantity})`)
        .join(", ");

      const supplierTotal = supplierItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await prisma.notification.create({
        data: {
          userId: supplierId,
          type: "ORDER",
          title: "New Order Received",
          message: `New order #${trackingId} from ${
            user.name || "Customer"
          }. Items: ${itemsList}. Amount: ₦${supplierTotal.toLocaleString()}. Delivery to: ${
            shippingAddress.city
          }, ${shippingAddress.state}`,
          link: `/dashboard/supplier`,
          read: false,
        },
      });
    }

    console.log("Order created with notifications:", order.id);

    return NextResponse.json({
      orderId: order.id,
      trackingId: order.trackingId,
      message: "Order created successfully",
    });
  } catch (error: any) {
    console.error("ORDER CREATION FAILED:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error.message || "Unknown error",
        code: error.code || "UNKNOWN",
      },
      { status: 500 }
    );
  }
}

// GET: Fetch all orders for the authenticated user
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("FAILED TO FETCH ORDERS:", {
      message: error.message,
      code: error.code,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
