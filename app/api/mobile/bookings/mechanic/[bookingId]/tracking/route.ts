import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/mobile/bookings/mechanic/{bookingId}/tracking
 * Get mechanic booking tracking information
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await context.params;

    const booking = await prisma.mechanicBooking.findUnique({
      where: { id: bookingId },
      include: {
        mechanic: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const mechanic = booking.mechanic;

    const response = {
      id: booking.id,
      bookingId: booking.id,
      status: booking.status,
      assignedMechanic: mechanic
        ? {
            id: mechanic.id,
            name: mechanic.user.name,
            phone: mechanic.user.phone,
            email: mechanic.user.email,
          }
        : null,
      events: [],
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error: unknown) {
    console.error("Error fetching mechanic booking tracking:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking" },
      { status: 500 },
    );
  }
}
