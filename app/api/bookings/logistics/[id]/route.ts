import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// GET single logistics booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.logisticsBooking.findUnique({
      where: { id },
      include: {
        driver: {
          select: {
            companyName: true,
            phone: true,
            city: true,
            state: true,
            vehicleTypes: true,
          },
        },
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check authorization
    const isProvider = await prisma.logisticsProfile.findFirst({
      where: { userId: user.id, id: booking.providerId },
    });

    if (booking.userId !== user.id && !isProvider && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Error fetching logistics booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PATCH - Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, currentLocation } = body;

    const booking = await prisma.logisticsBooking.findUnique({
      where: { id },
      include: { driver: { select: { userId: true, companyName: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isProvider = booking.driver?.userId === user.id;
    const isBuyer = booking.userId === user.id;

    if (!isProvider && !isBuyer && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (currentLocation) updateData.currentLocation = currentLocation;

    const updatedBooking = await prisma.logisticsBooking.update({
      where: { id },
      data: updateData,
      include: {
        driver: {
          select: { companyName: true, phone: true, city: true, state: true },
        },
      },
    });

    // Notifications
    if (status) {
      const statusMessages: Record<string, string> = {
        CONFIRMED: "Your delivery has been confirmed",
        IN_PROGRESS: "Your package is now in transit",
        COMPLETED: "Your delivery has been completed",
        CANCELLED: "Your delivery has been cancelled",
      };

      if (isProvider && statusMessages[status]) {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: "BOOKING",
            title: `Delivery ${status.replace("_", " ")}`,
            message: statusMessages[status],
            link: `/bookings/logistics/${booking.id}`,
          },
        });
      }

      if (isBuyer && status === "CANCELLED" && booking.driver) {
        await prisma.notification.create({
          data: {
            userId: booking.driver.userId,
            type: "BOOKING",
            title: "Delivery Cancelled",
            message: "A delivery booking has been cancelled",
            link: `/dashboard/logistics/bookings`,
          },
        });
      }
    }

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error("Error updating logistics booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.logisticsBooking.findUnique({ where: { id } });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Can only delete pending bookings" },
        { status: 400 }
      );
    }

    await prisma.logisticsBooking.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Booking deleted" });
  } catch (error: any) {
    console.error("Error deleting logistics booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
