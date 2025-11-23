import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const orderId = params.id;

    console.log("GET service-links - orderId:", orderId); // Debug log

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get order with service links
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        serviceLinks: {
          include: {
            mechanicBooking: {
              include: {
                mechanic: {
                  select: {
                    businessName: true,
                    phone: true,
                    city: true,
                    state: true,
                    rating: true,
                  },
                },
              },
            },
            logisticsBooking: {
              include: {
                driver: {
                  select: {
                    companyName: true,
                    phone: true,
                    city: true,
                    state: true,
                    rating: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check authorization
    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order.serviceLinks);
  } catch (error) {
    console.error("Error fetching service links:", error);
    return NextResponse.json(
      { error: "Failed to fetch service links" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const orderId = params.id;

    console.log("POST service-links - orderId:", orderId);

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, type } = body as {
      bookingId: string;
      type: "MECHANIC" | "LOGISTICS";
    };

    console.log("Creating service link:", { orderId, bookingId, type });

    // Verify order ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { serviceLinks: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if service type already linked
    const existingLink = order.serviceLinks.find((link) =>
      type === "MECHANIC" ? link.mechanicBookingId : link.logisticsBookingId
    );

    if (existingLink) {
      return NextResponse.json(
        { error: `${type} service already booked for this order` },
        { status: 400 }
      );
    }

    // Create service link in a transaction
    const serviceLink = await prisma.$transaction(async (tx) => {
      // First update the booking with order info
      if (type === "MECHANIC") {
        await tx.mechanicBooking.update({
          where: { id: bookingId },
          data: {
            orderId,
            trackingId: order.trackingId,
          },
        });
      } else {
        await tx.logisticsBooking.update({
          where: { id: bookingId },
          data: {
            orderId,
            trackingId: order.trackingId,
          },
        });
      }

      // Then create the service link
      return await tx.orderServiceLink.create({
        data: {
          orderId,
          ...(type === "MECHANIC"
            ? { mechanicBookingId: bookingId }
            : { logisticsBookingId: bookingId }),
        },
        include: {
          mechanicBooking: {
            include: {
              mechanic: {
                select: {
                  businessName: true,
                  phone: true,
                  city: true,
                  state: true,
                },
              },
            },
          },
          logisticsBooking: {
            include: {
              driver: {
                select: {
                  companyName: true,
                  phone: true,
                  city: true,
                  state: true,
                },
              },
            },
          },
        },
      });
    });

    console.log("Service link created successfully:", serviceLink.id);

    return NextResponse.json(serviceLink);
  } catch (error) {
    console.error("Error creating service link:", error);
    return NextResponse.json(
      { error: "Failed to create service link" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const orderId = params.id;

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as "MECHANIC" | "LOGISTICS";

    if (!type) {
      return NextResponse.json(
        { error: "Type parameter required" },
        { status: 400 }
      );
    }

    // Verify order ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find and delete service link
    const serviceLink = await prisma.orderServiceLink.findFirst({
      where: {
        orderId,
        ...(type === "MECHANIC"
          ? { mechanicBookingId: { not: null } }
          : { logisticsBookingId: { not: null } }),
      },
    });

    if (!serviceLink) {
      return NextResponse.json(
        { error: "Service link not found" },
        { status: 404 }
      );
    }

    await prisma.orderServiceLink.delete({
      where: { id: serviceLink.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service link:", error);
    return NextResponse.json(
      { error: "Failed to delete service link" },
      { status: 500 }
    );
  }
}
