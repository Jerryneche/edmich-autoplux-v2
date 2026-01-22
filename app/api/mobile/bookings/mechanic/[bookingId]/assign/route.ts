import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { mechanicBookingTrackingService } from "@/services/tracking.service";

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

    const tracking = await mechanicBookingTrackingService.assignMechanic(
      bookingId,
      mechanicId
    );

    const mechanic = tracking.assignedMechanic;

    return NextResponse.json(
      {
        success: true,
        message: "Mechanic assigned successfully",
        tracking: {
          id: tracking.id,
          bookingId: tracking.bookingId,
          status: tracking.status,
          assignedMechanic: mechanic
            ? {
                id: mechanic.id,
                name: mechanic.user.name,
                phone: mechanic.user.phone,
                rating: mechanic.rating,
                completedJobs: mechanic.completedJobs,
              }
            : null,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
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
