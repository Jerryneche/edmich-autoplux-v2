import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { logisticsDeliveryTrackingService } from "@/services/tracking.service";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/mobile/bookings/logistics/{deliveryId}/tracking
 * Update logistics delivery status and location
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { deliveryId: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deliveryId } = params;
    const body = await request.json();
    const { status, currentLocation, estimatedDeliveryDate, message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    // Verify tracking exists
    const tracking = await prisma.logisticsDeliveryTracking.findUnique({
      where: { deliveryId },
    });

    if (!tracking) {
      return NextResponse.json(
        { error: "Tracking not found" },
        { status: 404 }
      );
    }

    // Check authorization - only assigned provider or admin can update
    if (tracking.assignedProviderId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate status
    const validStatuses = [
      "PENDING",
      "ACCEPTED",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "FAILED",
    ];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid delivery status" },
        { status: 400 }
      );
    }

    const updated = await logisticsDeliveryTrackingService.updateDeliveryStatus(
      deliveryId,
      status || tracking.status,
      currentLocation,
      estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : undefined,
      message
    );

    return NextResponse.json({
      success: true,
      tracking: {
        id: updated.id,
        status: updated.status,
        currentLocation: updated.currentLocation,
        estimatedDeliveryDate: updated.estimatedDeliveryDate,
        events: updated.events.map((event) => ({
          id: event.id,
          status: event.status,
          location: event.location,
          message: event.message,
          timestamp: event.timestamp,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error updating logistics delivery:", error);
    return NextResponse.json(
      { error: "Failed to update delivery" },
      { status: 500 }
    );
  }
}
