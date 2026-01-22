import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { logisticsDeliveryTrackingService } from "@/services/tracking.service";

/**
 * POST /api/mobile/bookings/logistics/{deliveryId}/assign
 * Assign a logistics provider to a delivery
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { deliveryId: string } }
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

    const { deliveryId } = params;
    const { logisticsProviderId } = await request.json();

    if (!logisticsProviderId) {
      return NextResponse.json(
        { error: "logisticsProviderId is required" },
        { status: 400 }
      );
    }

    const tracking = await logisticsDeliveryTrackingService.assignProvider(
      deliveryId,
      logisticsProviderId
    );

    const provider = tracking.assignedProvider;

    return NextResponse.json(
      {
        success: true,
        message: "Logistics provider assigned successfully",
        tracking: {
          id: tracking.id,
          deliveryId: tracking.deliveryId,
          status: tracking.status,
          assignedProvider: provider
            ? {
                id: provider.id,
                name: provider.user.name,
                phone: provider.phone,
                rating: provider.rating,
                completedDeliveries: provider.completedDeliveries,
                vehicle: `${provider.companyName} - ${provider.vehicleType}`,
              }
            : null,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error assigning logistics provider:", error);

    if (error.message.includes("not found")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to assign logistics provider" },
      { status: 500 }
    );
  }
}
