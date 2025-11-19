import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingId = searchParams.get("id");

    if (!trackingId) {
      return NextResponse.json(
        { error: "Tracking ID is required" },
        { status: 400 }
      );
    }

    // Check if it's an order (starts with EDM)
    if (trackingId.startsWith("EDM")) {
      const order = await prisma.order.findUnique({
        where: { trackingId },
        include: {
          shippingAddress: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Build timeline based on status
      const timeline = buildOrderTimeline(order);

      const result = {
        type: "ORDER",
        trackingId: order.trackingId,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        estimatedDelivery: addDays(order.createdAt, 5).toISOString(),
        recipient: order.shippingAddress
          ? {
              name: order.shippingAddress.fullName,
              city: order.shippingAddress.city,
            }
          : {
              name: order.user.name,
              city: "N/A",
            },
        timeline,
      };

      return NextResponse.json(result);
    }

    // Check if it's a logistics booking (starts with LOG)
    if (trackingId.startsWith("LOG")) {
      const booking = await prisma.logisticsBooking.findUnique({
        where: { trackingNumber: trackingId },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!booking) {
        return NextResponse.json(
          { error: "Delivery not found" },
          { status: 404 }
        );
      }

      // Build timeline based on status
      const timeline = buildLogisticsTimeline(booking);

      const result = {
        type: "LOGISTICS",
        trackingId: booking.trackingNumber,
        status: booking.status,
        createdAt: booking.createdAt.toISOString(),
        estimatedDelivery: addDays(booking.createdAt, 3).toISOString(),
        currentLocation: booking.currentLocation || booking.pickupCity,
        recipient: {
          name: booking.recipientName,
          city: booking.deliveryCity,
        },
        timeline,
      };

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid tracking number format" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track shipment" },
      { status: 500 }
    );
  }
}

function buildOrderTimeline(order: any) {
  const timeline = [];
  const now = new Date();

  // Order Placed
  timeline.push({
    status: "Order Placed",
    timestamp: order.createdAt.toISOString(),
    location: order.shippingAddress?.city || "Nigeria",
    completed: true,
  });

  // Processing
  if (["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)) {
    timeline.push({
      status: "Processing",
      timestamp: addDays(order.createdAt, 0.5).toISOString(),
      location: "Warehouse",
      completed: true,
    });
  } else if (order.status === "PENDING") {
    timeline.push({
      status: "Processing",
      timestamp: now.toISOString(),
      location: "Warehouse",
      completed: false,
    });
  }

  // Shipped
  if (["SHIPPED", "DELIVERED"].includes(order.status)) {
    timeline.push({
      status: "Shipped",
      timestamp: addDays(order.createdAt, 1).toISOString(),
      location: "In Transit",
      completed: true,
    });
  } else if (!["CANCELLED"].includes(order.status)) {
    timeline.push({
      status: "Shipped",
      timestamp: addDays(order.createdAt, 2).toISOString(),
      location: "In Transit",
      completed: false,
    });
  }

  // Out for Delivery
  if (order.status === "DELIVERED") {
    timeline.push({
      status: "Out for Delivery",
      timestamp: addDays(order.createdAt, 4).toISOString(),
      location: order.shippingAddress?.city || "Your City",
      completed: true,
    });
  } else if (order.status === "SHIPPED") {
    timeline.push({
      status: "Out for Delivery",
      timestamp: addDays(order.createdAt, 4).toISOString(),
      location: order.shippingAddress?.city || "Your City",
      completed: false,
    });
  }

  // Delivered
  if (order.status === "DELIVERED") {
    timeline.push({
      status: "Delivered",
      timestamp: order.updatedAt.toISOString(),
      location: order.shippingAddress?.address || "Destination",
      completed: true,
    });
  } else if (!["CANCELLED"].includes(order.status)) {
    timeline.push({
      status: "Delivered",
      timestamp: addDays(order.createdAt, 5).toISOString(),
      location: order.shippingAddress?.address || "Destination",
      completed: false,
    });
  }

  // Cancelled
  if (order.status === "CANCELLED") {
    timeline.push({
      status: "Cancelled",
      timestamp: order.updatedAt.toISOString(),
      location: "System",
      completed: true,
    });
  }

  return timeline;
}

function buildLogisticsTimeline(booking: any) {
  const timeline = [];
  const now = new Date();

  // Booking Created
  timeline.push({
    status: "Booking Created",
    timestamp: booking.createdAt.toISOString(),
    location: booking.pickupCity,
    completed: true,
  });

  // Confirmed
  if (["CONFIRMED", "IN_TRANSIT", "DELIVERED"].includes(booking.status)) {
    timeline.push({
      status: "Confirmed",
      timestamp: addDays(booking.createdAt, 0.25).toISOString(),
      location: booking.pickupCity,
      completed: true,
    });
  } else if (booking.status === "PENDING") {
    timeline.push({
      status: "Confirmed",
      timestamp: now.toISOString(),
      location: booking.pickupCity,
      completed: false,
    });
  }

  // Picked Up
  if (["IN_TRANSIT", "DELIVERED"].includes(booking.status)) {
    timeline.push({
      status: "Picked Up",
      timestamp: addDays(booking.createdAt, 0.5).toISOString(),
      location: booking.pickupAddress,
      completed: true,
    });
  } else if (booking.status === "CONFIRMED") {
    timeline.push({
      status: "Picked Up",
      timestamp: addDays(booking.createdAt, 0.5).toISOString(),
      location: booking.pickupAddress,
      completed: false,
    });
  }

  // In Transit
  if (["IN_TRANSIT", "DELIVERED"].includes(booking.status)) {
    timeline.push({
      status: "In Transit",
      timestamp: addDays(booking.createdAt, 1).toISOString(),
      location: booking.currentLocation || "En Route",
      completed:
        booking.status === "IN_TRANSIT" || booking.status === "DELIVERED",
    });
  } else if (!["CANCELLED"].includes(booking.status)) {
    timeline.push({
      status: "In Transit",
      timestamp: addDays(booking.createdAt, 1).toISOString(),
      location: "En Route",
      completed: false,
    });
  }

  // Out for Delivery
  if (booking.status === "DELIVERED") {
    timeline.push({
      status: "Out for Delivery",
      timestamp: addDays(booking.createdAt, 2).toISOString(),
      location: booking.deliveryCity,
      completed: true,
    });
  } else if (booking.status === "IN_TRANSIT") {
    timeline.push({
      status: "Out for Delivery",
      timestamp: addDays(booking.createdAt, 2).toISOString(),
      location: booking.deliveryCity,
      completed: false,
    });
  }

  // Delivered
  if (booking.status === "DELIVERED") {
    timeline.push({
      status: "Delivered",
      timestamp: booking.updatedAt.toISOString(),
      location: booking.deliveryAddress,
      completed: true,
    });
  } else if (!["CANCELLED"].includes(booking.status)) {
    timeline.push({
      status: "Delivered",
      timestamp: addDays(booking.createdAt, 3).toISOString(),
      location: booking.deliveryAddress,
      completed: false,
    });
  }

  // Cancelled
  if (booking.status === "CANCELLED") {
    timeline.push({
      status: "Cancelled",
      timestamp: booking.updatedAt.toISOString(),
      location: "System",
      completed: true,
    });
  }

  return timeline;
}
