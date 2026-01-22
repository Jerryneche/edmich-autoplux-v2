# 🏗️ Push Notifications - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          YOUR BACKEND                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Your Service (Order, Payment, Product, Booking, etc.)            │
│  ├─ Create/Update resource                                         │
│  └─ Call: await notificationService.notifyXxx(data)               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ notificationService                                          │  │
│  │ ├─ Creates Notification record in database                  │  │
│  │ │  └─ Users fetch via GET /api/notifications               │  │
│  │ └─ Calls pushNotificationService.notifyUser()               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                  ↓                                  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ pushNotificationService                                      │  │
│  │ ├─ Fetches DeviceToken records from database               │  │
│  │ ├─ Validates tokens (active, format, etc.)                 │  │
│  │ ├─ Batches tokens (max 100 per request)                    │  │
│  │ └─ Sends to Expo Push API                                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                  ↓                                  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Database                                                     │  │
│  │ ├─ DeviceToken Table                                        │  │
│  │ │  ├─ userId, token, platform, isActive                    │  │
│  │ │  └─ Unique constraint: (userId, token)                   │  │
│  │ ├─ Notification Table                                       │  │
│  │ │  ├─ userId, type, title, message, link, read             │  │
│  │ │  └─ Index: (userId, read)                                │  │
│  │ └─ User Table (relations added)                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTP Request with token
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         EXPO PUSH API                               │
│                  https://exp.host/api/v2/push/send                  │
│                                                                     │
│  Receives: [                                                        │
│    {                                                                │
│      to: "ExponentPushToken[xxx]",                                │
│      title: "...",                                                 │
│      body: "...",                                                  │
│      data: { ... }                                                 │
│    }, ...                                                           │
│  ]                                                                  │
│                                                                     │
│  Returns: [                                                         │
│    { id: "uuid", status: "ok" },                                  │
│    ...                                                              │
│  ]                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    Platform-specific routing
                    (APNs for iOS, FCM for Android)
                                 │
                ┌────────────────┴────────────────┐
                ↓                                  ↓
      ┌──────────────────┐          ┌──────────────────┐
      │   Apple APNs     │          │   Google FCM     │
      │  (iOS Devices)   │          │ (Android Devices)│
      └──────────────────┘          └──────────────────┘
                │                                  │
         ┌──────┴─────────────────┬────────────────┘
         ↓                         ↓
    ┌─────────────┐          ┌─────────────┐
    │   iPhone    │          │ Android     │
    │             │          │ Phone       │
    │ ┌─────────┐ │          │ ┌─────────┐ │
    │ │Push Notif│ │          │ │Push Notif│ │
    │ │ Center  │ │          │ │ Center  │ │
    │ └─────────┘ │          │ └─────────┘ │
    │             │          │             │
    │ User Taps → │          │ User Taps → │
    │ Deep Link   │          │ Deep Link   │
    └─────────────┘          └─────────────┘
         │                         │
         └──────────────┬──────────┘
                        ↓
        ┌───────────────────────────────┐
        │    App Opens with Deep Link   │
        │    (e.g., /order/123)        │
        │                              │
        │    App also fetches:         │
        │    GET /api/notifications    │
        │    (to display in-app)       │
        └───────────────────────────────┘
```

---

## Data Flow Diagram

```
ORDER SERVICE
  ├─ Create Order
  │  └─ ORDER DATA: { id, buyerId, supplierId, total, ... }
  │
  └─ Call: notifyOrderPlaced(order)
     │
     ├─ Create Notification Record
     │  ├─ userId: order.supplierId
     │  ├─ type: "ORDER"
     │  ├─ title: "New Order"
     │  ├─ message: "New order #123 received"
     │  └─ link: "/order/123"
     │
     └─ Call: pushNotificationService.notifyUser()
        │
        ├─ Query DeviceTokens
        │  └─ SELECT * FROM DeviceToken WHERE userId = supplierId AND isActive = true
        │
        ├─ Prepare Message for Expo
        │  ├─ to: "ExponentPushToken[xxx]"
        │  ├─ title: "New Order"
        │  ├─ body: "New order #123 received"
        │  ├─ data: { type: "ORDER", orderId: "123", link: "/order/123" }
        │  └─ ttl: 86400 (24 hours)
        │
        ├─ Batch Messages (max 100)
        │
        └─ POST to Expo Push API
           └─ Response: [{ id: "uuid", status: "ok" }, ...]
```

---

## Request/Response Flow

### Device Token Registration Flow
```
Mobile App
  ├─ Generate Expo Push Token
  │  └─ EXPO_TOKEN = "ExponentPushToken[xxx]"
  │
  ├─ On App Start:
  │  └─ POST /api/users/device-token
  │     ├─ Headers:
  │     │  ├─ Authorization: Bearer USER_TOKEN
  │     │  └─ Content-Type: application/json
  │     │
  │     └─ Body:
  │        ├─ deviceToken: "ExponentPushToken[xxx]"
  │        ├─ platform: "ios" (or "android")
  │        └─ deviceName: "iPhone 12"
  │
  └─ Response: 201 Created
     ├─ success: true
     └─ token:
        ├─ id: "token_uuid"
        ├─ userId: "user_uuid"
        ├─ token: "ExponentPushToken[xxx]"
        ├─ platform: "ios"
        ├─ isActive: true
        └─ createdAt: 2024-01-22T...
```

### Push Notification Flow
```
Backend Service
  ├─ Event Trigger (order created, payment confirmed, etc.)
  │
  └─ POST /api/notifications/internal (backend-to-backend)
     ├─ Body:
     │  ├─ userId: "user_uuid"
     │  ├─ type: "ORDER"
     │  ├─ title: "New Order"
     │  ├─ message: "Your order is here"
     │  └─ data: { orderId: "order_uuid" }
     │
     └─ notificationService processes:
        │
        ├─ Database Operation
        │  └─ INSERT INTO Notification (...)
        │
        └─ Push Operation
           └─ pushNotificationService.notifyUser(...)
              │
              └─ POST https://exp.host/api/v2/push/send
                 ├─ To: Expo Push API
                 ├─ Data: [{ to: "ExponentPushToken[xxx]", ... }]
                 │
                 └─ Response: Delivery receipts

Mobile App
  ├─ Receives Push Notification
  │  └─ Expo SDK handler triggered
  │
  ├─ Option 1: App Running in Foreground
  │  └─ In-app listener shows notification UI
  │
  ├─ Option 2: App in Background
  │  └─ System notification center shows notification
  │
  └─ User Taps Notification
     ├─ Deep link URL: "edmich://order/order_uuid"
     ├─ App routes to: OrderDetailsScreen with orderId
     │
     └─ Simultaneously:
        └─ App calls: GET /api/notifications
           └─ Fetches all notifications for display in app
```

### Notification Retrieval Flow
```
Mobile App
  ├─ User opens "Notifications" screen
  │
  └─ GET /api/notifications
     ├─ Headers:
     │  └─ Authorization: Bearer USER_TOKEN
     │
     └─ Response: 200 OK
        ├─ success: true
        ├─ notifications: [
        │  ├─ {
        │  │  ├─ id: "notif_uuid"
        │  │  ├─ userId: "user_uuid"
        │  │  ├─ type: "ORDER"
        │  │  ├─ title: "New Order"
        │  │  ├─ message: "Order #123 received"
        │  │  ├─ link: "/order/123"
        │  │  ├─ read: false
        │  │  └─ createdAt: "2024-01-22T..."
        │  │  }
        │  ]
        └─ unreadCount: 3

User Taps Notification
  ├─ Mark as Read:
  │  └─ PATCH /api/notifications/notif_uuid
  │     └─ Body: { read: true }
  │
  └─ Delete Notification:
     └─ DELETE /api/notifications/notif_uuid
```

---

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────┐
│                       User                              │
├─────────────────────────────────────────────────────────┤
│ PK: id                                                  │
│ - name, email, username, ...                            │
│                                                         │
│ Relations:                                              │
│ ├─ deviceTokens: DeviceToken[]  (1 to many)           │
│ └─ notifications: Notification[]  (1 to many)         │
└─────────────────────────────────────────────────────────┘
        │                               │
        │ (userId)                      │ (userId)
        │                               │
        ↓                               ↓
┌──────────────────────────┐  ┌─────────────────────────┐
│    DeviceToken           │  │   Notification          │
├──────────────────────────┤  ├─────────────────────────┤
│ PK: id                   │  │ PK: id                  │
│ FK: userId (not null)    │  │ FK: userId (not null)   │
│ - token (string)         │  │ - type (enum)           │
│ - platform (string)      │  │ - title (string)        │
│ - deviceName (string?)   │  │ - message (string)      │
│ - isActive (boolean)     │  │ - link (string?)        │
│ - createdAt              │  │ - read (boolean)        │
│ - updatedAt              │  │ - createdAt             │
│                          │  │                         │
│ Constraints:             │  │ Indexes:                │
│ ├─ UNIQUE(userId, token) │  │ ├─ (userId, read)      │
│ └─ INDEX(userId)         │  │ └─ (createdAt)         │
└──────────────────────────┘  └─────────────────────────┘
```

---

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     Your Application                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Service Layer (e.g., orderService)                            │
│  └─ await notificationService.notifyOrderPlaced(order)         │
│                                                                  │
│  ↓                                                               │
│                                                                  │
│  notificationService (services/notification.service.ts)         │
│  ├─ [Method] notifyOrderPlaced(order)                          │
│  ├─ [Method] notifyPaymentSuccess(order, amount)              │
│  ├─ [Method] notifyProductApproved(product)                   │
│  └─ [Method] ... (18 total methods)                            │
│  │                                                               │
│  ├─ Action 1: Create Notification in Database                 │
│  │  └─ await prisma.notification.create({ ... })             │
│  │                                                               │
│  └─ Action 2: Send Push Notification                          │
│     └─ await pushNotificationService.notifyUser(...)          │
│                                                                  │
│  ↓                                                               │
│                                                                  │
│  pushNotificationService (services/push-notification.service.ts)│
│  ├─ [Method] notifyUser(userId, notification)                 │
│  ├─ [Method] notifyUsers(userIds[], notification)            │
│  │                                                               │
│  ├─ Step 1: Fetch DeviceTokens from Database                 │
│  │  └─ await prisma.deviceToken.findMany({                   │
│  │     where: { userId, isActive: true }                     │
│  │  })                                                          │
│  │                                                               │
│  ├─ Step 2: Validate Tokens                                  │
│  │  └─ Check format, not expired, etc.                        │
│  │                                                               │
│  ├─ Step 3: Batch Tokens                                     │
│  │  └─ Split into batches of max 100                         │
│  │                                                               │
│  └─ Step 4: Send to Expo API                                 │
│     └─ await axios.post(EXPO_PUSH_API, batch)               │
│                                                                  │
│  ↓                                                               │
│                                                                  │
│  API Endpoints (app/api/notifications/)                        │
│  ├─ POST /users/device-token (register device)               │
│  ├─ DELETE /users/device-token (unregister device)          │
│  ├─ POST /notifications (create notification)               │
│  ├─ GET /notifications (fetch notifications)                │
│  ├─ PATCH /notifications (mark all read)                    │
│  ├─ PATCH /notifications/[id] (mark one read)              │
│  ├─ DELETE /notifications/[id] (delete notification)       │
│  └─ POST /notifications/test (send test push)               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
         ↓
    Database (PostgreSQL)
         ↓
    Expo Push API
         ↓
    APNs (iOS) / FCM (Android)
         ↓
    Mobile Devices
```

---

## Error Handling Flow

```
notificationService.notifyOrderPlaced(order)
  │
  ├─ TRY
  │  ├─ Create Notification in DB
  │  │  └─ CATCH: Log error, continue
  │  │
  │  └─ Send Push Notification
  │     └─ CATCH: Log error, continue (non-blocking)
  │
  └─ CATCH (All errors)
     ├─ Log: console.error(error)
     ├─ Do NOT throw: Keep service functioning
     └─ Notification failure won't block order creation

Result: Service continues even if notification fails ✅
```

---

## Notification Type Structure

```
Notification Record
├─ User Relationship
│  └─ userId: Identifies which user owns this notification
│
├─ Notification Type (Enum)
│  ├─ ORDER → Order-related events
│  ├─ PAYMENT → Payment-related events
│  ├─ PRODUCT → Product-related events
│  ├─ DELIVERY → Delivery-related events
│  ├─ BOOKING → Booking-related events
│  ├─ REVIEW → Review-related events
│  ├─ LOW_INVENTORY → System alert
│  ├─ PRODUCT_CREATED → New product
│  ├─ LOGISTICS → Logistics events
│  ├─ ACCOUNT → Account events
│  └─ SYSTEM → General system notifications
│
├─ Display Information
│  ├─ title: "Order Confirmed" (short, actionable)
│  ├─ message: "Order #123 has been confirmed" (details)
│  └─ link: "/order/123" (deep link to related resource)
│
├─ State
│  └─ read: Boolean (user has acknowledged)
│
└─ Timeline
   └─ createdAt: Timestamp of notification
```

---

## Scalability Considerations

```
Single User with 10 Device Tokens

User.id = "user_123"
  ├─ DeviceToken #1: iPhone 12 (iOS)
  ├─ DeviceToken #2: iPad Pro (iOS)
  ├─ DeviceToken #3: Android Phone #1
  ├─ DeviceToken #4: Android Phone #2
  └─ DeviceToken #5: Android Tablet

When notification is sent:
  ├─ Fetch 5 tokens from database (quick)
  ├─ Prepare 5 messages for Expo
  ├─ Send in 1 request (batch)
  ├─ Expo delivers to all 5 devices
  └─ Total time: ~200-500ms

Scale to 1M users:
  ├─ Database query: Still indexed by userId
  ├─ Batch sending: Max 100 tokens per request
  ├─ Parallel processing: Can handle many users at once
  └─ Expo handles the scale (proven service)
```

---

## Summary

This architecture:
- ✅ Separates concerns (service, push, API)
- ✅ Handles errors gracefully
- ✅ Scales horizontally
- ✅ Supports multiple devices per user
- ✅ Works with both iOS and Android
- ✅ Can send to millions of devices
- ✅ Includes retry logic (via Expo)
- ✅ Tracks all notifications in database
