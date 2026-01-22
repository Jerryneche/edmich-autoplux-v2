# 📋 Push Notifications Implementation Checklist

## Phase 1: Backend Infrastructure ✅ COMPLETE

### Database
- [x] Add DeviceToken model to Prisma schema
- [x] Add Notification model to Prisma schema
- [x] Add NotificationType enum to Prisma schema
- [x] Update User model with device tokens relation
- [ ] Run Prisma migration (when DB available)

### API Endpoints
- [x] Device token registration: `POST /api/users/device-token`
- [x] Device token deletion: `DELETE /api/users/device-token`
- [x] Get notifications: `GET /api/notifications`
- [x] Create notification: `POST /api/notifications`
- [x] Mark all as read: `PATCH /api/notifications`
- [x] Mark one as read: `PATCH /api/notifications/[id]`
- [x] Delete notification: `DELETE /api/notifications/[id]`
- [x] Test notification: `POST /api/notifications/test`

### Services
- [x] Push notification service (`services/push-notification.service.ts`)
  - [x] Core methods (notifyUser, notifyUsers)
  - [x] Order notification methods (5)
  - [x] Payment notification methods (2)
  - [x] Product notification methods (4)
  - [x] Delivery notification methods (3)
  - [x] Booking notification methods (2)
  - [x] Review notification methods (1)
  - [x] System notification methods (1)

- [x] Notification service (`services/notification.service.ts`)
  - [x] Create notification method
  - [x] NotifyUserWithPush method
  - [x] NotifyUsersWithPush method
  - [x] All specialized methods (mirrors push service)

### Documentation
- [x] Backend overview: `PUSH_NOTIFICATIONS_BACKEND.md`
- [x] Integration guide: `PUSH_NOTIFICATIONS_INTEGRATION.md`
- [x] Quick start: `PUSH_NOTIFICATIONS_QUICK_START.md`
- [x] This checklist

---

## Phase 2: Run Prisma Migration

### Preparation
- [ ] Ensure database is accessible
- [ ] DATABASE_URL environment variable is set
- [ ] DIRECT_URL environment variable is set (for Vercel)
- [ ] Backup current database (if production)

### Execute Migration
```bash
cd c:\Users\User\edmich-auto\edmich-autoplux
npx prisma migrate dev --name add_device_tokens_and_notifications
```

### Verify Migration
- [ ] Migration completes without errors
- [ ] Check database has DeviceToken table
- [ ] Check database has Notification table
- [ ] Verify indices are created correctly
- [ ] Verify foreign key constraints are set up

---

## Phase 3: Service Integration

### Order Service
**File**: `services/order.service.ts`

- [ ] Import notificationService
- [ ] Add notification call to createOrder()
- [ ] Add notification call to confirmOrder()
- [ ] Add notification call to shipOrder()
- [ ] Add notification call to deliverOrder()
- [ ] Add notification call to cancelOrder()
- [ ] Test order creation sends notification
- [ ] Test order confirmation sends notification

**Code Template**:
```typescript
import { notificationService } from "@/services/notification.service";

export async function createOrder(data: any) {
  const order = await prisma.order.create({ data });
  
  try {
    await notificationService.notifyOrderPlaced(order);
  } catch (error) {
    console.error("Failed to send order placed notification:", error);
  }
  
  return order;
}
```

### Payment Service
**File**: `services/payment.service.ts`

- [ ] Import notificationService
- [ ] Add notification call on payment success
- [ ] Add notification call on payment failure
- [ ] Test payment success sends notification
- [ ] Test payment failure sends notification

**Code Template**:
```typescript
import { notificationService } from "@/services/notification.service";

export async function verifyPayment(reference: string) {
  const paymentData = await paystack.transaction.verify({ reference });
  
  if (paymentData.status === "success") {
    const order = await prisma.order.findFirst({ where: { paymentReference: reference } });
    
    try {
      await notificationService.notifyPaymentSuccess(order, paymentData.amount / 100);
    } catch (error) {
      console.error("Failed to send payment notification:", error);
    }
  }
  
  return paymentData;
}
```

### Product Service
**File**: `services/product.service.ts`

- [ ] Import notificationService
- [ ] Add notification call to approveProduct()
- [ ] Add notification call to rejectProduct()
- [ ] Add notification call to updateProductStock() (out of stock)
- [ ] Add notification call to updateProductStock() (back in stock)
- [ ] Test product approval sends notification
- [ ] Test product rejection sends notification
- [ ] Test out of stock notification
- [ ] Test back in stock notification

### Delivery Service
**File**: `services/order.service.ts` (or delivery-specific)

- [ ] Add notification call when driver is assigned
- [ ] Add notification call when delivery starts
- [ ] Add notification call when delivery completes
- [ ] Test delivery assignment notification
- [ ] Test delivery in-progress notification
- [ ] Test delivery completion notification

### Booking Service (if applicable)
**File**: `services/booking.service.ts`

- [ ] Import notificationService
- [ ] Add notification call to confirmBooking()
- [ ] Add notification call to cancelBooking()
- [ ] Test booking confirmation notification
- [ ] Test booking cancellation notification

---

## Phase 4: Testing

### Local Testing
- [ ] Database migration successful
- [ ] Can register device token from mobile app
- [ ] Device token appears in DeviceToken table
- [ ] Can send test notification: `POST /api/notifications/test`

### Endpoint Testing
```bash
# Test device token registration (requires auth token)
curl -X POST http://localhost:3000/api/users/device-token \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceToken":"ExponentPushToken[xxx]","platform":"ios"}'

# Test fetch notifications
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer TOKEN"

# Test send test notification
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Authorization: Bearer TOKEN"
```

### Database Testing
```sql
-- Check device tokens
SELECT * FROM "DeviceToken" WHERE "isActive" = true;

-- Check notifications
SELECT * FROM "Notification" WHERE "userId" = 'USER_ID' ORDER BY "createdAt" DESC;

-- Count notifications by type
SELECT "type", COUNT(*) as count FROM "Notification" GROUP BY "type";
```

### Service Integration Testing
- [ ] Create order and verify notification is created
- [ ] Process payment and verify notification is sent
- [ ] Approve product and verify supplier notification
- [ ] Reject product and verify supplier notification
- [ ] Update product stock and verify wishlist users are notified
- [ ] Assign delivery driver and verify buyer notification
- [ ] Complete booking and verify customer notification

### Mobile App Testing
- [ ] Mobile app registers device token on startup
- [ ] Test push notification is received on mobile
- [ ] Test tapping notification opens correct screen
- [ ] Test notifications appear in notification center
- [ ] Test can mark notification as read
- [ ] Test can delete notification

---

## Phase 5: Monitoring & Logging

### Add Logging
- [ ] Log device token registration
- [ ] Log notification creation
- [ ] Log push notification sends
- [ ] Log Expo API responses
- [ ] Log errors with full context

### Monitor Endpoints
- [ ] Set up logging for `/api/users/device-token`
- [ ] Set up logging for `/api/notifications`
- [ ] Set up logging for notification service

### Check Logs
- [ ] Device token registrations appear in logs
- [ ] Notifications appear in logs
- [ ] No error messages in logs
- [ ] Performance is acceptable (< 500ms)

---

## Phase 6: Production Deployment

### Pre-Deployment
- [ ] All tests passing
- [ ] No error logs in staging
- [ ] Database backups current
- [ ] Team reviewed code

### Deploy Changes
- [ ] Merge PR to main
- [ ] Run migration on production database
- [ ] Deploy backend changes
- [ ] Monitor logs for errors

### Post-Deployment
- [ ] Test in production environment
- [ ] Monitor push notification delivery rate
- [ ] Monitor error logs
- [ ] Check user feedback

---

## Phase 7: iOS APNs & Android FCM Setup

### iOS APNs Configuration
- [ ] Download APNs key from Apple Developer
- [ ] Upload APNs key to EAS
- [ ] Verify key ID matches
- [ ] Test push notification on iOS device

### Android FCM Configuration
- [ ] Download FCM server API key from Firebase
- [ ] Upload key to EAS
- [ ] Verify project ID matches
- [ ] Test push notification on Android device

### Build for Production
- [ ] Build iOS app: `eas build --platform ios`
- [ ] Build Android app: `eas build --platform android`
- [ ] Test push notifications on production builds
- [ ] Monitor delivery in Firebase Console

---

## Phase 8: Documentation

### Team Documentation
- [ ] Backend team has reviewed backend setup
- [ ] Mobile team has reviewed integration points
- [ ] QA team has testing checklist
- [ ] Ops team has monitoring setup

### Troubleshooting Guide
- [ ] Document common issues and solutions
- [ ] Create runbook for production issues
- [ ] List support contacts

---

## Common Issues & Solutions

### Device tokens not registering
```
1. Check mobile app is authenticated
2. Verify Authorization header contains Bearer token
3. Check network request is succeeding (200 response)
4. Verify userId matches in backend
```

### Push notifications not sending
```
1. Verify DeviceToken exists and isActive=true
2. Check Expo API is reachable (should not be rate limited)
3. Verify token format starts with "ExponentPushToken["
4. Check notification title/body are not empty
5. Verify userId exists in User table
```

### Notifications not appearing on mobile
```
1. Check notification permissions are granted on mobile
2. Verify Expo push token format is correct
3. Check app is not catching exceptions
4. Verify deep link is configured correctly
5. Check device has internet connection
```

### Database migration fails
```
1. Verify DATABASE_URL is set correctly
2. Check database server is running
3. Verify user has permission to create tables
4. Check for existing table name conflicts
5. Try running in isolated transaction
```

---

## Rollback Plan

If issues arise in production:

```sql
-- Disable push notifications temporarily
UPDATE "DeviceToken" SET "isActive" = false;

-- Delete test notifications
DELETE FROM "Notification" WHERE "createdAt" < now() - interval '1 hour';

-- Check migration status
SELECT * FROM "_prisma_migrations" ORDER BY "finishedAt" DESC;
```

## Sign-Off

- [ ] Backend Lead: Implementation verified
- [ ] QA Lead: Testing complete
- [ ] DevOps Lead: Deployment approved
- [ ] Product Lead: Ready for user announcement

---

## Support Contact

**Questions about implementation?**
Refer to:
1. `PUSH_NOTIFICATIONS_QUICK_START.md` - Quick overview
2. `PUSH_NOTIFICATIONS_BACKEND.md` - Complete reference
3. `PUSH_NOTIFICATIONS_INTEGRATION.md` - Code examples
4. Code comments in service files

**Emergency?**
1. Check logs: `pm2 logs`
2. Verify database: `SELECT COUNT(*) FROM "DeviceToken"`
3. Test endpoint: `POST /api/notifications/test`
4. Contact: [Team leads contact info]

---

**Last Updated**: January 22, 2026
**Status**: Ready for Migration & Integration
