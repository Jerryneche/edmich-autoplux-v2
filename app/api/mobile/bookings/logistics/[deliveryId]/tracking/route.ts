import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { logisticsDeliveryTrackingService } from "@/services/tracking.service";

/**
 * GET /api/mobile/bookings/logistics/{deliveryId}/tracking
 * Get logistics delivery tracking information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deliveryId } = await params;

    const tracking = await logisticsDeliveryTrackingService.getLogisticsDeliveryTracking(
      deliveryId
    );

    if (!tracking) {
      return NextResponse.json(
        { error: "Tracking not found" },
        { status: 404 }
      );
    }

    const provider = tracking.assignedProvider;

    const events: Array<{
      id: string;
      status: string;
      location: string | null;
      message: string | null;
      timestamp: Date;
    }> = (tracking.events ?? []).map((event) => ({
      id: event.id,
      status: event.status,
      location: event.location,
      message: event.message,
      timestamp: event.timestamp,
    }));

    const response = {
      id: tracking.id,
      deliveryId: tracking.deliveryId,
      status: tracking.status,
      currentLocation: tracking.currentLocation,
      estimatedDeliveryDate: tracking.estimatedDeliveryDate,
      assignedProvider: provider
        ? {
            id: provider.id,
            name: provider.user.name,
            phone: provider.phone,
            email: provider.user.email,
            rating: provider.rating,
            completedDeliveries: provider.completedDeliveries,
            vehicle: `${provider.companyName} - ${provider.vehicleType}`,
          }
        : null,
      events,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error: unknown) {
    console.error("Error fetching logistics tracking:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking" },
      { status: 500 }
    );
  }
}
