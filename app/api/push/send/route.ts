import { NextRequest, NextResponse } from "next/server";
import { webPushService } from "@/services/web-push.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/push/send
 * Send a push notification to a specific user (admin only)
 *
 * Body:
 * {
 *   userId: string,
 *   title: string,
 *   body: string,
 *   url?: string,
 *   tag?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can send push notifications to other users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, title, body: messageBody, url, tag } = body;

    if (!userId || !title || !messageBody) {
      return NextResponse.json(
        { error: "userId, title, and body are required" },
        { status: 400 }
      );
    }

    const results = await webPushService.sendToUser(userId, {
      title,
      body: messageBody,
      url: url || "/notifications",
      tag: tag || `admin-push-${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      message: "Push notification sent",
      results,
    });
  } catch (error: any) {
    console.error("[PUSH] Error sending push notification:", error);
    return NextResponse.json(
      { error: "Failed to send push notification" },
      { status: 500 }
    );
  }
}
