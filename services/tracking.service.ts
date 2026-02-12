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
        assignedLogisticsProvider: {
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
        events: {
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
        events: true,
      },
    });

    // Create initial tracking event
    await prisma.trackingEvent.create({
      data: {
        trackingId: tracking.id,
        status: "PENDING",
        message: "Order confirmed",
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

    // Update tracking
    const tracking = await prisma.orderTracking.update({
      where: { orderId },
      data: {
        assignedLogisticsProviderId: logisticsProviderId,
        status: "PENDING",
      },
      include: {
        assignedLogisticsProvider: {
          select: {
            id: true,
            name: true,
            phone: true,
            logisticsProfile: {
              select: { rating: true, completedDeliveries: true, vehicleType: true },
            },
          },
        },
        events: true,
      },
    });

    // Create tracking event
    await prisma.trackingEvent.create({
      data: {
        trackingId: tracking.id,
        status: "PENDING",
        message: `Logistics provider ${provider.name} assigned to order`,
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
    lastLocation?: string,
    estimatedDeliveryDate?: Date,
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
        lastLocation: lastLocation || tracking.lastLocation,
        estimatedDeliveryDate:
          estimatedDeliveryDate || tracking.estimatedDeliveryDate,
        updatedAt: new Date(),
      },
      include: {
        events: { orderBy: { timestamp: "desc" } },
        order: { include: { user: true } },
      },
    });

    // Create tracking event
    await prisma.trackingEvent.create({
      data: {
        trackingId: updated.id,
        status,
        location: lastLocation,
        message: message || `Order status updated to ${status}`,
      },
    });

    // Send notification to customer
    const notificationMessages = {
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
        message:
          notificationMessages[
            status as keyof typeof notificationMessages
          ] || `Order status: ${status}`,
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
    const events = await prisma.trackingEvent.findMany({
      where: { tracking: { orderId } },
      orderBy: { timestamp: "desc" },
      take: limit,
      skip,
    });

    const total = await prisma.trackingEvent.count({
      where: { tracking: { orderId } },
    });

    return { total, events };
  },
};

// ===========================
// MECHANIC BOOKING TRACKING
// ===========================

export const mechanicBookingTrackingService = {
  /**
   * Get mechanic booking tracking
   */
  async getMechanicBookingTracking(bookingId: string) {
    const tracking = await prisma.mechanicBookingTracking.findUnique({
      where: { bookingId },
      include: {
        assignedMechanic: {
          select: {
            id: true,
            userId: true,
            specialization: true,
            rating: true,
            completedJobs: true,
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        events: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    return tracking;
  },

  /**
   * Create mechanic booking tracking
   */
  async createMechanicBookingTracking(bookingId: string) {
    const tracking = await prisma.mechanicBookingTracking.create({
      data: {
        bookingId,
        status: "PENDING",
      },
      include: {
        events: true,
      },
    });

    // Create initial event
    await prisma.mechanicBookingTrackingEvent.create({
      data: {
        trackingId: tracking.id,
        status: "PENDING",
        message: "Booking created and waiting for mechanic assignment",
      },
    });

    return tracking;
  },

  /**
   * Assign mechanic to booking
   */
  async assignMechanic(bookingId: string, mechanicId: string) {
    // Verify booking exists
    const booking = await prisma.mechanicBooking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify mechanic exists
    const mechanic = await prisma.mechanicProfile.findUnique({
      where: { id: mechanicId },
      include: { user: true },
    });

    if (!mechanic) {
      throw new Error("Mechanic not found");
    }

    // Update tracking
    const tracking = await prisma.mechanicBookingTracking.update({
      where: { bookingId },
      data: {
        assignedMechanicId: mechanicId,
        status: "ASSIGNED",
      },
      include: {
        assignedMechanic: {
          select: {
            id: true,
            rating: true,
            completedJobs: true,
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        events: true,
      },
    });

    // Create event
    await prisma.mechanicBookingTrackingEvent.create({
      data: {
        trackingId: tracking.id,
        status: "ASSIGNED",
        message: `Mechanic ${mechanic.user.name} has been assigned to your booking`,
      },
    });

    // Send notification to customer
    await notificationService.createNotification(booking.user.id, {
      type: "BOOKING",
      title: "Mechanic Assigned",
      message: `${mechanic.user.name} has been assigned to your booking and will contact you soon.`,
      link: `/bookings/mechanic/${bookingId}/tracking`,
    });

    return tracking;
  },

  /**
   * Update mechanic booking status
   */
  async updateMechanicBookingStatus(
    bookingId: string,
    status: string,
    message?: string
  ) {
    // Verify tracking exists
    const tracking = await prisma.mechanicBookingTracking.findUnique({
      where: { bookingId },
      include: { mechanicBooking: { include: { user: true } } },
    });

    if (!tracking) {
      throw new Error("Tracking not found");
    }

    // Validate status
    const validStatuses = ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid booking status");
    }

    // Update tracking
    const updated = await prisma.mechanicBookingTracking.update({
      where: { bookingId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        events: { orderBy: { timestamp: "desc" } },
        mechanicBooking: { include: { user: true } },
      },
    });

    // Create event
    await prisma.mechanicBookingTrackingEvent.create({
      data: {
        trackingId: updated.id,
        status,
        message:
          message || `Booking status updated to ${status}`,
      },
    });

    // Send notification
    const notificationMessages = {
      PENDING: "Your booking has been created",
      ASSIGNED: "A mechanic has been assigned to your booking",
      IN_PROGRESS: "The mechanic has started working on your vehicle",
      COMPLETED: "Your booking has been completed",
      CANCELLED: "Your booking has been cancelled",
    };

    await notificationService.createNotification(
      updated.mechanicBooking.user.id,
      {
        type: "BOOKING",
        title: "Booking Status Update",
        message:
          notificationMessages[
            status as keyof typeof notificationMessages
          ] || `Booking status: ${status}`,
        link: `/bookings/mechanic/${bookingId}/tracking`,
      }
    );

    return updated;
  },
};

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
