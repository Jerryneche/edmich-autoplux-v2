// app/api/dashboard/stats/route.ts - Dashboard Stats API (Matches your Prisma schema)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.substring(7);
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let stats: Record<string, any> = {};

    switch (user.role) {
      case "SUPPLIER": {
        // Get supplier profile first
        const supplierProfile = await prisma.supplierProfile.findUnique({
          where: { userId: user.userId },
        });

        if (!supplierProfile) {
          return NextResponse.json({
            totalProducts: 0,
            totalOrders: 0,
            pendingOrders: 0,
            totalRevenue: 0,
          });
        }

        // Count products for this supplier
        const totalProducts = await prisma.product.count({
          where: { supplierId: supplierProfile.id },
        });

        // Count orders containing this supplier's products
        const totalOrders = await prisma.order.count({
          where: {
            items: {
              some: {
                product: { supplierId: supplierProfile.id },
              },
            },
          },
        });

        // Count pending orders
        const pendingOrders = await prisma.order.count({
          where: {
            status: "PENDING",
            items: {
              some: {
                product: { supplierId: supplierProfile.id },
              },
            },
          },
        });

        // Calculate revenue - sum of order item prices for delivered orders
        const orderItems = await prisma.orderItem.findMany({
          where: {
            product: { supplierId: supplierProfile.id },
            order: {
              status: { in: ["DELIVERED", "COMPLETED"] },
            },
          },
          select: {
            price: true,
            quantity: true,
          },
        });

        const totalRevenue = orderItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        stats = {
          totalProducts,
          totalOrders,
          pendingOrders,
          totalRevenue,
        };
        break;
      }

      case "MECHANIC": {
        // Get mechanic profile
        const mechanicProfile = await prisma.mechanicProfile.findUnique({
          where: { userId: user.userId },
        });

        if (!mechanicProfile) {
          return NextResponse.json({
            totalBookings: 0,
            completedJobs: 0,
            pendingBookings: 0,
            totalRevenue: 0,
            rating: 0,
          });
        }

        // Count mechanic bookings
        const totalBookings = await prisma.mechanicBooking.count({
          where: { mechanicId: mechanicProfile.id },
        });

        const completedJobs = await prisma.mechanicBooking.count({
          where: {
            mechanicId: mechanicProfile.id,
            status: "COMPLETED",
          },
        });

        const pendingBookings = await prisma.mechanicBooking.count({
          where: {
            mechanicId: mechanicProfile.id,
            status: "PENDING",
          },
        });

        // Calculate earnings from completed bookings
        const completedBookings = await prisma.mechanicBooking.findMany({
          where: {
            mechanicId: mechanicProfile.id,
            status: "COMPLETED",
          },
          select: {
            estimatedPrice: true,
          },
        });

        const totalRevenue = completedBookings.reduce(
          (sum, booking) => sum + (booking.estimatedPrice || 0),
          0
        );

        stats = {
          totalBookings,
          completedJobs,
          pendingBookings,
          totalRevenue,
          rating: mechanicProfile.rating || 0,
        };
        break;
      }

      case "LOGISTICS": {
        // Get logistics profile
        const logisticsProfile = await prisma.logisticsProfile.findUnique({
          where: { userId: user.userId },
        });

        if (!logisticsProfile) {
          return NextResponse.json({
            totalDeliveries: 0,
            activeDeliveries: 0,
            completedDeliveries: 0,
            totalRevenue: 0,
            rating: 0,
          });
        }

        // Count logistics bookings
        const totalDeliveries = await prisma.logisticsBooking.count({
          where: { driverId: logisticsProfile.id },
        });

        const activeDeliveries = await prisma.logisticsBooking.count({
          where: {
            driverId: logisticsProfile.id,
            status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] },
          },
        });

        const completedDeliveries = await prisma.logisticsBooking.count({
          where: {
            driverId: logisticsProfile.id,
            status: "COMPLETED",
          },
        });

        // Calculate earnings from completed deliveries
        const completedBookings = await prisma.logisticsBooking.findMany({
          where: {
            driverId: logisticsProfile.id,
            status: "COMPLETED",
          },
          select: {
            estimatedPrice: true,
          },
        });

        const totalRevenue = completedBookings.reduce(
          (sum, booking) => sum + (booking.estimatedPrice || 0),
          0
        );

        stats = {
          totalDeliveries,
          activeDeliveries,
          completedDeliveries,
          totalRevenue,
          rating: logisticsProfile.rating || 0,
        };
        break;
      }

      default: {
        // BUYER stats
        const totalOrders = await prisma.order.count({
          where: { userId: user.userId },
        });

        const activeOrders = await prisma.order.count({
          where: {
            userId: user.userId,
            status: { in: ["PENDING", "CONFIRMED", "SHIPPED"] },
          },
        });

        // Count mechanic bookings by this user
        const mechanicBookings = await prisma.mechanicBooking.count({
          where: { userId: user.userId },
        });

        // Count logistics bookings by this user
        const logisticsBookings = await prisma.logisticsBooking.count({
          where: { userId: user.userId },
        });

        stats = {
          totalOrders,
          activeOrders,
          totalBookings: mechanicBookings + logisticsBookings,
          mechanicBookings,
          logisticsBookings,
        };
      }
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
