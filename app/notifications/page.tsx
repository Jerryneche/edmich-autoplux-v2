"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  BellIcon,
  CheckIcon,
  ShoppingBagIcon,
  WrenchIcon,
  TruckIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

// Define the Notification type — this fixes ALL TypeScript errors
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Properly typed state — no more "never[]"!
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();

      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);

        // Auto-mark as read when the list is viewed so badges clear immediately
        const hasUnread = data.notifications.some((n: Notification) => !n.read);
        if (hasUnread) {
          await markAllAsRead(true);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async (silent?: boolean) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (!silent) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } else {
        // For the initial load, we also update local state to clear badges
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "order":
        return <ShoppingBagIcon className="h-6 w-6" />;
      case "booking":
        return <WrenchIcon className="h-6 w-6" />;
      case "delivery":
        return <TruckIcon className="h-6 w-6" />;
      case "payment":
        return <CreditCardIcon className="h-6 w-6" />;
      case "kyc":
        return <ShieldCheckIcon className="h-6 w-6" />;
      default:
        return <BellIcon className="h-6 w-6" />;
    }
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type.toLowerCase() === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {unreadCount} unread
                    </p>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
                  >
                    <CheckIcon className="h-5 w-5" />
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {["all", "order", "booking", "delivery", "payment", "kyc"].map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                        filter === type
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-16">
                <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  All caught up!
                </h3>
                <p className="text-gray-600">No notifications right now.</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex gap-4">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          !notification.read
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {getIcon(notification.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3
                            className={`font-semibold ${
                              !notification.read
                                ? "text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-500 ml-4">
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {notification.message}
                        </p>

                        <div className="flex gap-4 text-sm">
                          {notification.actionUrl && (
                            <button
                              onClick={() => {
                                markAsRead(notification.id);
                                router.push(notification.actionUrl!);
                              }}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View Details
                            </button>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-gray-600 hover:text-gray-700 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
