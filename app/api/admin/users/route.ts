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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    let where: any = {};

    if (statusFilter === "flagged") {
      where.banned = true;
    } else if (statusFilter === "pending") {
      where.emailVerified = null;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        banned: true,
        createdAt: true,
        image: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      status: statusFilter,
      users,
    });
  } catch (error) {
    console.error("[ADMIN-USERS-GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    const { role, verified, banned } = await request.json();

    const updateData: any = {};

    if (role && ["BUYER", "SUPPLIER", "MECHANIC", "LOGISTICS", "ADMIN"].includes(role)) {
      updateData.role = role;
    }

    if (typeof verified === "boolean") {
      updateData.emailVerified = verified ? new Date() : null;
    }

    if (typeof banned === "boolean") {
      updateData.banned = banned;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
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
        banned: true,
      },
    });

    // Log action
    console.log(
      `[ADMIN-USERS] User ${userId} updated by admin ${admin.id}`,
      updateData
    );

    return NextResponse.json({
      success: true,
      message: "User updated",
      user,
    });
  } catch (error) {
    console.error("[ADMIN-USERS-PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
