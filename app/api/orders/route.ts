// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*  Types – strongly typed, no `any`                                          */
/* -------------------------------------------------------------------------- */
type CartItem = {
  productId: string;
  quantity: number;
  price: number;
};

type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
};

type OrderPayload = {
  items: CartItem[];
  total: number;
  shippingAddress: ShippingAddress;
  deliveryNotes?: string;
  paymentMethod: string;
};

/* -------------------------------------------------------------------------- */
/*  POST – Create Order                                                       */
/* -------------------------------------------------------------------------- */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = (await request.json()) as OrderPayload;
    const { items, total, shippingAddress, deliveryNotes, paymentMethod } =
      body;

    // 1. Validate payload
    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.email ||
      !shippingAddress?.phone ||
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.state
    ) {
      return NextResponse.json(
        { error: "Shipping address is incomplete" },
        { status: 400 }
      );
    }

    // 2. Require login
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Please login to place an order" },
        { status: 401 }
      );
    }

    // 3. Validate products & stock
    for (const item of items) {
      const productId = String(item.productId);
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, stock: true },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${productId}` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Only ${product.stock} left.`,
          },
          { status: 400 }
        );
      }
    }

    // 4. Create order + items + update stock in ONE transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          status: "PENDING",
          deliveryNotes: deliveryNotes || "",
          paymentMethod,
          shippingAddress: shippingAddress, // ← CLEAN JSON OBJECT
          items: {
            create: items.map((i) => ({
              productId: String(i.productId),
              quantity: i.quantity,
              price: i.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, image: true },
              },
            },
          },
        },
      });

      // Decrement stock
      for (const i of items) {
        await tx.product.update({
          where: { id: String(i.productId) },
          data: { stock: { decrement: i.quantity } },
        });
      }

      return newOrder;
    });

    // 5. Success
    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Order placed successfully!",
      order: {
        id: order.id,
        total: order.total,
        status: order.status,
        items: order.items,
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  GET – Fetch user orders                                                   */
/* -------------------------------------------------------------------------- */
export async function GET() {
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
              select: { id: true, name: true, image: true, price: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
