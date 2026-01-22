import { NextRequest, NextResponse } from "next/server";
import { pushNotificationService } from "@/services/push-notification.service";
import { getAuthUser } from "@/lib/auth-api";

/**
 * POST /api/notifications/test
 * Send a test push notification to the authenticated user
 * 
 * Useful for:
 * - Testing that device token registration is working
 * - Verifying push notification service is configured correctly
 * - Debugging issues with notifications
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, message, type } = body;

    // Use provided title/message or defaults
    const notificationTitle = title || "Test Notification";
    const notificationMessage =
      message || "This is a test push notification from your backend";
    const notificationType = type || "general";

    console.log(
      `Sending test notification to user ${user.id}: "${notificationTitle}"`
    );

    await pushNotificationService.notifyUser(user.id, {
      title: notificationTitle,
      body: notificationMessage,
      data: {
        type: notificationType,
        isTest: true,
        sentAt: new Date().toISOString(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Test notification sent successfully",
        details: {
          userId: user.id,
          title: notificationTitle,
          body: notificationMessage,
          type: notificationType,
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
