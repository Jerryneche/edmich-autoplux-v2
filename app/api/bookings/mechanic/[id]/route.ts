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

    const booking = await prisma.mechanicBooking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
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
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check authorization
    if (
      booking.userId !== session.user.id &&
      session.user.role !== "MECHANIC" &&
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
    const booking = await prisma.mechanicBooking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true } },
        mechanic: { select: { businessName: true, userId: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Update booking
    const updatedBooking = await prisma.mechanicBooking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        user: { select: { name: true, email: true, image: true } },
        mechanic: {
          select: {
            businessName: true,
            phone: true,
            city: true,
            state: true,
          },
        },
      },
    });

    // Update mechanic's completedJobs count if status is COMPLETED
    if (status === "COMPLETED" && booking.mechanicId) {
      await prisma.mechanicProfile.update({
        where: { id: booking.mechanicId },
        data: { completedJobs: { increment: 1 } },
      });
    }

    // Send notification to customer about status change
    const statusMessages: Record<string, string> = {
      CONFIRMED: `Your mechanic service for ${booking.vehicleMake} ${booking.vehicleModel} has been confirmed by ${booking.mechanic?.businessName}. They will arrive on ${booking.date} at ${booking.time}.`,
      IN_PROGRESS: `Your mechanic ${booking.mechanic?.businessName} has started working on your ${booking.vehicleMake} ${booking.vehicleModel}.`,
      COMPLETED: `Great news! Your ${booking.vehicleMake} ${booking.vehicleModel} service has been completed by ${booking.mechanic?.businessName}.`,
      CANCELLED: `Your mechanic booking for ${booking.vehicleMake} ${booking.vehicleModel} has been cancelled.`,
    };

    if (statusMessages[status]) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: "BOOKING",
          title: `Service ${status.charAt(0) + status.slice(1).toLowerCase()}`,
          message: statusMessages[status],
          link: `/dashboard/buyer/bookings?type=mechanics`,
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
