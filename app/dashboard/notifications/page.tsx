"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { BellIcon, CheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchNotifications();
  }, [status, filter, router]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const url =
        filter === "unread"
          ? "/api/notifications?unread=true&limit=50"
          : "/api/notifications?limit=50";

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success("Marked as read");
      }
    } catch (error) {
      toast.error("Failed to update notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      toast.error("Failed to update notifications");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const wasUnread =
          notifications.find((n) => n.id === id)?.read === false;
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success("Notification deleted");
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return "📦";
      case "BOOKING":
        return "🔧";
      case "PRODUCT":
        return "🛒";
      case "PAYMENT":
        return "💳";
      case "REVIEW":
        return "⭐";
      default:
        return "ℹ️";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "ORDER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "BOOKING":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "PRODUCT":
        return "bg-green-100 text-green-800 border-green-200";
      case "PAYMENT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "REVIEW":
        return "bg-pink-100 text-pink-800 border-pink-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading notifications...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      <Toaster position="top-center" />
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Notifications
            </h1>
            <p className="text-neutral-600">
              Stay updated with your activity
              {unreadCount > 0 && (
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </p>
          </div>

          {/* Filters & Actions */}
          <div className="bg-white rounded-2xl border-2 border-neutral-200 p-4 mb-6 flex items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  filter === "unread"
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-white/30 rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 transition-colors"
              >
                <CheckIcon className="h-5 w-5" />
                Mark All Read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-12 text-center">
                <BellIcon className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
                <p className="text-2xl font-bold text-neutral-900 mb-2">
                  {filter === "unread"
                    ? "No unread notifications"
                    : "No notifications yet"}
                </p>
                <p className="text-neutral-600">
                  {filter === "unread"
                    ? "You're all caught up!"
                    : "We'll notify you when something happens"}
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-2xl border-2 p-6 transition-all ${
                    !notification.read
                      ? "border-blue-300 shadow-lg"
                      : "border-neutral-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl border-2 ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-bold text-neutral-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="h-3 w-3 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                        )}
                      </div>

                      <p className="text-neutral-600 mb-3">
                        {notification.message}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-sm text-neutral-500">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true }
                          )}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {notification.link && (
                            <Link
                              href={notification.link}
                              onClick={() => {
                                if (!notification.read)
                                  markAsRead(notification.id);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                            >
                              View Details
                            </Link>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200 transition-colors text-sm flex items-center gap-2"
                            >
                              <CheckIcon className="h-4 w-4" />
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors text-sm flex items-center gap-2"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
