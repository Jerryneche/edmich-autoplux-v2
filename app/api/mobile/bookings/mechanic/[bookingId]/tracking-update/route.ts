import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { mechanicBookingTrackingService } from "@/services/tracking.service";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/mobile/bookings/mechanic/{bookingId}/tracking
 * Update mechanic booking status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;
    const { status, message } = await request.json();

    if (!status || !message) {
      return NextResponse.json(
        { error: "status and message are required" },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await prisma.mechanicBooking.findUnique({
      where: { id: bookingId },
      include: { mechanic: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check authorization - only assigned mechanic or admin can update
    if (
      booking.mechanic?.userId !== user.id &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate status
    const validStatuses = ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid booking status" },
        { status: 400 }
      );
    }

    const updated = await mechanicBookingTrackingService.updateMechanicBookingStatus(
      bookingId,
      status,
      message
    );

    return NextResponse.json({
      success: true,
      tracking: {
        id: updated.id,
        status: updated.status,
        events: updated.events.map((event) => ({
          id: event.id,
          status: event.status,
          message: event.message,
          timestamp: event.timestamp,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error updating mechanic booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
