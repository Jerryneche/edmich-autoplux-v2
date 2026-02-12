import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/mobile/bookings/mechanic/{bookingId}/assign
 * Assign a mechanic to a booking
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { bookingId } = await params;
    const { mechanicId } = await request.json();

    if (!mechanicId) {
      return NextResponse.json(
        { error: "mechanicId is required" },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await prisma.mechanicBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Assign mechanic
    const updated = await prisma.mechanicBooking.update({
      where: { id: bookingId },
      data: { mechanicId },
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

    const mechanic = updated.mechanic;

    return NextResponse.json(
      {
        success: true,
        message: "Mechanic assigned successfully",
        tracking: {
          id: updated.id,
          bookingId: updated.id,
          status: updated.status,
          assignedMechanic: mechanic
            ? {
                id: mechanic.id,
                name: mechanic.user.name,
                phone: mechanic.user.phone,
              }
            : null,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error assigning mechanic:", error);

    if (error.message.includes("not found")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to assign mechanic" },
      { status: 500 }
    );
  }
}
