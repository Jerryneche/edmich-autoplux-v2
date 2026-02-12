import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { orderTrackingService } from "@/services/tracking.service";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/mobile/orders/{orderId}/tracking
 * Update order tracking status and location
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const body = await request.json();
    const { status, lastLocation, estimatedDeliveryDate, message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    // Verify tracking exists
    const tracking = await prisma.orderTracking.findUnique({
      where: { orderId },
      include: {
        driver: true,
      },
    });

    if (!tracking) {
      return NextResponse.json(
        { error: "Tracking not found" },
        { status: 404 }
      );
    }

    // Check authorization - only assigned provider or admin can update
    const isAssignedProvider = tracking.driver?.id === user.id;
    if (!isAssignedProvider && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate status
    const validStatuses = [
      "PENDING",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "FAILED",
    ];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid tracking status" },
        { status: 400 }
      );
    }

    const updated = await orderTrackingService.updateOrderTrackingStatus(
      orderId,
      status || tracking.status,
      lastLocation,
      estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : undefined,
      message
    );

    return NextResponse.json({
      success: true,
      tracking: {
        id: updated.id,
        status: updated.status,
        lastLocation: updated.lastLocation,
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
    console.error("Error updating order tracking:", error);
    return NextResponse.json(
      { error: "Failed to update tracking" },
      { status: 500 }
    );
  }
}
