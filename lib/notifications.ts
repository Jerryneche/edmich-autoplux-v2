import { prisma } from "@/lib/prisma";

interface CreateNotificationParams {
  userId: string;
  type: "ORDER" | "BOOKING" | "PRODUCT" | "SYSTEM" | "PAYMENT" | "REVIEW";
  title: string;
  message: string;
  link?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link: link || null,
      },
    });
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

// Predefined notification templates
export const NotificationTemplates = {
  // Order notifications
  orderCreated: (orderId: string) => ({
    type: "ORDER" as const,
    title: "New Order Received",
    message: "You have received a new order",
    link: `/dashboard/supplier/orders/${orderId}`,
  }),

  orderConfirmed: (orderId: string) => ({
    type: "ORDER" as const,
    title: "Order Confirmed",
    message: "Your order has been confirmed by the supplier",
    link: `/dashboard/buyer/orders/${orderId}`,
  }),

  orderShipped: (orderId: string) => ({
    type: "ORDER" as const,
    title: "Order Shipped",
    message: "Your order is on the way!",
    link: `/dashboard/buyer/orders/${orderId}`,
  }),

  orderDelivered: (orderId: string) => ({
    type: "ORDER" as const,
    title: "Order Delivered",
    message: "Your order has been delivered",
    link: `/dashboard/buyer/orders/${orderId}`,
  }),

  // Booking notifications
  mechanicBookingCreated: (bookingId: string) => ({
    type: "BOOKING" as const,
    title: "New Service Booking",
    message: "You have a new mechanic service request",
    link: `/dashboard/mechanic/bookings/${bookingId}`,
  }),

  mechanicBookingConfirmed: (bookingId: string) => ({
    type: "BOOKING" as const,
    title: "Booking Confirmed",
    message: "Your mechanic booking has been confirmed",
    link: `/dashboard/buyer/bookings/mechanics/${bookingId}`,
  }),

  logisticsBookingCreated: (bookingId: string) => ({
    type: "BOOKING" as const,
    title: "New Delivery Request",
    message: "You have a new delivery request",
    link: `/dashboard/logistics/bookings/${bookingId}`,
  }),

  logisticsBookingConfirmed: (bookingId: string) => ({
    type: "BOOKING" as const,
    title: "Delivery Confirmed",
    message: "Your delivery has been confirmed",
    link: `/dashboard/buyer/bookings/logistics/${bookingId}`,
  }),

  // Product notifications
  productOutOfStock: (productName: string) => ({
    type: "PRODUCT" as const,
    title: "Product Out of Stock",
    message: `${productName} is now out of stock`,
    link: `/dashboard/supplier`,
  }),

  productLowStock: (productName: string, stock: number) => ({
    type: "PRODUCT" as const,
    title: "Low Stock Alert",
    message: `${productName} has only ${stock} units left`,
    link: `/dashboard/supplier`,
  }),

  // System notifications
  profileVerified: () => ({
    type: "SYSTEM" as const,
    title: "Profile Verified",
    message: "Your profile has been verified successfully",
  }),

  profileRejected: (reason: string) => ({
    type: "SYSTEM" as const,
    title: "Profile Verification Failed",
    message: `Your profile verification was rejected: ${reason}`,
  }),
};
