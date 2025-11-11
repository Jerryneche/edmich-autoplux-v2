// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
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

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // VALIDATE EACH PRODUCT EXISTS
    const validItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, price: true, stock: true },
      });

      if (!product) {
        console.warn(`Product ID ${item.productId} not found`);
        // OPTION: Skip invalid product OR fail entire order
        continue; // ← SKIP BAD PRODUCT
        // OR: return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      validItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });

      calculatedTotal += product.price * item.quantity;
    }

    if (validItems.length === 0) {
      return NextResponse.json(
        { error: "No valid products in order" },
        { status: 400 }
      );
    }

    // Recalculate total (optional: compare with frontend)
    const finalTotal =
      calculatedTotal + 2500 + Math.round(calculatedTotal * 0.075);

    if (Math.abs(finalTotal - total) > 100) {
      return NextResponse.json({ error: "Total mismatch" }, { status: 400 });
    }

    // CREATE ORDER
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total,
        status: "PENDING",
        trackingId: `EDM-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 5)
          .toUpperCase()}`,
        shippingAddress: JSON.stringify(shippingAddress),
        deliveryNotes,
        paymentMethod,
        items: {
          create: validItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // UPDATE STOCK
    for (const item of validItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return NextResponse.json(
      { orderId: order.id, trackingId: order.trackingId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
