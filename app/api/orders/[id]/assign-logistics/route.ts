// app/api/orders/[id]/assign-logistics/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: raw } = await params;
    const orderIdOrTracking = raw?.trim();
    if (!orderIdOrTracking) {
      return NextResponse.json(
        { error: "Missing order id/tracking" },
        { status: 400 }
      );
    }

    // Expect body: { logisticsId: string, providerMessage?: string }
    const body = await request.json();
    const { logisticsId, providerMessage } = body || {};

    if (!logisticsId) {
      return NextResponse.json(
        { error: "Missing logisticsId" },
        { status: 400 }
      );
    }

    // Find order by id or trackingId
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderIdOrTracking }, { trackingId: orderIdOrTracking }],
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Ensure caller owns the order (buyer) OR is admin/logistics — simple policy: only owner or admin can assign
    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate logistics provider exists and is approved
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

    // Generate a unique tracking for logistics request (keep correlation to order)
    const trackingNumber = order.trackingId || order.id;

    // Create LogisticsRequest linking user and logistics provider
    const logisticsRequest = await prisma.logisticsRequest.create({
      data: {
        name: session.user.name ?? "Buyer",
        email: session.user.email ?? "",
        phone: "",
        pickup: order.shippingAddress?.address ?? "Seller pickup",
        dropoff: order.shippingAddress?.address ?? "Buyer address",
        vehicle: "Standard",
        deliveryDate: new Date(),
        notes: providerMessage ?? `Assigned for order ${trackingNumber}`,
        status: "PENDING",
        trackingNumber,
        userId: session.user.id,
        logisticsId: provider.id,
      },
    });

    // (Optional) Update order status to SHIPPED or IN_TRANSIT according to your flow
    // Here we set to SHIPPED when a provider is assigned
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "SHIPPED" }, // ensure this matches allowed values in your app code
    });

    // Notify provider & user (simple Notification table)
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
