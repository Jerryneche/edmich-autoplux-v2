import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { mechanicBookingTrackingService } from "@/services/tracking.service";

/**
 * GET /api/mobile/bookings/mechanic/{bookingId}/tracking
 * Get mechanic booking tracking information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;

    const tracking = await mechanicBookingTrackingService.getMechanicBookingTracking(
      bookingId
    );

    if (!tracking) {
      return NextResponse.json(
        { error: "Tracking not found" },
        { status: 404 }
      );
    }

    const mechanic = tracking.assignedMechanic;

    const response = {
      id: tracking.id,
      bookingId: tracking.bookingId,
      status: tracking.status,
      estimatedCompletionDate: tracking.estimatedCompletionDate,
      assignedMechanic: mechanic
        ? {
            id: mechanic.id,
            name: mechanic.user.name,
            phone: mechanic.user.phone,
            email: mechanic.user.email,
            rating: mechanic.rating,
            completedJobs: mechanic.completedJobs,
            specializations: mechanic.specialization,
          }
        : null,
      events: tracking.events.map((event) => ({
        id: event.id,
        status: event.status,
        message: event.message,
        timestamp: event.timestamp,
      })),
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error("Error fetching mechanic booking tracking:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking" },
      { status: 500 }
    );
  }
}
