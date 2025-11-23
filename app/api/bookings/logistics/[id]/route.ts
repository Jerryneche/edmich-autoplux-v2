import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const bookingId = params.id;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.logisticsBooking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
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
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check authorization
    if (
      booking.userId !== session.user.id &&
      session.user.role !== "LOGISTICS" &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const bookingId = params.id;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Get booking with user info
    const booking = await prisma.logisticsBooking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true } },
        driver: { select: { companyName: true, userId: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Update booking
    const updatedBooking = await prisma.logisticsBooking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        user: { select: { name: true, email: true, image: true } },
        driver: {
          select: {
            companyName: true,
            phone: true,
            city: true,
            state: true,
          },
        },
      },
    });

    // Update logistics provider's completedDeliveries count if status is COMPLETED
    if (status === "COMPLETED" && booking.driverId) {
      await prisma.logisticsProfile.update({
        where: { id: booking.driverId },
        data: { completedDeliveries: { increment: 1 } },
      });
    }

    // Send notification to customer about status change
    const statusMessages: Record<string, string> = {
      CONFIRMED: `Your delivery (${booking.trackingNumber}) has been confirmed by ${booking.driver?.companyName}. Pickup from ${booking.pickupCity} to ${booking.deliveryCity}.`,
      IN_PROGRESS: `Your package (${booking.trackingNumber}) is now in transit from ${booking.pickupCity} to ${booking.deliveryCity}.`,
      COMPLETED: `Your package (${booking.trackingNumber}) has been successfully delivered to ${booking.deliveryCity}!`,
      CANCELLED: `Your delivery booking (${booking.trackingNumber}) has been cancelled.`,
    };

    if (statusMessages[status]) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: "DELIVERY",
          title: `Delivery ${status.charAt(0) + status.slice(1).toLowerCase()}`,
          message: statusMessages[status],
          link: `/dashboard/buyer/bookings?type=logistics`,
        },
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
