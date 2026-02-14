import { NextRequest, NextResponse } from "next/server";
import { pushNotificationService } from "@/services/push-notification.service";
import { webPushService } from "@/services/web-push.service";
import { getAuthUser } from "@/lib/auth-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/notifications/test
 * Send a test push notification to the authenticated user
 * Sends via both Expo Push (native) and Web Push (PWA/browser)
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

    const body = await request.json().catch(() => ({}));
    const { title, message, type } = body;

    const notificationTitle = title || "Test Notification";
    const notificationMessage =
      message || "This is a test push notification from EDMICH AutoPlux";
    const notificationType = type || "general";

    console.log(
      `Sending test notification to user ${userId}: "${notificationTitle}"`
    );

    // Send via Expo Push (native mobile)
    const expoResult = await pushNotificationService
      .notifyUser(userId, {
        title: notificationTitle,
        body: notificationMessage,
        data: {
          type: notificationType,
          isTest: true,
          sentAt: new Date().toISOString(),
        },
      })
      .catch((e: any) => ({ error: e.message }));

    // Send via Web Push (PWA / browser)
    const webPushResult = await webPushService
      .sendToUser(userId, {
        title: notificationTitle,
        body: notificationMessage,
        url: "/notifications",
        tag: "test-notification",
        data: {
          type: notificationType,
          isTest: true,
          sentAt: new Date().toISOString(),
        },
      })
      .catch((e: any) => ({ error: e.message }));

    return NextResponse.json(
      {
        success: true,
        message: "Test notification sent via both channels",
        details: {
          userId,
          title: notificationTitle,
          body: notificationMessage,
          expo: expoResult,
          webPush: webPushResult,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      {
        error: "Failed to send test notification",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
