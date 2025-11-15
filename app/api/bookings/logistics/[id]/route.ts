// app/api/bookings/logistics/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> } // ← Next.js 16: params is Promise
) {
  try {
    const params = await context.params;
    const { id } = params;

    const booking = await prisma.logisticsBooking.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        driver: { select: { companyName: true, phone: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;
    const { status } = await request.json();

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

    const profile = await prisma.logisticsProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Provider profile not found" },
        { status: 403 }
      );
    }

    const booking = await prisma.logisticsBooking.findUnique({
      where: { id },
      select: {
        driverId: true,
        userId: true,
        status: true,
        trackingNumber: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.driverId !== profile.id) {
      return NextResponse.json(
        { error: "You can only update your own bookings" },
        { status: 403 }
      );
    }

    if (
      ["COMPLETED", "CANCELLED"].includes(booking.status) &&
      !["COMPLETED", "CANCELLED"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Cannot change completed/cancelled booking" },
        { status: 400 }
      );
    }

    const updated = await prisma.logisticsBooking.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { name: true } },
      },
    });

    const messages: Record<string, string> = {
      CONFIRMED: `Your delivery with ${profile.companyName} is confirmed!`,
      IN_PROGRESS: `Your package is in transit. Tracking: ${booking.trackingNumber}`,
      COMPLETED: `Delivered! Thank you for using ${profile.companyName}.`,
      CANCELLED: `Your delivery was cancelled.`,
    };

    if (messages[status]) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: "BOOKING", // ← Matches your Prisma enum
          title: "Delivery Update",
          message: messages[status],
          link: `/booking/logistics/${id}`,
          read: false,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating logistics booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update" },
      { status: 500 }
    );
  }
}
