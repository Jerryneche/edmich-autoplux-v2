// app/api/bookings/mechanic/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// GET - Get single booking
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const booking = await prisma.mechanicBooking.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true, phone: true, image: true },
        },
        mechanic: {
          select: {
            businessName: true,
            phone: true,
            city: true,
            state: true,
            specialization: true,
            rating: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 },
    );
  }
}

// PATCH - Update booking status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

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

    const existingBooking = await prisma.mechanicBooking.findUnique({
      where: { id },
      include: {
        mechanic: {
          select: { userId: true },
        },
      },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const mechanicProfile = await prisma.mechanicProfile.findUnique({
      where: { userId: user.id },
    });

    const isMechanic = mechanicProfile?.id === existingBooking.mechanicId;
    const isCustomer = existingBooking.userId === user.id;

    if (!isMechanic && !isCustomer) {
      return NextResponse.json(
        { error: "Not authorized to update this booking" },
        { status: 403 },
      );
    }

    const booking = await prisma.mechanicBooking.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { name: true, email: true },
        },
        mechanic: {
          select: {
            businessName: true,
            phone: true,
            userId: true,
          },
        },
      },
    });

    const notifyUserId = isMechanic
      ? existingBooking.userId
      : existingBooking.mechanic?.userId;

    if (notifyUserId) {
      try {
        await prisma.notification.create({
          data: {
            userId: notifyUserId,
            type: "BOOKING",
            title: "Booking Status Updated",
            message: `Your mechanic booking has been ${status
              .toLowerCase()
              .replace("_", " ")}`,
            link: isMechanic
              ? `/dashboard/buyer/bookings`
              : `/dashboard/mechanic/bookings`,
          },
        });
      } catch (notifError) {
        console.warn("Notification failed:", notifError);
      }
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}

// DELETE - Cancel/delete booking
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const booking = await prisma.mechanicBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const mechanicProfile = await prisma.mechanicProfile.findUnique({
      where: { userId: user.id },
    });

    const isMechanic = mechanicProfile?.id === booking.mechanicId;
    const isCustomer = booking.userId === user.id;

    if (!isMechanic && !isCustomer) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.mechanicBooking.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Booking deleted" });
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 },
    );
  }
}
