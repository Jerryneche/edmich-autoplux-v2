import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Configure VAPID credentials
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:support@edmich.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/**
 * Web Push Notification Service
 * Sends browser/PWA push notifications via the Web Push Protocol (VAPID)
 */
export const webPushService = {
  /**
   * Send a web push notification to all of a user's subscribed devices
   */
  async sendToUser(
    userId: string,
    payload: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      url?: string;
      tag?: string;
      data?: Record<string, any>;
    }
  ) {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.warn("[WEB-PUSH] VAPID keys not configured, skipping");
      return [];
    }

    try {
      const subscriptions = await prisma.webPushSubscription.findMany({
        where: {
          userId,
          isActive: true,
        },
      });

      if (subscriptions.length === 0) {
        console.log(`[WEB-PUSH] No active subscriptions for user ${userId}`);
        return [];
      }

      const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || "/logo 192.png",
        badge: payload.badge || "/logo 192.png",
        url: payload.url || "/notifications",
        tag: payload.tag || `edmich-${Date.now()}`,
        data: payload.data || {},
      });

      const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              notificationPayload,
              {
                TTL: 24 * 60 * 60, // 24 hours
                urgency: "high",
              }
            );
            return { subscriptionId: sub.id, success: true };
          } catch (error: any) {
            // If subscription is expired or invalid (410 Gone, 404 Not Found)
            if (error.statusCode === 410 || error.statusCode === 404) {
              console.log(
                `[WEB-PUSH] Subscription expired, removing: ${sub.id}`
              );
              await prisma.webPushSubscription.delete({
                where: { id: sub.id },
              }).catch(() => {}); // Ignore if already deleted
            } else {
              console.error(
                `[WEB-PUSH] Error sending to subscription ${sub.id}:`,
                error.statusCode || error.message
              );
            }
            return { subscriptionId: sub.id, success: false, error: error.message };
          }
        })
      );

      const successCount = results.filter(
        (r) => r.status === "fulfilled" && (r.value as any).success
      ).length;

      console.log(
        `[WEB-PUSH] Sent ${successCount}/${subscriptions.length} to user ${userId}`
      );

      return results;
    } catch (error) {
      console.error("[WEB-PUSH] Failed to send to user:", error);
      return [];
    }
  },

  /**
   * Send a web push notification to multiple users
   */
  async sendToUsers(
    userIds: string[],
    payload: {
      title: string;
      body: string;
      icon?: string;
      url?: string;
      tag?: string;
      data?: Record<string, any>;
    }
  ) {
    const results = await Promise.allSettled(
      userIds.map((userId) => this.sendToUser(userId, payload))
    );
    return results;
  },

  /**
   * Send a test notification to verify a subscription works
   */
  async sendTest(userId: string) {
    return this.sendToUser(userId, {
      title: "EDMICH AutoPlux",
      body: "Push notifications are working! 🎉",
      url: "/notifications",
      tag: "test-notification",
    });
  },
};
