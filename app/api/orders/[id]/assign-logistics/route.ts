// app/api/orders/[id]/assign-logistics/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> } // Next.js 16 fix
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id: raw } = params;
    const orderIdOrTracking = raw?.trim();
    if (!orderIdOrTracking) {
      return NextResponse.json(
        { error: "Missing order id/tracking" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { logisticsId, providerMessage } = body || {};

    if (!logisticsId) {
      return NextResponse.json(
        { error: "Missing logisticsId" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderIdOrTracking }, { trackingId: orderIdOrTracking }],
      },
      include: { shippingAddress: true }, // ← Include full address
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const provider = await prisma.logisticsProfile.findUnique({
      where: { id: logisticsId },
      select: {
        id: true,
        userId: true,
        companyName: true,
        approved: true,
        available: true,
      },
    });

    if (!provider || !provider.approved) {
      return NextResponse.json(
        { error: "Invalid or unapproved logistics provider" },
        { status: 400 }
      );
    }

    const trackingNumber = order.trackingId || order.id;

    // BUILD FULL ADDRESS STRING
    const formatAddress = (addr: typeof order.shippingAddress) => {
      if (!addr) return "Address not provided";
      return `${addr.city}, ${addr.state} ${addr.zipCode}`;
    };

    const logisticsRequest = await prisma.logisticsRequest.create({
      data: {
        name: session.user.name ?? "Buyer",
        email: session.user.email ?? "",
        phone: "",
        pickup: formatAddress(order.shippingAddress), // Full pickup
        dropoff: formatAddress(order.shippingAddress), // Same for now (or use seller address later)
        vehicle: "Standard",
        deliveryDate: new Date(),
        notes: providerMessage ?? `Assigned for order ${trackingNumber}`,
        status: "PENDING",
        trackingNumber,
        userId: session.user.id,
        logisticsId: provider.id,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "SHIPPED" },
    });

    await prisma.notification.createMany({
      data: [
        {
          userId: provider.userId,
          type: "ORDER",
          title: `New delivery assigned: ${trackingNumber}`,
          message: `You have a new delivery request for tracking ${trackingNumber}.`,
          link: `/dashboard/logistics/requests/${logisticsRequest.id}`,
        },
        {
          userId: session.user.id,
          type: "ORDER",
          title: `Delivery assigned: ${trackingNumber}`,
          message: `A logistics partner has been assigned to your order.`,
          link: `/track/${trackingNumber}`,
        },
      ],
    });

    return NextResponse.json({
      message: "Logistics assigned",
      logisticsRequest,
    });
  } catch (err: any) {
    console.error("assign-logistics error:", err);
    return NextResponse.json(
      { error: "Failed to assign logistics" },
      { status: 500 }
    );
  }
}
