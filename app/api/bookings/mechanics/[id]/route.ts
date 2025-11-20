import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch single booking
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.mechanicBooking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        mechanic: {
          select: {
            businessName: true,
            phone: true,
            city: true,
            state: true,
            specialization: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if user owns this booking or is the mechanic
    const mechanicProfile = await prisma.mechanicProfile.findUnique({
      where: { userId: session.user.id },
    });

    const isOwner = booking.userId === session.user.id;
    const isMechanic =
      mechanicProfile && booking.mechanicId === mechanicProfile.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isMechanic && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to view this booking" },
        { status: 403 }
      );
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PATCH - Update booking status (Mechanic only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Get mechanic profile
    const mechanicProfile = await prisma.mechanicProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!mechanicProfile) {
      return NextResponse.json(
        { error: "Mechanic profile not found" },
        { status: 404 }
      );
    }

    // Get booking to check ownership
    const booking = await prisma.mechanicBooking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only assigned mechanic can update status
    if (booking.mechanicId !== mechanicProfile.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this booking" },
        { status: 403 }
      );
    }

    // Update booking
    const updatedBooking = await prisma.mechanicBooking.update({
      where: { id },
      data: { status },
    });

    // 🔥 CREATE NOTIFICATION FOR CUSTOMER
    const statusMessages: Record<string, string> = {
      CONFIRMED: `Your mechanic booking for ${booking.vehicleMake} ${booking.vehicleModel} has been confirmed! Scheduled for ${booking.date} at ${booking.time}.`,
      IN_PROGRESS: `Your mechanic has started working on your ${booking.vehicleMake} ${booking.vehicleModel}. Service: ${booking.serviceType}`,
      COMPLETED: `Great news! The ${booking.serviceType} service for your ${booking.vehicleMake} ${booking.vehicleModel} has been completed successfully!`,
      CANCELLED: `Your mechanic booking for ${booking.vehicleMake} ${booking.vehicleModel} has been cancelled.`,
    };

    if (statusMessages[status]) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: "BOOKING",
          title: "Booking Status Updated",
          message: statusMessages[status],
          link: `/dashboard/buyer/bookings?type=mechanics`,
          read: false,
        },
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel booking (Customer only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.mechanicBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only customer can cancel
    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to cancel this booking" },
        { status: 403 }
      );
    }

    // Can only cancel if PENDING
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Can only cancel pending bookings" },
        { status: 400 }
      );
    }

    // Update to CANCELLED instead of deleting
    await prisma.mechanicBooking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // 🔥 NOTIFY MECHANIC about cancellation
    if (booking.mechanicId) {
      const mechanic = await prisma.mechanicProfile.findUnique({
        where: { id: booking.mechanicId },
      });

      if (mechanic) {
        await prisma.notification.create({
          data: {
            userId: mechanic.userId,
            type: "BOOKING",
            title: "Booking Cancelled",
            message: `Customer cancelled booking for ${booking.vehicleMake} ${booking.vehicleModel} scheduled on ${booking.date}.`,
            link: `/dashboard/mechanic`,
            read: false,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
