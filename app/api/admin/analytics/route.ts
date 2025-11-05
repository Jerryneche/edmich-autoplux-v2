import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "DELIVERED" },
    });

    const totalOrders = await prisma.order.count();

    const totalBookings = await prisma.booking.count();

    const totalProducts = await prisma.product.count();

    const totalSuppliers = await prisma.supplierProfile.count();

    const pendingSuppliers = await prisma.supplierProfile.count({
      where: { verified: false },
    });

    // Mock chart data - replace with real query
    const chartData = [
      { month: "Jan", revenue: 4000 },
      { month: "Feb", revenue: 3000 },
      { month: "Mar", revenue: 5000 },
      { month: "Apr", revenue: 4500 },
      { month: "May", revenue: 6000 },
      { month: "Jun", revenue: 5500 },
    ];

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
      totalBookings,
      totalProducts,
      totalSuppliers,
      pendingSuppliers,
      chartData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
