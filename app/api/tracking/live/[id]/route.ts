// app/tracking/live/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> } // ← Now a Promise!
) {
  try {
    // MUST AWAIT params in Next.js 16
    const { id } = await context.params;
    const trackingId = id.toUpperCase();

    const tracking = await prisma.orderTracking.findFirst({
      where: {
        order: { trackingId },
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
        driver: {
          include: {
            logisticsProfile: true,
          },
        },
        updates: true,
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
        trackingId: tracking.order.trackingId,
        status: tracking.order.status,
        total: tracking.order.total,
        estimatedArrival: tracking.estimatedArrival,

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

        driver: tracking.driver
          ? {
              name: tracking.driver.name || "Driver",
              phone: tracking.driver.phone || null,
              image: tracking.driver.image,
              rating: tracking.driver.logisticsProfile?.rating ?? 0,
              completedJobs:
                tracking.driver.logisticsProfile?.completedDeliveries ?? 0,
              vehicle: tracking.driver.logisticsProfile
                ? `${tracking.driver.logisticsProfile.vehicleType} • ${tracking.driver.logisticsProfile.vehicleNumber}`
                : null,
            }
          : null,

        location: {
          current:
            tracking.currentLat && tracking.currentLng
              ? { lat: tracking.currentLat, lng: tracking.currentLng }
              : null,
          destination:
            tracking.deliveryLat && tracking.deliveryLng
              ? { lat: tracking.deliveryLat, lng: tracking.deliveryLng }
              : null,
          lastUpdate: tracking.lastLocationUpdate,
        },

        updates: tracking.updates.map((u) => ({
          lat: u.latitude,
          lng: u.longitude,
          status: u.status,
          timestamp: u.timestamp,
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
