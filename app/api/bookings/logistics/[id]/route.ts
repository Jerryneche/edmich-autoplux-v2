import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const booking = await prisma.logisticsBooking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        driver: {
          select: {
            companyName: true,
            phone: true,
            vehicleType: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if user owns this booking or is the driver
    const driverProfile = await prisma.logisticsProfile.findUnique({
      where: { userId: session.user.id },
    });

    const isOwner = booking.userId === session.user.id;
    const isDriver = driverProfile && booking.driverId === driverProfile.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isDriver && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to view this booking" },
        { status: 403 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching logistics booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

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
    const { status, currentLocation } = await request.json();

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get driver profile
    const driverProfile = await prisma.logisticsProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!driverProfile) {
      return NextResponse.json(
        { error: "Logistics provider profile not found" },
        { status: 403 }
      );
    }

    // Get booking
    const booking = await prisma.logisticsBooking.findUnique({
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

    // Only assigned driver can update
    if (booking.driverId !== driverProfile.id) {
      return NextResponse.json(
        { error: "Not authorized to update this booking" },
        { status: 403 }
      );
    }

    // Cannot revert completed/cancelled
    if (
      ["COMPLETED", "CANCELLED"].includes(booking.status) &&
      !["COMPLETED", "CANCELLED"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Cannot revert completed or cancelled bookings" },
        { status: 400 }
      );
    }

    // Update booking
    const updateData: any = { status };
    if (currentLocation) {
      updateData.currentLocation = currentLocation;
    }

    const updated = await prisma.logisticsBooking.update({
      where: { id },
      data: updateData,
    });

    // 🔥 NOTIFY CUSTOMER about status change
    const messages: Record<string, string> = {
      CONFIRMED: `Your delivery with ${driverProfile.companyName} is confirmed! Package: ${booking.packageType}. Route: ${booking.pickupCity} → ${booking.deliveryCity}`,
      IN_PROGRESS: `Your package is in transit! Tracking: ${
        booking.trackingNumber
      }. Current location: ${currentLocation || "En route"}`,
      COMPLETED: `Package delivered successfully! Thank you for using ${driverProfile.companyName}. Tracking: ${booking.trackingNumber}`,
      CANCELLED: `Your delivery (${booking.trackingNumber}) has been cancelled. Please contact support for assistance.`,
    };

    if (messages[status]) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: "BOOKING",
          title: "Delivery Update",
          message: messages[status],
          link: `/dashboard/buyer/bookings?type=logistics`,
          read: false,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH logistics booking error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel logistics booking (Customer only)
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

    const booking = await prisma.logisticsBooking.findUnique({
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

    // Update to CANCELLED
    await prisma.logisticsBooking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // 🔥 NOTIFY DRIVER about cancellation
    if (booking.driverId) {
      const driver = await prisma.logisticsProfile.findUnique({
        where: { id: booking.driverId },
      });

      if (driver) {
        await prisma.notification.create({
          data: {
            userId: driver.userId,
            type: "BOOKING",
            title: "Delivery Cancelled",
            message: `Customer cancelled delivery booking. Tracking: ${booking.trackingNumber}. Route: ${booking.pickupCity} → ${booking.deliveryCity}`,
            link: `/dashboard/logistics`,
            read: false,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Delivery cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling logistics booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
