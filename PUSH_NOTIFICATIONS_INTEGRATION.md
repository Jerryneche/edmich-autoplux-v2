# Push Notifications - Quick Integration Guide

Use this guide to add push notifications to your existing services.

## 1. Order Service Integration

### File: `services/order.service.ts`

```typescript
import { notificationService } from "@/services/notification.service";

// When creating an order
export async function createOrder(data: any) {
  const order = await prisma.order.create({ 
    data: {
      buyerId: data.buyerId,
      supplierId: data.supplierId,
      items: data.items,
      total: data.total,
      // ... other fields
    }
  });

  // Send notification when order is placed
  try {
    await notificationService.notifyOrderPlaced(order);
  } catch (error) {
    console.error("Failed to send order placed notification:", error);
    // Don't fail the order creation if notification fails
  }

  return order;
}

// When confirming an order (supplier confirms)
export async function confirmOrder(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "CONFIRMED" }
  });

  // Notify buyer that order is confirmed
  try {
    await notificationService.notifyOrderConfirmed(order);
  } catch (error) {
    console.error("Failed to send order confirmed notification:", error);
  }

  return order;
}

// When shipping an order
export async function shipOrder(orderId: string, trackingId?: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { 
      status: "SHIPPED",
      trackingId: trackingId || undefined
    }
  });

  // Notify buyer that order has shipped
  try {
    await notificationService.notifyOrderShipped(order, trackingId);
  } catch (error) {
    console.error("Failed to send order shipped notification:", error);
  }

  return order;
}

// When order is delivered
export async function deliverOrder(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "DELIVERED" }
  });

  // Notify buyer that order has been delivered
  try {
    await notificationService.notifyOrderDelivered(order);
  } catch (error) {
    console.error("Failed to send order delivered notification:", error);
  }

  return order;
}

// When cancelling an order
export async function cancelOrder(orderId: string, reason?: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" }
  });

  // Notify buyer that order has been cancelled
  try {
    await notificationService.notifyOrderCancelled(order, reason);
  } catch (error) {
    console.error("Failed to send order cancelled notification:", error);
  }

  return order;
}
```

## 2. Payment Service Integration

### File: `services/payment.service.ts`

```typescript
import { notificationService } from "@/services/notification.service";

export async function processPayment(orderId: string, amount: number) {
  const order = await prisma.order.findUnique({ 
    where: { id: orderId },
    include: { buyer: true }
  });

  if (!order) {
    throw new Error("Order not found");
  }

  try {
    // Initialize payment with Paystack
    const paystackResponse = await paystack.transaction.initialize({
      email: order.buyer.email,
      amount: amount * 100, // Paystack uses kobo
      callback_url: "edmich://payment-success",
    });

    return paystackResponse;
  } catch (error) {
    console.error("Payment initialization failed:", error);
    throw error;
  }
}

// When payment verification succeeds
export async function verifyPayment(reference: string) {
  try {
    // Verify with Paystack
    const paymentData = await paystack.transaction.verify({ reference });

    if (paymentData.status === "success") {
      // Find the order associated with this payment
      const order = await prisma.order.findFirst({
        where: { 
          paymentReference: reference 
        }
      });

      if (order) {
        // Update order payment status
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: "COMPLETED" }
        });

        // Send success notification
        try {
          await notificationService.notifyPaymentSuccess(
            order,
            paymentData.amount / 100 // Convert from kobo back to naira
          );
        } catch (notifError) {
          console.error("Failed to send payment success notification:", notifError);
        }
      }

      return { success: true, payment: paymentData };
    }

    // Payment failed
    if (order) {
      try {
        await notificationService.notifyPaymentFailed(
          order,
          paymentData.gateway_response
        );
      } catch (notifError) {
        console.error("Failed to send payment failed notification:", notifError);
      }
    }

    return { success: false, reason: paymentData.gateway_response };
  } catch (error) {
    console.error("Payment verification failed:", error);
    throw error;
  }
}

// Refund a payment
export async function refundPayment(orderId: string) {
  const order = await prisma.order.findUnique({ 
    where: { id: orderId },
    include: { payments: true }
  });

  if (!order || !order.payments?.[0]) {
    throw new Error("Order or payment not found");
  }

  try {
    const refund = await paystack.refund.create({
      transaction: order.payments[0].paystackTransactionId,
    });

    if (refund.status === "success") {
      // Update order
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "REFUNDED" }
      });

      // Send refund notification
      try {
        await notificationService.notifyUser(order.buyerId, {
          type: "PAYMENT" as any,
          title: "Refund Processed",
          message: `Refund of ₦${(refund.amount / 100).toLocaleString()} has been processed`,
          link: `/order/${orderId}`,
        });
      } catch (notifError) {
        console.error("Failed to send refund notification:", notifError);
      }
    }

    return refund;
  } catch (error) {
    console.error("Refund failed:", error);
    throw error;
  }
}
```

## 3. Product Service Integration

### File: `services/product.service.ts`

```typescript
import { notificationService } from "@/services/notification.service";

// When admin approves a product
export async function approveProduct(productId: string) {
  const product = await prisma.product.update({
    where: { id: productId },
    data: { status: "APPROVED" }
  });

  // Notify supplier that product is approved
  try {
    await notificationService.notifyProductApproved(product);
  } catch (error) {
    console.error("Failed to send product approved notification:", error);
  }

  return product;
}

// When admin rejects a product
export async function rejectProduct(productId: string, reason: string) {
  const product = await prisma.product.update({
    where: { id: productId },
    data: { status: "REJECTED" }
  });

  // Notify supplier that product was rejected
  try {
    await notificationService.notifyProductRejected(product, reason);
  } catch (error) {
    console.error("Failed to send product rejected notification:", error);
  }

  return product;
}

// When product stock goes to 0
export async function updateProductStock(productId: string, quantity: number) {
  const product = await prisma.product.update({
    where: { id: productId },
    data: { stock: quantity }
  });

  const wasInStock = product.stock > 0;
  const isNowInStock = quantity > 0;

  // If went from in-stock to out-of-stock
  if (wasInStock && !isNowInStock) {
    // Get users who wishlisted this product
    const wishlists = await prisma.wishlist.findMany({
      where: { productId },
      select: { userId: true }
    });
    const userIds = wishlists.map(w => w.userId);

    // Notify them
    try {
      await notificationService.notifyProductOutOfStock(productId, userIds);
    } catch (error) {
      console.error("Failed to send out of stock notification:", error);
    }
  }

  // If came back in stock from out-of-stock
  if (!wasInStock && isNowInStock) {
    // Get users who wishlisted this product
    const wishlists = await prisma.wishlist.findMany({
      where: { productId },
      select: { userId: true }
    });
    const userIds = wishlists.map(w => w.userId);

    // Notify them
    try {
      await notificationService.notifyProductInStock(productId, userIds);
    } catch (error) {
      console.error("Failed to send back in stock notification:", error);
    }
  }

  // Check if stock is low and notify supplier
  if (quantity > 0 && quantity <= 5) {
    try {
      await notificationService.notifyLowInventory(
        product.supplierId,
        productId,
        product.name,
        quantity
      );
    } catch (error) {
      console.error("Failed to send low inventory notification:", error);
    }
  }

  return product;
}
```

## 4. Booking Service Integration

### File: `services/booking.service.ts`

```typescript
import { notificationService } from "@/services/notification.service";

// When creating a booking
export async function createMechanicBooking(data: any) {
  const booking = await prisma.mechanicBooking.create({
    data: {
      customerId: data.customerId,
      mechanicId: data.mechanicId,
      serviceType: data.serviceType,
      scheduledDate: data.scheduledDate,
      description: data.description,
      status: "PENDING",
    },
    include: { customer: true, mechanic: true }
  });

  return booking;
}

// When confirming a booking (mechanic confirms)
export async function confirmBooking(bookingId: string) {
  const booking = await prisma.mechanicBooking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
    include: { customer: true, mechanic: true }
  });

  // Notify customer that booking is confirmed
  try {
    await notificationService.notifyBookingConfirmed(
      booking.customerId,
      bookingId,
      booking.serviceType
    );
  } catch (error) {
    console.error("Failed to send booking confirmed notification:", error);
  }

  return booking;
}

// When cancelling a booking
export async function cancelBooking(bookingId: string, reason?: string) {
  const booking = await prisma.mechanicBooking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
    include: { customer: true, mechanic: true }
  });

  // Notify customer of cancellation
  try {
    await notificationService.notifyBookingCancelled(
      booking.customerId,
      bookingId,
      reason
    );
  } catch (error) {
    console.error("Failed to send booking cancelled notification:", error);
  }

  return booking;
}
```

## 5. Review Service Integration

### File: `services/review.service.ts` (if it exists)

```typescript
import { notificationService } from "@/services/notification.service";

// When creating a product review
export async function createProductReview(data: any) {
  const review = await prisma.review.create({
    data: {
      userId: data.userId,
      productId: data.productId,
      rating: data.rating,
      comment: data.comment,
    },
    include: { product: true }
  });

  // Notify supplier of new review
  try {
    await notificationService.notifyRatingReceived(
      review.product.supplierId,
      review.productId,
      review.rating
    );
  } catch (error) {
    console.error("Failed to send review notification:", error);
  }

  return review;
}
```

## 6. Logistics Service Integration

### File: `services/order.service.ts` (Delivery part)

```typescript
import { notificationService } from "@/services/notification.service";

// When assigning a delivery driver
export async function assignDeliveryDriver(orderId: string, driverId: string) {
  const [order, driver] = await Promise.all([
    prisma.order.findUnique({ where: { id: orderId } }),
    prisma.user.findUnique({ where: { id: driverId } })
  ]);

  if (!order || !driver) {
    throw new Error("Order or driver not found");
  }

  // Update order with driver
  await prisma.order.update({
    where: { id: orderId },
    data: { 
      deliveryDriverId: driverId,
      status: "WITH_DRIVER"
    }
  });

  // Notify buyer that driver is assigned
  try {
    await notificationService.notifyDeliveryAssigned(
      orderId,
      order.buyerId,
      driver.name || "Driver"
    );
  } catch (error) {
    console.error("Failed to send driver assigned notification:", error);
  }
}

// When driver is on the way
export async function markDeliveryInProgress(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "IN_TRANSIT" }
  });

  // Notify buyer that order is on the way
  try {
    await notificationService.notifyDeliveryInProgress(orderId, order.buyerId);
  } catch (error) {
    console.error("Failed to send in progress notification:", error);
  }

  return order;
}

// When delivery is completed
export async function completeDelivery(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "DELIVERED" }
  });

  // Notify buyer that order is delivered
  try {
    await notificationService.notifyDeliveryCompleted(orderId, order.buyerId);
  } catch (error) {
    console.error("Failed to send delivery completed notification:", error);
  }

  return order;
}
```

## Testing Your Integration

### Test Endpoint
```bash
# Send test notification
curl -X POST https://www.edmich.com/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "message": "This is a test",
    "type": "general"
  }'
```

### Quick Verification
```typescript
// Check if notificationService methods are being called
// Add this temporary log to your service:
console.log(`[NOTIFICATION] Sending: ${title} to user ${userId}`);

// Check database for notifications
SELECT * FROM "Notification" WHERE "userId" = 'YOUR_USER_ID' ORDER BY "createdAt" DESC;

// Check device tokens
SELECT * FROM "DeviceToken" WHERE "userId" = 'YOUR_USER_ID' AND "isActive" = true;
```

## Error Handling

All notification methods use try-catch to prevent notification failures from breaking your main operations:

```typescript
try {
  await notificationService.notifyOrderPlaced(order);
} catch (error) {
  // Log but don't fail the order creation
  console.error("Notification failed:", error);
}
```

This ensures that:
- ✅ Order is still created even if notification fails
- ✅ Payment still processes even if notification fails
- ✅ Delivery still updates even if notification fails

## Best Practices

1. **Always wrap in try-catch** - Don't let notification failures break your service
2. **Log failures** - Use console.error for debugging
3. **Include context** - Add orderId, userId, etc. to error logs
4. **Test separately** - Use `/api/notifications/test` endpoint first
5. **Monitor delivery** - Check Firebase Console for push delivery rates

## Summary

Integration checklist:
- [ ] Import `notificationService` in your service file
- [ ] Call appropriate notification method after state change
- [ ] Wrap in try-catch to prevent errors
- [ ] Test with `/api/notifications/test` endpoint
- [ ] Monitor notification delivery in logs
- [ ] Check database for notifications and device tokens
