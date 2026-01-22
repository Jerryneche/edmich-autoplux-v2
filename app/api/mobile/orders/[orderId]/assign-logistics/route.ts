import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { orderTrackingService } from "@/services/tracking.service";

/**
 * POST /api/mobile/orders/{orderId}/assign-logistics
 * Assign a logistics provider to an order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or merchant
    if (!["ADMIN", "SUPPLIER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId } = params;
    const { logisticsProviderId } = await request.json();

    if (!logisticsProviderId) {
      return NextResponse.json(
        { error: "logisticsProviderId is required" },
        { status: 400 }
      );
    }

    const tracking = await orderTrackingService.assignLogisticsProvider(
      orderId,
      logisticsProviderId
    );

    const provider = tracking.assignedLogisticsProvider;

    return NextResponse.json(
      {
        success: true,
        message: "Logistics provider assigned successfully",
        tracking: {
          id: tracking.id,
          orderId: tracking.orderId,
          trackingNumber: tracking.trackingNumber,
          status: tracking.status,
          assignedLogisticsProvider: provider
            ? {
                id: provider.id,
                name: provider.name,
                phone: provider.phone,
                rating: provider.logisticsProfile?.rating || 0,
                completedDeliveries:
                  provider.logisticsProfile?.completedDeliveries || 0,
                vehicle: provider.logisticsProfile?.vehicleType || "N/A",
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
