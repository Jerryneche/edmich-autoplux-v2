import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getAdminUser(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (authUser?.role === "ADMIN") return authUser;

  const session = await getServerSession(authOptions);
  if (session?.user?.role === "ADMIN") {
    return { id: session.user.id, role: "ADMIN" };
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized", message: "Admin access required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const roleFilter = searchParams.get("role");

    const where: Record<string, unknown> = {};

    // Role filter
    if (roleFilter && ["BUYER", "SUPPLIER", "MECHANIC", "LOGISTICS", "ADMIN"].includes(roleFilter)) {
      where.role = roleFilter;
    }

    // Status filter
    if (statusFilter === "PENDING" || statusFilter === "pending") {
      where.emailVerified = null;
    } else if (statusFilter === "SUSPENDED" || statusFilter === "suspended") {
      where.onboardingStatus = "SUSPENDED";
    }

    const [users, roleCounts] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          image: true,
          emailVerified: true,
          onboardingStatus: true,
          createdAt: true,
          updatedAt: true,
          isGoogleAuth: true,
          hasCompletedOnboarding: true,
          // Include role-specific profiles
          supplierProfile: {
            select: {
              id: true,
              businessName: true,
              city: true,
              state: true,
              verified: true,
              approved: true,
            },
          },
          mechanicProfile: {
            select: {
              id: true,
              businessName: true,
              specialization: true,
              city: true,
              state: true,
              verified: true,
            },
          },
          logisticsProfile: {
            select: {
              id: true,
              companyName: true,
              city: true,
              state: true,
              verified: true,
            },
          },
          // Stats
          _count: {
            select: {
              orders: true,
              reviews: true,
              bookings: true,
            },
          },
          wallet: {
            select: { balance: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.groupBy({
        by: ["role"],
        _count: { id: true },
      }),
    ]);

    // Build role counts
    const roles: Record<string, number> = {};
    let total = 0;
    for (const group of roleCounts) {
      roles[group.role] = group._count.id;
      total += group._count.id;
    }

    // Format users with profile and stats
    const formattedUsers = users.map((user) => {
      // Determine profile based on role
      let profile = null;
      if (user.role === "SUPPLIER" && user.supplierProfile) {
        profile = user.supplierProfile;
      } else if (user.role === "MECHANIC" && user.mechanicProfile) {
        profile = user.mechanicProfile;
      } else if (user.role === "LOGISTICS" && user.logisticsProfile) {
        profile = user.logisticsProfile;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        image: user.image,
        verified: !!user.emailVerified,
        emailVerified: !!user.emailVerified,
        status: user.emailVerified ? "ACTIVE" : "PENDING",
        isGoogleAuth: user.isGoogleAuth,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile,
        stats: {
          totalOrders: user._count.orders,
          totalReviews: user._count.reviews,
          totalBookings: user._count.bookings,
          walletBalance: user.wallet?.balance || 0,
        },
      };
    });

    return NextResponse.json({
      users: formattedUsers.length ? formattedUsers : [],
      total,
      buyers: roles["BUYER"] || 0,
      suppliers: roles["SUPPLIER"] || 0,
      mechanics: roles["MECHANIC"] || 0,
      logistics: roles["LOGISTICS"] || 0,
      admins: roles["ADMIN"] || 0,
    });
  } catch (error) {
    console.error("[ADMIN-USERS-GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized", message: "Admin access required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "Validation error", message: "User ID required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return NextResponse.json(
        { error: "Not found", message: `User with ID ${userId} not found` },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { role, verified, status } = body;

    const updateData: Record<string, unknown> = {};

    if (role && ["BUYER", "SUPPLIER", "MECHANIC", "LOGISTICS", "ADMIN"].includes(role)) {
      updateData.role = role;
    }

    if (typeof verified === "boolean") {
      updateData.emailVerified = verified ? new Date() : null;
    }

    if (status === "SUSPENDED") {
      updateData.onboardingStatus = "SUSPENDED";
    } else if (status === "ACTIVE") {
      updateData.onboardingStatus = "COMPLETED";
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Validation error", message: "No valid fields to update" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        onboardingStatus: true,
        updatedAt: true,
      },
    });

    console.log(`[ADMIN-USERS] User ${userId} updated by admin ${admin.id}`, updateData);

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user.id,
        role: user.role,
        verified: !!user.emailVerified,
        status: user.emailVerified ? "ACTIVE" : "PENDING",
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("[ADMIN-USERS-PATCH] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to update user" },
      { status: 500 }
    );
  }
}
