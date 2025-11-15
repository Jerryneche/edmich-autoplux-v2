// app/api/bookings/mechanic/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// GET - Fetch single booking
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> } // ← Next.js 16: params is Promise
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params; // ← MUST AWAIT
    const { id } = params;

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
            name: true,
            email: true,
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
      { status: 500 }
    );
  }
}

// PATCH - Update booking status
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
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
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

    // Only mechanic can update status
    if (booking.mechanicId !== session.user.id) {
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

    // CREATE NOTIFICATION FOR CUSTOMER
    const statusMessages: Record<string, string> = {
      CONFIRMED: "Your mechanic booking has been confirmed!",
      IN_PROGRESS: "Your mechanic has started working on your vehicle.",
      COMPLETED: "Your mechanic service has been completed!",
      CANCELLED: "Your mechanic booking has been cancelled.",
    };

    if (statusMessages[status]) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: NotificationType.BOOKING,
          title: "Booking Status Updated",
          message: statusMessages[status],
          link: `/dashboard`,
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
