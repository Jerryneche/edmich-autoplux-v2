import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/push/subscribe
 * Register a Web Push subscription for the authenticated user
 *
 * Body:
 * {
 *   subscription: {
 *     endpoint: string,
 *     keys: {
 *       p256dh: string,
 *       auth: string
 *     }
 *   },
 *   userAgent?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Support both mobile JWT and web session auth
    let userId: string | null = null;

    const mobileUser = await getAuthUser(request);
    if (mobileUser) {
      userId = mobileUser.id;
    } else {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subscription, userAgent } = body;

    if (
      !subscription ||
      !subscription.endpoint ||
      !subscription.keys?.p256dh ||
      !subscription.keys?.auth
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid subscription. Must include endpoint, keys.p256dh, and keys.auth",
        },
        { status: 400 }
      );
    }

    // Upsert subscription (update if endpoint already exists)
    const webPushSub = await prisma.webPushSubscription.upsert({
      where: {
        endpoint: subscription.endpoint,
      },
      update: {
        userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent || null,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent || null,
        isActive: true,
      },
    });

    console.log(
      `[PUSH] Web Push subscription registered for user ${userId}: ${subscription.endpoint.substring(0, 50)}...`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Push subscription registered",
        subscriptionId: webPushSub.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[PUSH] Error registering subscription:", error);
    return NextResponse.json(
      { error: "Failed to register push subscription" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push/subscribe
 * Unregister a Web Push subscription
 *
 * Body:
 * {
 *   endpoint: string
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    let userId: string | null = null;

    const mobileUser = await getAuthUser(request);
    if (mobileUser) {
      userId = mobileUser.id;
    } else {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "endpoint is required" },
        { status: 400 }
      );
    }

    // Delete subscription for this user
    const deleted = await prisma.webPushSubscription.deleteMany({
      where: {
        userId,
        endpoint,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    console.log(`[PUSH] Web Push subscription removed for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: "Push subscription removed",
    });
  } catch (error: any) {
    console.error("[PUSH] Error removing subscription:", error);
    return NextResponse.json(
      { error: "Failed to remove push subscription" },
      { status: 500 }
    );
  }
}
