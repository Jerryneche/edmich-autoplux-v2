// app/components/PushNotificationManager.tsx
"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

/**
 * PushNotificationManager
 *
 * This component handles:
 * 1. Registering the service worker
 * 2. Requesting notification permission
 * 3. Subscribing to Web Push
 * 4. Sending the subscription to the backend
 *
 * It runs silently in the background with no UI.
 * Mounted in layout.tsx for all authenticated users.
 */
export default function PushNotificationManager() {
  const { data: session, status } = useSession();
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    if (hasRegistered.current) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!("PushManager" in window)) return;

    hasRegistered.current = true;

    registerPushNotifications();
  }, [status, session]);

  return null;
}

async function registerPushNotifications() {
  try {
    // Step 1: Register service worker
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    console.log("[PUSH] Service worker registered:", registration.scope);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    console.log("[PUSH] Service worker is ready");

    // Step 2: Check / request notification permission
    let permission = Notification.permission;

    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.log("[PUSH] Notification permission denied");
      return;
    }

    console.log("[PUSH] Notification permission granted");

    // Step 3: Get VAPID public key from server
    const vapidResponse = await fetch("/api/push/vapid-key");
    if (!vapidResponse.ok) {
      console.error("[PUSH] Failed to get VAPID key");
      return;
    }

    const { publicKey } = await vapidResponse.json();
    if (!publicKey) {
      console.error("[PUSH] VAPID public key is empty");
      return;
    }

    // Step 4: Subscribe to push notifications
    const existingSubscription =
      await registration.pushManager.getSubscription();

    let subscription = existingSubscription;

    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      console.log("[PUSH] New push subscription created");
    } else {
      console.log("[PUSH] Using existing push subscription");
    }

    // Step 5: Send subscription to backend
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
      }),
    });

    if (response.ok) {
      console.log("[PUSH] Subscription sent to backend successfully");
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error("[PUSH] Failed to send subscription to backend:", errorData);
    }
  } catch (error) {
    console.error("[PUSH] Error during push registration:", error);
  }
}

/**
 * Convert a base64 URL-encoded string to a Uint8Array
 * Required for the applicationServerKey parameter
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
