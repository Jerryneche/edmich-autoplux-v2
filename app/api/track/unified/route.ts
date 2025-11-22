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

    const upperTrackingId = trackingId.toUpperCase();

    // 🔥 DETECT TYPE & FETCH DATA
    let result = null;

    // 1️⃣ CHECK IF IT'S AN ORDER (EDM-)
    if (upperTrackingId.startsWith("EDM")) {
      const order = await prisma.order.findUnique({
        where: { trackingId: upperTrackingId },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, image: true, price: true },
              },
            },
          },
          shippingAddress: true,
          user: { select: { name: true, phone: true } },
        },
      });

      if (order) {
        result = {
          type: "ORDER",
          id: order.trackingId,
          status: order.status,
          title: "Auto Parts Order",
          items: order.items.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: order.total,
          created: order.createdAt.toISOString(),
          timeline: buildOrderTimeline(order),
          customer: {
            name: order.user.name || "Customer",
            phone: order.user.phone || order.shippingAddress?.phone || "N/A",
            city: order.shippingAddress?.city || "N/A",
          },
          estimatedDelivery: addDays(order.createdAt, 5).toISOString(),
        };
      }
    }

    // 2️⃣ CHECK IF IT'S LOGISTICS (TRK- or LOG-)
    if (
      upperTrackingId.startsWith("TRK") ||
      upperTrackingId.startsWith("LOG")
    ) {
      const booking = await prisma.logisticsBooking.findFirst({
        where: { trackingNumber: upperTrackingId },
        include: {
          user: { select: { name: true, phone: true } },
          driver: {
            select: { companyName: true, phone: true, vehicleType: true },
          },
        },
      });

      if (booking) {
        result = {
          type: "LOGISTICS",
          id: booking.trackingNumber,
          status: booking.status,
          title: "Package Delivery",
          packageType: booking.packageType,
          weight: "N/A", // Add weight field to schema if needed
          pickup: {
            address: booking.pickupAddress,
            city: booking.pickupCity,
          },
          delivery: {
            address: booking.deliveryAddress,
            city: booking.deliveryCity,
          },
          estimatedPrice: booking.estimatedPrice,
          created: booking.createdAt.toISOString(),
          currentLocation: {
            name: booking.currentLocation || booking.pickupCity,
          },
          timeline: buildLogisticsTimeline(booking),
          driver: booking.driver
            ? {
                name: booking.driver.companyName,
                phone: booking.driver.phone,
                vehicle: booking.driver.vehicleType,
              }
            : null,
          recipient: {
            name: booking.recipientName,
            phone: booking.recipientPhone,
          },
          estimatedDelivery: addDays(booking.createdAt, 3).toISOString(),
        };
      }
    }

    // 3️⃣ CHECK IF IT'S MECHANIC SERVICE (MECH-)
    if (upperTrackingId.startsWith("MECH")) {
      const booking = await prisma.mechanicBooking.findFirst({
        where: { id: upperTrackingId.replace("MECH-", "") },
        include: {
          user: { select: { name: true, phone: true } },
          mechanic: {
            select: {
              businessName: true,
              phone: true,
              rating: true,
              city: true,
            },
          },
        },
      });

      if (booking) {
        result = {
          type: "MECHANIC",
          id: `MECH-${booking.id}`,
          status: booking.status,
          title: "Vehicle Service",
          vehicle: {
            make: booking.vehicleMake,
            model: booking.vehicleModel,
            year: booking.vehicleYear,
            plate: booking.plateNumber || "N/A",
          },
          service: booking.serviceType,
          customService: booking.customService,
          estimatedPrice: booking.estimatedPrice,
          scheduled: {
            date: booking.date,
            time: booking.time,
          },
          location: {
            address: booking.address,
            city: booking.city,
          },
          created: booking.createdAt.toISOString(),
          timeline: buildMechanicTimeline(booking),
          mechanic: booking.mechanic
            ? {
                name: booking.mechanic.businessName,
                phone: booking.mechanic.phone,
                rating: booking.mechanic.rating,
              }
            : null,
          progress: buildMechanicProgress(booking),
        };
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: "Tracking ID not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Unified tracking error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking information" },
      { status: 500 }
    );
  }
}

// 🔥 TIMELINE BUILDERS
function buildOrderTimeline(order: any) {
  const timeline = [];
  const now = new Date();

  timeline.push({
    status: "Order Placed",
    date: order.createdAt.toISOString(),
    location: order.shippingAddress?.city || "Nigeria",
    completed: true,
  });

  if (["CONFIRMED", "SHIPPED", "DELIVERED"].includes(order.status)) {
    timeline.push({
      status: "Processing",
      date: addDays(order.createdAt, 0.5).toISOString(),
      location: "Warehouse",
      completed: true,
    });
  } else if (order.status === "PENDING") {
    timeline.push({
      status: "Processing",
      date: now.toISOString(),
      location: "Warehouse",
      completed: false,
    });
  }

  if (["SHIPPED", "DELIVERED"].includes(order.status)) {
    timeline.push({
      status: "Shipped",
      date: addDays(order.createdAt, 2).toISOString(),
      location: "In Transit",
      completed: true,
    });
  } else if (order.status === "CONFIRMED") {
    timeline.push({
      status: "Shipped",
      date: addDays(order.createdAt, 2).toISOString(),
      location: "In Transit",
      completed: false,
    });
  }

  if (order.status === "DELIVERED") {
    timeline.push({
      status: "Out for Delivery",
      date: addDays(order.createdAt, 4).toISOString(),
      location: order.shippingAddress?.city || "Your City",
      completed: true,
    });

    timeline.push({
      status: "Delivered",
      date: order.updatedAt.toISOString(),
      location: order.shippingAddress?.address || "Destination",
      completed: true,
    });
  } else if (!["CANCELLED"].includes(order.status)) {
    timeline.push({
      status: "Out for Delivery",
      date: addDays(order.createdAt, 4).toISOString(),
      location: order.shippingAddress?.city || "Your City",
      completed: false,
    });

    timeline.push({
      status: "Delivered",
      date: addDays(order.createdAt, 5).toISOString(),
      location: order.shippingAddress?.address || "Destination",
      completed: false,
    });
  }

  if (order.status === "CANCELLED") {
    timeline.push({
      status: "Cancelled",
      date: order.updatedAt.toISOString(),
      location: "System",
      completed: true,
    });
  }

  return timeline;
}

function buildLogisticsTimeline(booking: any) {
  const timeline = [];

  timeline.push({
    status: "Booking Confirmed",
    date: booking.createdAt.toISOString(),
    location: booking.pickupCity,
    completed: true,
  });

  if (["CONFIRMED", "IN_TRANSIT", "DELIVERED"].includes(booking.status)) {
    timeline.push({
      status: "Picked Up",
      date: addDays(booking.createdAt, 0.5).toISOString(),
      location: booking.pickupAddress,
      completed: true,
    });
  }

  if (["IN_TRANSIT", "DELIVERED"].includes(booking.status)) {
    timeline.push({
      status: "In Transit",
      date: addDays(booking.createdAt, 1).toISOString(),
      location: booking.currentLocation || "En Route",
      completed: true,
    });
  }

  if (booking.status === "DELIVERED") {
    timeline.push({
      status: "Out for Delivery",
      date: addDays(booking.createdAt, 2).toISOString(),
      location: booking.deliveryCity,
      completed: true,
    });

    timeline.push({
      status: "Delivered",
      date: booking.updatedAt.toISOString(),
      location: booking.deliveryAddress,
      completed: true,
    });
  } else if (!["CANCELLED"].includes(booking.status)) {
    timeline.push({
      status: "Out for Delivery",
      date: addDays(booking.createdAt, 2).toISOString(),
      location: booking.deliveryCity,
      completed: false,
    });

    timeline.push({
      status: "Delivered",
      date: addDays(booking.createdAt, 3).toISOString(),
      location: booking.deliveryAddress,
      completed: false,
    });
  }

  return timeline;
}

function buildMechanicTimeline(booking: any) {
  const timeline = [];

  timeline.push({
    status: "Booking Confirmed",
    date: booking.createdAt.toISOString(),
    description: "Service scheduled",
    completed: true,
  });

  if (["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(booking.status)) {
    timeline.push({
      status: "Vehicle Received",
      date: `${booking.date}T${booking.time}`,
      description: "Initial inspection done",
      completed: true,
    });
  }

  if (["IN_PROGRESS", "COMPLETED"].includes(booking.status)) {
    timeline.push({
      status: "Diagnostics",
      date: addDays(
        new Date(`${booking.date}T${booking.time}`),
        0.1
      ).toISOString(),
      description: "Issues identified",
      completed: true,
    });

    timeline.push({
      status: "Repair in Progress",
      date: addDays(
        new Date(`${booking.date}T${booking.time}`),
        0.2
      ).toISOString(),
      description: `Working on ${booking.serviceType}`,
      completed:
        booking.status === "IN_PROGRESS" || booking.status === "COMPLETED",
    });
  }

  if (booking.status === "COMPLETED") {
    timeline.push({
      status: "Quality Check",
      date: addDays(
        new Date(`${booking.date}T${booking.time}`),
        0.4
      ).toISOString(),
      description: "Testing repairs",
      completed: true,
    });

    timeline.push({
      status: "Ready for Pickup",
      date: booking.updatedAt.toISOString(),
      description: "Service complete",
      completed: true,
    });
  } else if (booking.status === "IN_PROGRESS") {
    timeline.push({
      status: "Quality Check",
      date: addDays(
        new Date(`${booking.date}T${booking.time}`),
        0.4
      ).toISOString(),
      description: "Testing repairs",
      completed: false,
    });

    timeline.push({
      status: "Ready for Pickup",
      date: addDays(
        new Date(`${booking.date}T${booking.time}`),
        0.5
      ).toISOString(),
      description: "Service complete",
      completed: false,
    });
  }

  return timeline;
}

function buildMechanicProgress(booking: any) {
  const progress = [
    {
      title: "Initial Inspection",
      status: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(booking.status)
        ? "completed"
        : "pending",
      notes: `Checking ${booking.vehicleMake} ${booking.vehicleModel} for ${booking.serviceType}`,
    },
    {
      title: "Service in Progress",
      status:
        booking.status === "IN_PROGRESS"
          ? "in_progress"
          : booking.status === "COMPLETED"
          ? "completed"
          : "pending",
      notes: booking.customService || `Performing ${booking.serviceType}`,
    },
    {
      title: "Final Testing",
      status: booking.status === "COMPLETED" ? "completed" : "pending",
      notes: booking.additionalNotes || "Quality check and test drive",
    },
  ];

  return progress;
}
