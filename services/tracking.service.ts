import { prisma } from "@/lib/prisma";
import { notificationService } from "./notification.service";
import type { BookingStatus, LogisticsBooking, LogisticsProfile, User } from "@prisma/client";

/**
 * Tracking Service - Handles all tracking logic for orders, mechanics, and logistics
 */

// Type definitions
interface TrackingEvent {
  id: string;
  status: string;
  location: string | null;
  message: string | null;
  timestamp: Date;
}

interface LogisticsDeliveryTrackingResponse {
  id: string;
  deliveryId: string;
  status: string;
  currentLocation: string | null;
  estimatedDeliveryDate: Date | null;
  assignedProvider: {
    id: string;
    userId: string;
    companyName: string;
    phone: string;
    vehicleType: string;
    rating: number;
    completedDeliveries: number;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  } | null;
  events: TrackingEvent[];
}

// ===========================
// ORDER TRACKING
// ===========================

export const orderTrackingService = {
  /**
   * Get order tracking by orderId
   */
  async getOrderTracking(orderId: string) {
    const tracking = await prisma.orderTracking.findUnique({
      where: { orderId },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            logisticsProfile: {
              select: {
                rating: true,
                completedDeliveries: true,
                vehicleType: true,
              },
            },
          },
        },
        updates: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    return tracking;
  },

  /**
   * Create order tracking when order is confirmed
   */
  async createOrderTracking(orderId: string) {
    const tracking = await prisma.orderTracking.create({
      data: {
        orderId,
        status: "PENDING",
      },
      include: {
        updates: true,
      },
    });

    // Create initial tracking update
    await prisma.trackingUpdate.create({
      data: {
        trackingId: tracking.id,
        latitude: 0,
        longitude: 0,
        status: "PENDING",
      },
    });

    return tracking;
  },

  /**
   * Assign logistics provider to order
   */
  async assignLogisticsProvider(orderId: string, logisticsProviderId: string) {
    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Verify logistics provider exists
    const provider = await prisma.user.findUnique({
      where: { id: logisticsProviderId },
      include: {
        logisticsProfile: true,
      },
    });

    if (!provider || !provider.logisticsProfile) {
      throw new Error("Logistics provider not found");
    }

    // Update tracking with the logistics provider (user) ID
    const tracking = await prisma.orderTracking.update({
      where: { orderId },
      data: {
        driverId: provider.id,
        status: "PENDING",
      },
      include: {
        driver: true,
        updates: true,
      },
    });

    // Create tracking update
    await prisma.trackingUpdate.create({
      data: {
        trackingId: tracking.id,
        latitude: 0,
        longitude: 0,
        status: "PENDING",
      },
    });

    // Send notification to customer
    await notificationService.createNotification(order.userId, {
      type: "DELIVERY",
      title: "Logistics Provider Assigned",
      message: `Your order has been assigned to ${provider.name}. They will be in touch soon.`,
      link: `/orders/${orderId}/tracking`,
    });

    return tracking;
  },

  /**
   * Update order tracking status
   */
  async updateOrderTrackingStatus(
    orderId: string,
    status: string,
    latitude?: number,
    longitude?: number,
    estimatedArrival?: string,
    message?: string
  ) {
    // Verify tracking exists
    const tracking = await prisma.orderTracking.findUnique({
      where: { orderId },
      include: { order: { include: { user: true } } },
    });

    if (!tracking) {
      throw new Error("Tracking not found");
    }

    // Validate status
    const validStatuses = [
      "PENDING",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "FAILED",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid tracking status");
    }

    // Update tracking
    const updated = await prisma.orderTracking.update({
      where: { orderId },
      data: {
        status,
        currentLat: latitude !== undefined ? latitude : tracking.currentLat,
        currentLng: longitude !== undefined ? longitude : tracking.currentLng,
        lastLocationUpdate: latitude !== undefined || longitude !== undefined ? new Date() : tracking.lastLocationUpdate,
        estimatedArrival: estimatedArrival || tracking.estimatedArrival,
        updatedAt: new Date(),
      },
      include: {
        updates: { orderBy: { timestamp: "desc" } },
        order: { include: { user: true } },
      },
    });

    // Create tracking update
    await prisma.trackingUpdate.create({
      data: {
        trackingId: updated.id,
        latitude: latitude || tracking.currentLat || 0,
        longitude: longitude || tracking.currentLng || 0,
        status,
      },
    });

    // Send notification to customer
    const notificationMessages: { [key: string]: string } = {
      PENDING: "Your order has been confirmed",
      IN_TRANSIT: "Your order is on its way to you",
      OUT_FOR_DELIVERY: "Your order will be delivered today",
      DELIVERED: "Your order has been delivered",
      FAILED: "There was an issue delivering your order",
    };

    await notificationService.createNotification(
      updated.order.user.id,
      {
        type: "DELIVERY",
        title: "Order Status Update",
        message: notificationMessages[status] || `Order status: ${status}`,
        link: `/orders/${orderId}/tracking`,
      }
    );

    // Update Order status if delivered
    if (status === "DELIVERED") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "DELIVERED" },
      });
    }

    return updated;
  },

  /**
   * Get order tracking history
   */
  async getOrderTrackingHistory(orderId: string, limit = 50, skip = 0) {
    const updates = await prisma.trackingUpdate.findMany({
      where: { tracking: { orderId } },
      orderBy: { timestamp: "desc" },
      take: limit,
      skip,
    });

    const total = await prisma.trackingUpdate.count({
      where: { tracking: { orderId } },
    });

    return { total, updates };
  },
};

// Mechanic booking tracking removed - models do not exist in schema

// ===========================
// LOGISTICS DELIVERY TRACKING
// ===========================

export const logisticsDeliveryTrackingService = {
  /**
   * Get logistics delivery tracking
   */
  async getLogisticsDeliveryTracking(
    deliveryId: string,
  ): Promise<LogisticsDeliveryTrackingResponse | null> {
    const booking = await prisma.logisticsBooking.findUnique({
      where: { id: deliveryId },
      include: {
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return null;
    }

    const response: LogisticsDeliveryTrackingResponse = {
      id: booking.id,
      deliveryId: booking.id,
      status: booking.status,
      currentLocation: booking.currentLocation,
      estimatedDeliveryDate: null,
      assignedProvider: booking.driver
        ? {
            id: booking.driver.id,
            userId: booking.driver.userId,
            companyName: booking.driver.companyName,
            phone: booking.driver.phone,
            vehicleType: booking.driver.vehicleType,
            rating: booking.driver.rating,
            completedDeliveries: booking.driver.completedDeliveries,
            user: booking.driver.user,
          }
        : null,
      events: [],
    };
    return response;
  },

  /**
   * Create logistics delivery tracking
   */
  async createLogisticsDeliveryTracking(
    deliveryId: string,
  ): Promise<LogisticsDeliveryTrackingResponse> {
    const booking = await prisma.logisticsBooking.update({
      where: { id: deliveryId },
      data: { status: "PENDING" },
      include: {
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return {
      id: booking.id,
      deliveryId: booking.id,
      status: booking.status,
      currentLocation: booking.currentLocation,
      estimatedDeliveryDate: null,
      assignedProvider: booking.driver
        ? {
            id: booking.driver.id,
            userId: booking.driver.userId,
            companyName: booking.driver.companyName,
            phone: booking.driver.phone,
            vehicleType: booking.driver.vehicleType,
            rating: booking.driver.rating,
            completedDeliveries: booking.driver.completedDeliveries,
            user: booking.driver.user,
          }
        : null,
      events: [],
    };
  },

  /**
   * Assign logistics provider to delivery
   */
  async assignProvider(
    deliveryId: string,
    providerId: string,
  ): Promise<LogisticsDeliveryTrackingResponse> {
    // Verify delivery exists
    const delivery = await prisma.logisticsBooking.findUnique({
      where: { id: deliveryId },
      include: { user: true },
    });

    if (!delivery) {
      throw new Error("Delivery not found");
    }

    // Verify provider exists
    const provider = await prisma.logisticsProfile.findUnique({
      where: { id: providerId },
      include: { user: true },
    });

    if (!provider) {
      throw new Error("Logistics provider not found");
    }

    // Update tracking
    const booking = await prisma.logisticsBooking.update({
      where: { id: deliveryId },
      data: {
        driverId: providerId,
        status: "PENDING",
      },
      include: {
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Send notification to customer
    await notificationService.createNotification(
      delivery.user.id,
      {
        type: "DELIVERY",
        title: "Delivery Provider Assigned",
        message: `Your delivery has been assigned to ${provider.companyName}. They will contact you shortly.`,
        link: `/bookings/logistics/${deliveryId}/tracking`,
      }
    );

    return {
      id: booking.id,
      deliveryId: booking.id,
      status: booking.status,
      currentLocation: booking.currentLocation,
      estimatedDeliveryDate: null,
      assignedProvider: booking.driver
        ? {
            id: booking.driver.id,
            userId: booking.driver.userId,
            companyName: booking.driver.companyName,
            phone: booking.driver.phone,
            rating: booking.driver.rating,
            completedDeliveries: booking.driver.completedDeliveries,
            vehicleType: booking.driver.vehicleType,
            user: booking.driver.user,
          }
        : null,
      events: [],
    };
  },

  /**
   * Update logistics delivery tracking status
   */
  async updateDeliveryStatus(
    deliveryId: string,
    status: string,
    currentLocation?: string,
    estimatedDeliveryDate?: Date,
  ): Promise<LogisticsDeliveryTrackingResponse> {
    // Verify booking exists
    const booking = await prisma.logisticsBooking.findUnique({
      where: { id: deliveryId },
      include: { user: true },
    });

    if (!booking) {
      throw new Error("Tracking not found");
    }

    // Validate status
    const validStatuses = [
      "PENDING",
      "ACCEPTED",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "FAILED",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid delivery status");
    }

    const statusMap: Record<string, BookingStatus> = {
      PENDING: "PENDING",
      ACCEPTED: "ACCEPTED",
      IN_TRANSIT: "IN_PROGRESS",
      OUT_FOR_DELIVERY: "IN_PROGRESS",
      DELIVERED: "COMPLETED",
      FAILED: "CANCELLED",
    };

    const updated = await prisma.logisticsBooking.update({
      where: { id: deliveryId },
      data: {
        status: (statusMap[status] || booking.status) as BookingStatus,
        currentLocation: currentLocation || booking.currentLocation,
        updatedAt: new Date(),
      },
      include: {
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: true,
      },
    }) as LogisticsBooking & {
      driver: LogisticsProfile & { user: { id: string; name: string | null; email: string } } | null;
      user: User;
    };

    // Send notification
    const notificationMessages = {
      PENDING: "Your delivery request has been received",
      ACCEPTED: "Your delivery request has been accepted",
      IN_TRANSIT: "Your delivery is on the way",
      OUT_FOR_DELIVERY: "Your delivery is out for final delivery",
      DELIVERED: "Your delivery has been completed",
      FAILED: "There was an issue with your delivery",
    };

    await notificationService.createNotification(
      updated.user.id,
      {
        type: "DELIVERY",
        title: "Delivery Status Update",
        message:
          notificationMessages[
            status as keyof typeof notificationMessages
          ] || `Delivery status: ${status}`,
        link: `/bookings/logistics/${deliveryId}/tracking`,
      }
    );

    return {
      id: updated.id,
      deliveryId: updated.id,
      status: updated.status,
      currentLocation: updated.currentLocation,
      estimatedDeliveryDate: estimatedDeliveryDate || null,
      assignedProvider: updated.driver
        ? {
            id: updated.driver.id,
            userId: updated.driver.userId,
            companyName: updated.driver.companyName,
            phone: updated.driver.phone,
            rating: updated.driver.rating,
            completedDeliveries: updated.driver.completedDeliveries,
            vehicleType: updated.driver.vehicleType,
            user: updated.driver.user,
          }
        : null,
      events: [],
    };
  },
};
