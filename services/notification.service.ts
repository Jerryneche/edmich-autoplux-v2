import { prisma } from "@/lib/prisma";
import { pushNotificationService } from "./push-notification.service";
import type { NotificationType } from "@prisma/client";

/**
 * In-App Notification Service
 * Creates database notifications that are displayed in the app's notification center
 */
export const notificationService = {
  /**
   * Create an in-app notification for a user
   */
  async createNotification(
    userId: string,
    {
      type,
      title,
      message,
      link,
    }: {
      type: NotificationType;
      title: string;
      message: string;
      link?: string;
    }
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          link,
          read: false,
        },
      });

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  },

  /**
   * Create notification and send push notification
   */
  async notifyUserWithPush(
    userId: string,
    {
      type,
      title,
      message,
      link,
      pushData,
    }: {
      type: NotificationType;
      title: string;
      message: string;
      link?: string;
      pushData?: Record<string, any>;
    }
  ) {
    try {
      // Create in-app notification
      const notification = await this.createNotification(userId, {
        type,
        title,
        message,
        link,
      });

      // Send push notification
      try {
        await pushNotificationService.notifyUser(userId, {
          title,
          body: message,
          data: {
            type: type.toString(),
            notificationId: notification.id,
            ...pushData,
          },
        });
      } catch (pushError) {
        console.error("Failed to send push notification:", pushError);
        // Don't fail the whole operation if push fails
      }

      return notification;
    } catch (error) {
      console.error("Error notifying user with push:", error);
      throw error;
    }
  },

  /**
   * Notify multiple users and send push notifications
   */
  async notifyUsersWithPush(
    userIds: string[],
    {
      type,
      title,
      message,
      link,
      pushData,
    }: {
      type: NotificationType;
      title: string;
      message: string;
      link?: string;
      pushData?: Record<string, any>;
    }
  ) {
    const results = await Promise.allSettled(
      userIds.map((userId) =>
        this.notifyUserWithPush(userId, {
          type,
          title,
          message,
          link,
          pushData,
        })
      )
    );

    return results;
  },

  // ===== ORDER NOTIFICATIONS =====

  async notifyOrderPlaced(order: any) {
    // Notify supplier
    await this.notifyUserWithPush(order.supplierId, {
      type: "ORDER" as NotificationType,
      title: "New Order",
      message: `New order #${order.id} received for ₦${order.total?.toLocaleString()}`,
      link: `/order/${order.id}`,
      pushData: {
        orderId: order.id,
        type: "ORDER_PLACED",
      },
    });
  },

  async notifyOrderConfirmed(order: any) {
    // Notify buyer
    await this.notifyUserWithPush(order.buyerId, {
      type: "ORDER_STATUS_UPDATED" as NotificationType,
      title: "Order Confirmed",
      message: `Your order #${order.id} has been confirmed`,
      link: `/order/${order.id}`,
      pushData: {
        orderId: order.id,
        status: "CONFIRMED",
      },
    });
  },

  async notifyOrderShipped(order: any, trackingId?: string) {
    // Notify buyer
    await this.notifyUserWithPush(order.buyerId, {
      type: "ORDER_STATUS_UPDATED" as NotificationType,
      title: "Order Shipped",
      message: `Your order #${order.id} has been shipped${
        trackingId ? ` (Tracking: ${trackingId})` : ""
      }`,
      link: `/order/${order.id}`,
      pushData: {
        orderId: order.id,
        status: "SHIPPED",
        trackingId,
      },
    });
  },

  async notifyOrderDelivered(order: any) {
    // Notify buyer
    await this.notifyUserWithPush(order.buyerId, {
      type: "DELIVERY" as NotificationType,
      title: "Order Delivered",
      message: `Your order #${order.id} has been delivered!`,
      link: `/order/${order.id}`,
      pushData: {
        orderId: order.id,
        status: "DELIVERED",
      },
    });
  },

  async notifyOrderCancelled(order: any, reason?: string) {
    // Notify buyer
    await this.notifyUserWithPush(order.buyerId, {
      type: "ORDER_STATUS_UPDATED" as NotificationType,
      title: "Order Cancelled",
      message: `Your order #${order.id} has been cancelled${
        reason ? `: ${reason}` : ""
      }`,
      link: `/order/${order.id}`,
      pushData: {
        orderId: order.id,
        status: "CANCELLED",
        reason,
      },
    });
  },

  // ===== PAYMENT NOTIFICATIONS =====

  async notifyPaymentSuccess(order: any, amount: number) {
    // Notify buyer
    await this.notifyUserWithPush(order.buyerId, {
      type: "PAYMENT" as NotificationType,
      title: "Payment Successful",
      message: `Payment of ₦${amount.toLocaleString()} confirmed for order #${order.id}`,
      link: `/order/${order.id}`,
      pushData: {
        orderId: order.id,
        amount,
        status: "SUCCESS",
      },
    });
  },

  async notifyPaymentFailed(order: any, reason?: string) {
    // Notify buyer
    await this.notifyUserWithPush(order.buyerId, {
      type: "PAYMENT" as NotificationType,
      title: "Payment Failed",
      message: `Payment for order #${order.id} failed${
        reason ? `: ${reason}` : ". Please try again."
      }`,
      link: `/checkout?orderId=${order.id}`,
      pushData: {
        orderId: order.id,
        status: "FAILED",
        reason,
      },
    });
  },

  // ===== PRODUCT NOTIFICATIONS =====

  async notifyProductApproved(product: any) {
    // Notify supplier
    await this.notifyUserWithPush(product.supplierId, {
      type: "PRODUCT" as NotificationType,
      title: "Product Approved",
      message: `Your product "${product.name}" has been approved and is now live!`,
      link: `/product/${product.id}`,
      pushData: {
        productId: product.id,
        status: "APPROVED",
      },
    });
  },

  async notifyProductRejected(product: any, reason?: string) {
    // Notify supplier
    await this.notifyUserWithPush(product.supplierId, {
      type: "PRODUCT" as NotificationType,
      title: "Product Rejected",
      message: `Your product "${product.name}" was not approved${
        reason ? `: ${reason}` : ""
      }`,
      link: `/product/${product.id}`,
      pushData: {
        productId: product.id,
        status: "REJECTED",
        reason,
      },
    });
  },

  async notifyProductOutOfStock(productId: string, wishedUsers: string[]) {
    // Notify users who wishlisted this product
    if (wishedUsers.length > 0) {
      await this.notifyUsersWithPush(wishedUsers, {
        type: "LOW_INVENTORY" as NotificationType,
        title: "Out of Stock",
        message: "A product you wishlisted is now out of stock",
        link: `/product/${productId}`,
        pushData: {
          productId,
          status: "OUT_OF_STOCK",
        },
      });
    }
  },

  async notifyProductInStock(productId: string, wishedUsers: string[]) {
    // Notify users who wishlisted this product
    if (wishedUsers.length > 0) {
      await this.notifyUsersWithPush(wishedUsers, {
        type: "PRODUCT" as NotificationType,
        title: "Back in Stock",
        message: "A product you wishlisted is back in stock!",
        link: `/product/${productId}`,
        pushData: {
          productId,
          status: "IN_STOCK",
        },
      });
    }
  },

  // ===== DELIVERY NOTIFICATIONS =====

  async notifyDeliveryAssigned(
    orderId: string,
    buyerId: string,
    driverName: string
  ) {
    // Notify buyer
    await this.notifyUserWithPush(buyerId, {
      type: "DELIVERY" as NotificationType,
      title: "Delivery Assigned",
      message: `${driverName} has been assigned to deliver your order`,
      link: `/order/${orderId}`,
      pushData: {
        orderId,
        status: "ASSIGNED",
        driverName,
      },
    });
  },

  async notifyDeliveryInProgress(orderId: string, buyerId: string) {
    // Notify buyer
    await this.notifyUserWithPush(buyerId, {
      type: "DELIVERY" as NotificationType,
      title: "Out for Delivery",
      message: "Your order is on the way!",
      link: `/order/${orderId}`,
      pushData: {
        orderId,
        status: "IN_PROGRESS",
      },
    });
  },

  async notifyDeliveryCompleted(orderId: string, buyerId: string) {
    // Notify buyer
    await this.notifyUserWithPush(buyerId, {
      type: "DELIVERY" as NotificationType,
      title: "Delivered",
      message: "Your order has been delivered successfully!",
      link: `/order/${orderId}`,
      pushData: {
        orderId,
        status: "COMPLETED",
      },
    });
  },

  // ===== BOOKING NOTIFICATIONS =====

  async notifyBookingConfirmed(
    userId: string,
    bookingId: string,
    serviceName: string
  ) {
    // Notify customer
    await this.notifyUserWithPush(userId, {
      type: "BOOKING" as NotificationType,
      title: "Booking Confirmed",
      message: `Your booking for ${serviceName} has been confirmed`,
      link: `/booking/${bookingId}`,
      pushData: {
        bookingId,
        status: "CONFIRMED",
        serviceName,
      },
    });
  },

  async notifyBookingCancelled(userId: string, bookingId: string, reason?: string) {
    // Notify customer
    await this.notifyUserWithPush(userId, {
      type: "BOOKING" as NotificationType,
      title: "Booking Cancelled",
      message: `Your booking #${bookingId} has been cancelled${
        reason ? `: ${reason}` : ""
      }`,
      link: `/bookings`,
      pushData: {
        bookingId,
        status: "CANCELLED",
        reason,
      },
    });
  },

  // ===== REVIEW/RATING NOTIFICATIONS =====

  async notifyRatingReceived(
    userId: string,
    productId: string,
    rating: number
  ) {
    // Notify product supplier
    await this.notifyUserWithPush(userId, {
      type: "REVIEW" as NotificationType,
      title: "New Review",
      message: `Someone rated your product ${rating} stars`,
      link: `/product/${productId}`,
      pushData: {
        productId,
        rating,
      },
    });
  },

  // ===== SYSTEM NOTIFICATIONS =====

  async notifyLowInventory(
    supplierId: string,
    productId: string,
    productName: string,
    currentStock: number
  ) {
    // Notify supplier about low inventory
    await this.notifyUserWithPush(supplierId, {
      type: "LOW_INVENTORY" as NotificationType,
      title: "Low Inventory Alert",
      message: `"${productName}" stock is low (${currentStock} remaining)`,
      link: `/product/${productId}`,
      pushData: {
        productId,
        currentStock,
      },
    });
  },
};
