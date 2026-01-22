import axios from "axios";
import { prisma } from "@/lib/prisma";

const EXPO_PUSH_API = "https://exp.host/--/api/v2/push/send";

/**
 * Push Notification Service
 * Handles sending push notifications via Expo to registered devices
 */
export const pushNotificationService = {
  /**
   * Send push notification to a single user
   * @param userId - The user ID to send notification to
   * @param notification - Notification object with title, body, and optional data
   */
  async notifyUser(
    userId: string,
    notification: {
      title: string;
      body: string;
      data?: Record<string, any>;
      sound?: string;
    }
  ) {
    try {
      // Get all active device tokens for the user
      const deviceTokens = await prisma.deviceToken.findMany({
        where: {
          userId,
          isActive: true,
        },
      });

      if (deviceTokens.length === 0) {
        console.log(`No active device tokens found for user ${userId}`);
        return [];
      }

      // Prepare messages for Expo Push API
      const expoPushMessages = deviceTokens.map((dt) => ({
        to: dt.token,
        sound: notification.sound || "default",
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        ttl: 24 * 60 * 60, // 24 hours
        priority: "high",
        badge: 1,
      }));

      console.log(
        `Sending ${expoPushMessages.length} push notification(s) to user ${userId}`
      );

      // Send in batches (Expo recommends max 100 per request)
      const results = [];
      for (let i = 0; i < expoPushMessages.length; i += 100) {
        const batch = expoPushMessages.slice(i, i + 100);
        try {
          const response = await axios.post(EXPO_PUSH_API, batch);
          results.push(response.data);
          console.log(
            `Batch ${Math.floor(i / 100) + 1} sent successfully`
          );
        } catch (error) {
          console.error(`Error sending batch ${Math.floor(i / 100) + 1}:`, error);
          // Continue with next batch even if one fails
        }
      }

      return results;
    } catch (error) {
      console.error("Failed to send push notification:", error);
      throw error;
    }
  },

  /**
   * Send push notification to multiple users
   * @param userIds - Array of user IDs to notify
   * @param notification - Notification object
   */
  async notifyUsers(
    userIds: string[],
    notification: {
      title: string;
      body: string;
      data?: Record<string, any>;
    }
  ) {
    const results = await Promise.allSettled(
      userIds.map((userId) => this.notifyUser(userId, notification))
    );
    return results;
  },

  /**
   * Order Status Notifications
   */
  async notifyOrderPlaced(order: any) {
    try {
      // Notify supplier about new order
      await this.notifyUser(order.supplierId, {
        title: "New Order",
        body: `New order #${order.id} received for ₦${order.total?.toLocaleString()}`,
        data: {
          type: "ORDER",
          orderId: order.id,
          link: `/shop`,
        },
      });
    } catch (error) {
      console.error("Error notifying order placed:", error);
    }
  },

  async notifyOrderConfirmed(order: any) {
    try {
      // Notify buyer that order is confirmed
      await this.notifyUser(order.buyerId, {
        title: "Order Confirmed",
        body: `Your order #${order.id} has been confirmed by the supplier`,
        data: {
          type: "ORDER_STATUS_UPDATED",
          orderId: order.id,
          status: "CONFIRMED",
          link: `/cart`,
        },
      });
    } catch (error) {
      console.error("Error notifying order confirmed:", error);
    }
  },

  async notifyOrderShipped(order: any, trackingId?: string) {
    try {
      // Notify buyer that order has shipped
      await this.notifyUser(order.buyerId, {
        title: "Order Shipped",
        body: `Your order #${order.id} has been shipped${
          trackingId ? ` (Tracking: ${trackingId})` : ""
        }`,
        data: {
          type: "ORDER_STATUS_UPDATED",
          orderId: order.id,
          status: "SHIPPED",
          trackingId,
          link: `/tracking/${trackingId || order.id}`,
        },
      });
    } catch (error) {
      console.error("Error notifying order shipped:", error);
    }
  },

  async notifyOrderDelivered(order: any) {
    try {
      // Notify buyer that order has been delivered
      await this.notifyUser(order.buyerId, {
        title: "Order Delivered",
        body: `Your order #${order.id} has been delivered! Thank you for your purchase.`,
        data: {
          type: "ORDER_STATUS_UPDATED",
          orderId: order.id,
          status: "DELIVERED",
          link: `/tracking/${order.id}`,
        },
      });
    } catch (error) {
      console.error("Error notifying order delivered:", error);
    }
  },

  async notifyOrderCancelled(order: any, reason?: string) {
    try {
      // Notify buyer that order was cancelled
      await this.notifyUser(order.buyerId, {
        title: "Order Cancelled",
        body: `Your order #${order.id} has been cancelled${
          reason ? `: ${reason}` : ""
        }`,
        data: {
          type: "ORDER_STATUS_UPDATED",
          orderId: order.id,
          status: "CANCELLED",
          link: `/cart`,
        },
      });
    } catch (error) {
      console.error("Error notifying order cancelled:", error);
    }
  },

  /**
   * Payment Notifications
   */
  async notifyPaymentSuccess(order: any, amount: number) {
    try {
      // Notify buyer of successful payment
      await this.notifyUser(order.buyerId, {
        title: "Payment Successful",
        body: `Payment of ₦${amount.toLocaleString()} confirmed for order #${order.id}`,
        data: {
          type: "PAYMENT",
          orderId: order.id,
          amount,
          link: `/cart`,
        },
      });
    } catch (error) {
      console.error("Error notifying payment success:", error);
    }
  },

  async notifyPaymentFailed(order: any, reason?: string) {
    try {
      // Notify buyer of failed payment
      await this.notifyUser(order.buyerId, {
        title: "Payment Failed",
        body: `Payment for order #${order.id} failed${
          reason ? `: ${reason}` : ". Please try again."
        }`,
        data: {
          type: "PAYMENT",
          orderId: order.id,
          status: "FAILED",
          link: `/checkout?orderId=${order.id}`,
        },
      });
    } catch (error) {
      console.error("Error notifying payment failed:", error);
    }
  },

  /**
   * Product Notifications
   */
  async notifyProductApproved(product: any) {
    try {
      // Notify supplier that product was approved
      await this.notifyUser(product.supplierId, {
        title: "Product Approved",
        body: `Your product "${product.name}" has been approved and is now live!`,
        data: {
          type: "PRODUCT",
          productId: product.id,
          status: "APPROVED",
          link: `/products`,
        },
      });
    } catch (error) {
      console.error("Error notifying product approved:", error);
    }
  },

  async notifyProductRejected(
    product: any,
    reason?: string
  ) {
    try {
      // Notify supplier that product was rejected
      await this.notifyUser(product.supplierId, {
        title: "Product Rejected",
        body: `Your product "${product.name}" was not approved${
          reason ? `: ${reason}` : ""
        }`,
        data: {
          type: "PRODUCT",
          productId: product.id,
          status: "REJECTED",
          link: `/products`,
        },
      });
    } catch (error) {
      console.error("Error notifying product rejected:", error);
    }
  },

  async notifyProductOutOfStock(productId: string, wishedUsers: string[]) {
    try {
      // Notify users who wishlisted this product that it's out of stock
      if (wishedUsers.length > 0) {
        await this.notifyUsers(wishedUsers, {
          title: "Out of Stock",
          body: "A product you wishlisted is now out of stock",
          data: {
            type: "PRODUCT",
            productId,
            status: "OUT_OF_STOCK",
            link: `/products`,
          },
        });
      }
    } catch (error) {
      console.error("Error notifying product out of stock:", error);
    }
  },

  async notifyProductInStock(productId: string, wishedUsers: string[]) {
    try {
      // Notify users who wishlisted this product that it's back in stock
      if (wishedUsers.length > 0) {
        await this.notifyUsers(wishedUsers, {
          title: "Back in Stock",
          body: "A product you wishlisted is back in stock!",
          data: {
            type: "PRODUCT",
            productId,
            status: "IN_STOCK",
            link: `/products`,
          },
        });
      }
    } catch (error) {
      console.error("Error notifying product in stock:", error);
    }
  },

  /**
   * Delivery Notifications
   */
  async notifyDeliveryAssigned(
    orderId: string,
    buyerId: string,
    driverName: string
  ) {
    try {
      // Notify buyer that delivery driver has been assigned
      await this.notifyUser(buyerId, {
        title: "Delivery Assigned",
        body: `${driverName} has been assigned to deliver your order`,
        data: {
          type: "DELIVERY",
          orderId,
          status: "ASSIGNED",
          link: `/tracking/${orderId}`,
        },
      });
    } catch (error) {
      console.error("Error notifying delivery assigned:", error);
    }
  },

  async notifyDeliveryInProgress(orderId: string, buyerId: string) {
    try {
      // Notify buyer that delivery is in progress
      await this.notifyUser(buyerId, {
        title: "Out for Delivery",
        body: "Your order is on the way!",
        data: {
          type: "DELIVERY",
          orderId,
          status: "IN_PROGRESS",
          link: `/tracking/${orderId}`,
        },
      });
    } catch (error) {
      console.error("Error notifying delivery in progress:", error);
    }
  },

  async notifyDeliveryCompleted(orderId: string, buyerId: string) {
    try {
      // Notify buyer that delivery is complete
      await this.notifyUser(buyerId, {
        title: "Delivered",
        body: "Your order has been delivered successfully!",
        data: {
          type: "DELIVERY",
          orderId,
          status: "COMPLETED",
          link: `/tracking/${orderId}`,
        },
      });
    } catch (error) {
      console.error("Error notifying delivery completed:", error);
    }
  },

  /**
   * Booking Notifications
   */
  async notifyBookingConfirmed(
    userId: string,
    bookingId: string,
    serviceName: string
  ) {
    try {
      await this.notifyUser(userId, {
        title: "Booking Confirmed",
        body: `Your booking for ${serviceName} has been confirmed`,
        data: {
          type: "BOOKING",
          bookingId,
          status: "CONFIRMED",
          link: `/booking/mechanic/${bookingId}`,
        },
      });
    } catch (error) {
      console.error("Error notifying booking confirmed:", error);
    }
  },

  async notifyBookingCancelled(userId: string, bookingId: string, reason?: string) {
    try {
      await this.notifyUser(userId, {
        title: "Booking Cancelled",
        body: `Your booking #${bookingId} has been cancelled${
          reason ? `: ${reason}` : ""
        }`,
        data: {
          type: "BOOKING",
          bookingId,
          status: "CANCELLED",
          link: `/booking`,
        },
      });
    } catch (error) {
      console.error("Error notifying booking cancelled:", error);
    }
  },

  /**
   * Review/Rating Notifications
   */
  async notifyRatingReceived(userId: string, productId: string, rating: number) {
    try {
      await this.notifyUser(userId, {
        title: "New Review",
        body: `Someone rated your product ${rating} stars`,
        data: {
          type: "REVIEW",
          productId,
          rating,
          link: `/products`,
        },
      });
    } catch (error) {
      console.error("Error notifying rating received:", error);
    }
  },

  /**
   * Message Notifications
   */
  async notifyNewMessage(
    recipientId: string,
    senderId: string,
    messagePreview: string,
    senderName?: string
  ) {
    try {
      await this.notifyUser(recipientId, {
        title: `Message from ${senderName || "User"}`,
        body: messagePreview.substring(0, 100),
        data: {
          type: "SYSTEM",
          senderId,
          link: `/chat`,
        },
      });
    } catch (error) {
      console.error("Error notifying new message:", error);
    }
  },

  /**
   * Low Inventory Notifications (for suppliers)
   */
  async notifyLowInventory(supplierId: string, productId: string, productName: string, currentStock: number) {
    try {
      await this.notifyUser(supplierId, {
        title: "Low Inventory Alert",
        body: `"${productName}" stock is low (${currentStock} remaining)`,
        data: {
          type: "LOW_INVENTORY",
          productId,
          currentStock,
          link: `/products`,
        },
      });
    } catch (error) {
      console.error("Error notifying low inventory:", error);
    }
  },
};
