import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { orderTrackingService } from "@/services/tracking.service";

/**
 * GET /api/mobile/orders/{orderId}/tracking
 * Get order tracking information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    // Get tracking
    const tracking = await orderTrackingService.getOrderTracking(orderId);

    if (!tracking) {
      return NextResponse.json(
        { error: "Tracking not found" },
        { status: 404 }
      );
    }

    // Format response
    const provider = tracking.driver;
    const response = {
      id: tracking.id,
      orderId: tracking.orderId,
      status: tracking.status,
      currentLat: tracking.currentLat,
      currentLng: tracking.currentLng,
      lastLocationUpdate: tracking.lastLocationUpdate,
      estimatedArrival: tracking.estimatedArrival,
      deliveryLat: tracking.deliveryLat,
      deliveryLng: tracking.deliveryLng,
      assignedDriver: provider
        ? {
            id: provider.id,
            name: provider.name,
            phone: provider.phone,
            email: provider.email,
            rating: provider.logisticsProfile?.rating || 0,
            completedDeliveries:
              provider.logisticsProfile?.completedDeliveries || 0,
            vehicle: provider.logisticsProfile?.vehicleType || "N/A",
          }
        : null,
      updates: tracking.updates.map((update) => ({
        id: update.id,
        latitude: update.latitude,
        longitude: update.longitude,
        status: update.status,
        timestamp: update.timestamp,
      })),
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error: unknown) {
    console.error("Error fetching order tracking:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mobile/orders/{orderId}/tracking/history
 * Get order tracking history with pagination
 */
export async function getOrderTrackingHistory(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    const { total, events } = await orderTrackingService.getOrderTrackingHistory(
      orderId,
      limit,
      skip
    );

    return NextResponse.json({
      success: true,
      total,
      events: events.map((event) => ({
        id: event.id,
        status: event.status,
        location: event.location,
        message: event.message,
        timestamp: event.timestamp,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching tracking history:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking history" },
      { status: 500 }
    );
  }
}
