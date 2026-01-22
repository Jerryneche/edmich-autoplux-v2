// app/tracking/live/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const trackingNumber = id.toUpperCase();

    // Find tracking by tracking number
    const tracking = await prisma.orderTracking.findFirst({
      where: {
        trackingNumber,
      },
      include: {
        order: {
          include: {
            user: {
              select: { name: true, phone: true, image: true },
            },
            items: {
              include: {
                product: {
                  include: {
                    supplier: {
                      include: {
                        user: { select: { phone: true, name: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        assignedLogisticsProvider: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            image: true,
            logisticsProfile: {
              select: {
                rating: true,
                completedDeliveries: true,
                vehicleType: true,
                vehicleNumber: true,
              },
            },
          },
        },
        events: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!tracking) {
      return NextResponse.json(
        { error: "Tracking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        trackingNumber: tracking.trackingNumber,
        status: tracking.status,
        lastLocation: tracking.lastLocation,
        estimatedDeliveryDate: tracking.estimatedDeliveryDate,

        buyer: {
          name: tracking.order.user.name || "Customer",
          phone: tracking.order.user.phone,
          image: tracking.order.user.image,
        },

        items: tracking.order.items.map((item) => ({
          name: item.product.name,
          image: item.product.image,
          quantity: item.quantity,
          price: item.price,
          supplier: item.product.supplier
            ? {
                name: item.product.supplier.businessName,
                phone: item.product.supplier.user?.phone || null,
                contactName: item.product.supplier.user?.name,
              }
            : null,
        })),

        provider: tracking.assignedLogisticsProvider
          ? {
              id: tracking.assignedLogisticsProvider.id,
              name: tracking.assignedLogisticsProvider.name || "Provider",
              phone: tracking.assignedLogisticsProvider.phone || null,
              email: tracking.assignedLogisticsProvider.email,
              image: tracking.assignedLogisticsProvider.image,
              rating: tracking.assignedLogisticsProvider.logisticsProfile?.rating ?? 0,
              completedDeliveries:
                tracking.assignedLogisticsProvider.logisticsProfile?.completedDeliveries ?? 0,
              vehicle: tracking.assignedLogisticsProvider.logisticsProfile
                ? `${tracking.assignedLogisticsProvider.logisticsProfile.vehicleType} • ${tracking.assignedLogisticsProvider.logisticsProfile.vehicleNumber}`
                : null,
            }
          : null,

        location: tracking.lastLocation,

        events: tracking.events.map((event) => ({
          id: event.id,
          status: event.status,
          location: event.location,
          message: event.message,
          timestamp: event.timestamp,
        })),
      },
    });
  } catch (error: any) {
    console.error("Live tracking error:", error);
    return NextResponse.json(
      { error: "Failed to load tracking" },
      { status: 500 }
    );
  }
}
