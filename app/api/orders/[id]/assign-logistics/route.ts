// app/api/orders/[id]/assign-logistics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: raw } = await context.params;
    const orderIdOrTracking = raw?.trim();
    if (!orderIdOrTracking) {
      return NextResponse.json(
        { error: "Missing order id/tracking" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { logisticsId, providerMessage } = body || {};

    if (!logisticsId) {
      return NextResponse.json(
        { error: "Missing logisticsId" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderIdOrTracking }, { trackingId: orderIdOrTracking }],
      },
      include: { shippingAddress: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== user.id && user.role !== "ADMIN") {
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
        { status: 400 },
      );
    }

    const trackingNumber = order.trackingId || order.id;

    const formatAddress = (addr: typeof order.shippingAddress) => {
      if (!addr) return "Address not provided";
      return `${addr.city}, ${addr.state} ${addr.zipCode || ""}`.trim();
    };

    const logisticsRequest = await prisma.logisticsRequest.create({
      data: {
        name: user.name ?? "Buyer",
        email: user.email ?? "",
        phone: "",
        pickup: formatAddress(order.shippingAddress),
        dropoff: formatAddress(order.shippingAddress),
        vehicle: "Standard",
        deliveryDate: new Date(),
        notes: providerMessage ?? `Assigned for order ${trackingNumber}`,
        status: "PENDING",
        trackingNumber,
        userId: user.id,
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
          userId: user.id,
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
      { status: 500 },
    );
  }
}
