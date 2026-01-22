# Push Notifications Implementation Status

## ✅ Backend Infrastructure Complete

All backend components have been set up and are ready to use:

### 1. Database Schema ✅
- `DeviceToken` model for tracking registered mobile devices
- `Notification` model with `NotificationType` enum for in-app notifications
- Updated `User` model with relationships to both models

**Status**: Awaiting migration when database is available

### 2. Device Token Management ✅
**File**: `app/api/users/device-token/route.ts`

#### Endpoints
- **POST** `/api/users/device-token` - Register or update device token
  - Required: `deviceToken` (Expo push token), `platform` ("ios" | "android")
  - Optional: `deviceName` (e.g., "iPhone 12")
  - Returns registered token

- **DELETE** `/api/users/device-token?token=DEVICE_TOKEN` - Unregister device
  - Required: `token` query parameter

#### Usage Example
```typescript
// Mobile app calls this on startup
const registerDeviceToken = async (token: string) => {
  const response = await fetch(
    "https://www.edmich.com/api/users/device-token",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        deviceToken: token,
        platform: Platform.OS, // "ios" or "android"
        deviceName: Device.modelName
      })
    }
  );
  return response.json();
};
```

### 3. Push Notification Service ✅
**File**: `services/push-notification.service.ts`

#### Core Methods
- `notifyUser(userId, notification)` - Send to single user
- `notifyUsers(userIds[], notification)` - Send to multiple users

#### Specialized Methods (Ready to Use)

**Order Notifications:**
- `notifyOrderPlaced(order)` - New order for supplier
- `notifyOrderConfirmed(order)` - Order confirmed for buyer
- `notifyOrderShipped(order, trackingId?)` - Order shipped
- `notifyOrderDelivered(order)` - Order delivered
- `notifyOrderCancelled(order, reason?)` - Order cancelled

**Payment Notifications:**
- `notifyPaymentSuccess(order, amount)` - Payment successful
- `notifyPaymentFailed(order, reason?)` - Payment failed

**Product Notifications:**
- `notifyProductApproved(product)` - Product approved by admin
- `notifyProductRejected(product, reason?)` - Product rejected
- `notifyProductOutOfStock(productId, wishedUsers[])` - Out of stock
- `notifyProductInStock(productId, wishedUsers[])` - Back in stock

**Delivery Notifications:**
- `notifyDeliveryAssigned(orderId, buyerId, driverName)` - Driver assigned
- `notifyDeliveryInProgress(orderId, buyerId)` - Out for delivery
- `notifyDeliveryCompleted(orderId, buyerId)` - Delivery complete

**Booking Notifications:**
- `notifyBookingConfirmed(userId, bookingId, serviceName)` - Booking confirmed
- `notifyBookingCancelled(userId, bookingId, reason?)` - Booking cancelled

**Review Notifications:**
- `notifyRatingReceived(userId, productId, rating)` - New review received

**System Notifications:**
- `notifyLowInventory(supplierId, productId, name, stock)` - Low inventory alert

#### Features
- ✅ Batch sending (max 100 notifications per Expo API call)
- ✅ Error handling and logging
- ✅ Support for custom data payloads
- ✅ 24-hour TTL (time to live)
- ✅ High priority for all notifications
- ✅ Badge count support

### 4. In-App Notification Service ✅
**File**: `services/notification.service.ts`

#### Core Methods
- `createNotification(userId, notification)` - Create in-app notification only
- `notifyUserWithPush(userId, notification)` - Create in-app + send push
- `notifyUsersWithPush(userIds[], notification)` - Multi-user with push

#### Same Specialized Methods as Push Service
- All methods also create in-app notifications that display in notification center
- Mobile app will fetch these via `/api/notifications` endpoint

### 5. API Endpoints ✅

#### In-App Notifications
- **GET** `/api/notifications` - Fetch user's notifications
  - Query params: `type` (filter), `limit` (default: 50)
  - Returns: notifications array + unreadCount

- **POST** `/api/notifications` - Create in-app notification (admin use)
  - Body: `{ title, message, type, link? }`

- **PATCH** `/api/notifications` - Mark notifications as read
  - Body: `{ markAllRead: true }` or `{ notificationId: "id", markAllRead: false }`

- **PATCH** `/api/notifications/[id]` - Mark single notification as read/unread
  - Body: `{ read: boolean }`

- **DELETE** `/api/notifications/[id]` - Delete single notification

- **POST** `/api/notifications/test` - Send test push notification
  - Optional body: `{ title, message, type }`
  - Useful for testing your setup

## Next Steps

### 1. Run Prisma Migration (When Database Available)
```bash
npx prisma migrate dev --name add_device_tokens_and_notifications
```

### 2. Integrate Push Notifications into Services

**Example: Order Service**
```typescript
import { notificationService } from "@/services/notification.service";

export async function createOrder(data: any) {
  const order = await prisma.order.create({ data });
  
  // Send notifications
  await notificationService.notifyOrderPlaced(order);
  
  return order;
}

export async function confirmOrder(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "CONFIRMED" }
  });
  
  // Send notification
  await notificationService.notifyOrderConfirmed(order);
  
  return order;
}
```

**Example: Payment Service**
```typescript
import { notificationService } from "@/services/notification.service";

export async function processPayment(orderId: string, amount: number) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  
  try {
    const result = await paystack.charge({ amount });
    
    if (result.success) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "COMPLETED" }
      });
      
      // Notify buyer
      await notificationService.notifyPaymentSuccess(order, amount);
    }
  } catch (error) {
    // Notify buyer of failure
    await notificationService.notifyPaymentFailed(order, error.message);
  }
  
  return result;
}
```

### 3. Test Your Setup

**Send Test Notification:**
```bash
curl -X POST https://www.edmich.com/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Check Device Tokens in Database:**
```sql
SELECT * FROM "DeviceToken" WHERE "userId" = 'YOUR_USER_ID';
SELECT COUNT(*) FROM "DeviceToken" WHERE "isActive" = true;
```

### 4. Configure Native Push (APNs for iOS, FCM for Android)

See `PUSH_NOTIFICATIONS_SETUP.md` for detailed iOS APNs and Android FCM configuration.

## How It Works

### Flow Diagram
```
1. Mobile App
   ├─ Generates Expo Push Token
   └─ Registers token: POST /api/users/device-token
      
2. Backend Service (e.g., Order Service)
   ├─ Creates order
   ├─ Calls notificationService.notifyOrderPlaced(order)
   └─ Which:
      ├─ Creates in-app notification in DB
      └─ Sends push to all user's device tokens via Expo API
      
3. Mobile App
   ├─ Receives push notification
   ├─ Displays in notification center
   ├─ User taps notification
   └─ Deep link routes to relevant screen (e.g., /order/123)
   
4. Mobile App (Later)
   ├─ User opens app
   └─ Fetches notifications: GET /api/notifications
```

### Data Flow
```
Order Created
    ↓
notificationService.notifyOrderPlaced()
    ├─ Creates Notification record in DB
    │  └─ User can fetch via GET /api/notifications
    │
    └─ Calls pushNotificationService.notifyUser()
       ├─ Fetches all active DeviceTokens for user
       ├─ Sends batch to Expo Push API
       └─ Expo delivers to each device
          └─ Device displays native notification
             └─ User taps → Opens app → Deep link routes
```

## Testing Checklist

- [ ] Database migration successful
- [ ] Device token registration works
- [ ] Test push notification sends
- [ ] Mobile app receives push notification
- [ ] Tapping notification opens correct screen
- [ ] Notifications appear in notification center
- [ ] Mark as read functionality works
- [ ] Delete notification functionality works
- [ ] Order notifications trigger on order created
- [ ] Payment notifications trigger on payment success/failure
- [ ] Product notifications trigger appropriately

## Troubleshooting

### Device Tokens Not Registered
- Check mobile app is calling POST /api/users/device-token
- Verify Authorization header is correct
- Check user ID matches in backend

### Push Notifications Not Sending
- Check DeviceToken records exist and isActive=true
- Verify Expo API is reachable
- Check notification data matches Expo format
- Check app has notification permissions

### Expo Push Issues
- Verify token format is valid (starts with ExponentPushToken[)
- Check badge count is valid (integer)
- Verify data object is valid JSON

## Files Modified/Created

✅ Created:
- `app/api/users/device-token/route.ts`
- `app/api/notifications/test/route.ts`
- `services/push-notification.service.ts`
- `services/notification.service.ts`

Updated:
- `app/api/notifications/[id]/route.ts`
- `prisma/schema.prisma` (DeviceToken model, User relations)

## Environment Variables Required

Make sure these are in your `.env` file:
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection (for Vercel)

**Optional but Recommended:**
- Set up monitoring for push notification delivery in Firebase Console (once FCM is configured)

## Next Documentation to Review

1. `PUSH_NOTIFICATIONS_SETUP.md` - iOS APNs and Android FCM configuration
2. Mobile app notification service implementation
3. Deep linking configuration for notification navigation
