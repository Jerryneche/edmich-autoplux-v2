// app/tracking/live/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Find tracking by order ID
    const tracking = await prisma.orderTracking.findUnique({
      where: {
        orderId: id,
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
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            image: true,
          },
        },
        updates: {
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
        id: tracking.id,
        status: tracking.status,
        currentLat: tracking.currentLat,
        currentLng: tracking.currentLng,
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
              id: tracking.driver.id,
              name: tracking.driver.name || "Driver",
              phone: tracking.driver.phone || null,
              email: tracking.driver.email,
              image: tracking.driver.image,
            }
          : null,

        currentLocation: {
          lat: tracking.currentLat,
          lng: tracking.currentLng,
          lastUpdated: tracking.lastLocationUpdate,
        },

        updates: tracking.updates.map((update) => ({
          id: update.id,
          latitude: update.latitude,
          longitude: update.longitude,
          status: update.status,
          timestamp: update.timestamp,
        })),
      },
    });
  } catch (error: unknown) {
    console.error("Live tracking error:", error);
    return NextResponse.json(
      { error: "Failed to load tracking" },
      { status: 500 }
    );
  }
}
