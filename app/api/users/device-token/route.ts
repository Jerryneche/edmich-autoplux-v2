import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";

/**
 * POST /api/users/device-token
 * Register or update a device token for push notifications
 * 
 * Required headers:
 * - Authorization: Bearer TOKEN
 * 
 * Body:
 * {
 *   deviceToken: string (Expo push token),
 *   platform: "ios" | "android",
 *   deviceName?: string (optional, e.g., "iPhone 12", "Samsung Galaxy")
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deviceToken, platform, deviceName } = await request.json();

    // Validation
    if (!deviceToken || !platform) {
      return NextResponse.json(
        { error: "deviceToken and platform are required" },
        { status: 400 }
      );
    }

    if (!["ios", "android"].includes(platform)) {
      return NextResponse.json(
        { error: 'platform must be "ios" or "android"' },
        { status: 400 }
      );
    }

    // Upsert device token (create or update if already exists)
    const token = await prisma.deviceToken.upsert({
      where: {
        userId_token: {
          userId: user.id,
          token: deviceToken,
        },
      },
      update: {
        isActive: true,
        platform,
        deviceName,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        token: deviceToken,
        platform,
        deviceName,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Device token registered successfully",
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error registering device token:", error);
    return NextResponse.json(
      { error: "Failed to register device token" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/device-token?token=DEVICE_TOKEN
 * Unregister a device token (useful when user logs out on a device)
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "token parameter is required" },
        { status: 400 }
      );
    }

    const deviceToken = await prisma.deviceToken.findFirst({
      where: {
        userId: user.id,
        token,
      },
    });

    if (!deviceToken) {
      return NextResponse.json(
        { error: "Device token not found" },
        { status: 404 }
      );
    }

    await prisma.deviceToken.delete({
      where: { id: deviceToken.id },
    });

    return NextResponse.json(
      { success: true, message: "Device token unregistered" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error unregistering device token:", error);
    return NextResponse.json(
      { error: "Failed to unregister device token" },
      { status: 500 }
    );
  }
}
