# Admin Panel Backend API Reference

## 1. PAYMENTS QUEUE

### GET /api/admin/payments?status=pending
**Query Parameters:**
- `status`: "pending" | "paid" | "failed" (default: "pending")
- `method`: optional - "transfer" | "cod" (pipe-separated: "transfer|cod")

**Response:**
```json
{
  "success": true,
  "count": 3,
  "payments": [
    {
      "id": "pay_123",
      "status": "pending",
      "method": "transfer",
      "amount": 50000,
      "currency": "NGN",
      "user": {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "order": {
        "id": "order_123",
        "trackingId": "EDM-xxx",
        "total": 50000,
        "paymentStatus": "PENDING",
        "createdAt": "2026-02-14T..."
      },
      "createdAt": "2026-02-14T...",
      "updatedAt": "2026-02-14T..."
    }
  ]
}
```

### PATCH /api/admin/payments?id={paymentId}
**Request Body:**
```json
{
  "status": "PAID" | "FAILED",
  "note": "Optional admin note"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment updated",
  "payment": {
    "id": "pay_123",
    "status": "paid",
    "amount": 50000,
    "method": "transfer",
    "user": { "id": "...", "name": "...", "email": "..." },
    "order": { "id": "...", "trackingId": "..." },
    "verifiedAt": "2026-02-14T..."
  },
  "note": "Optional admin note"
}
```

**Side Effects:**
- If status = "PAID", order.paymentStatus is updated to "PAID" and order.paidAt = now()
- Admin ID and timestamp are logged in backend console

---

## 2. COD CONFIRMATION

### POST /api/admin/orders/:orderId/confirm-cod
**Path Parameters:**
- `orderId`: Order ID (required)

**Request Body:** (empty)

**Response:**
```json
{
  "success": true,
  "message": "COD payment confirmed",
  "order": {
    "id": "order_123",
    "trackingId": "EDM-xxx",
    "total": 50000,
    "status": "PENDING",
    "paymentStatus": "PAID",
    "paidAt": "2026-02-14T...",
    "user": {
      "id": "user_123",
      "name": "John",
      "email": "john@example.com"
    },
    "items": [...]
  },
  "payment": {
    "id": "payment_xxx",
    "method": "COD",
    "status": "paid",
    "amount": 50000
  },
  "confirmedBy": "admin_user_id",
  "confirmedAt": "2026-02-14T..."
}
```

**Validation:**
- Order must exist
- Order.paymentMethod must be "COD"
- Sets order.paymentStatus = "PAID" and order.paidAt = now()
- Creates or updates Payment record for the order

---

## 3. PRODUCTS MODERATION

### GET /api/admin/products?status=pending
**Query Parameters:**
- `status`: "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED" (default: "PENDING")

**Response:**
```json
{
  "success": true,
  "count": 2,
  "status": "PENDING",
  "products": [
    {
      "id": "prod_123",
      "name": "Laptop",
      "description": "High-end laptop",
      "price": 500000,
      "category": "Electronics",
      "stock": 5,
      "image": "https://...",
      "status": "PENDING",
      "supplier": {
        "id": "supplier_123",
        "businessName": "Tech Store",
        "verified": true,
        "approved": true
      },
      "reviews": [...(up to 3)]
    }
  ]
}
```

### PATCH /api/admin/products?id={productId}
**Request Body:**
```json
{
  "status": "ACTIVE" | "INACTIVE" | "PENDING" | "REJECTED"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product approved",
  "product": {
    "id": "prod_123",
    "name": "Laptop",
    "status": "ACTIVE",
    "supplier": {
      "id": "supplier_123",
      "businessName": "Tech Store"
    }
  }
}
```

**Field Names to Match:**
- Response: `product.name`, `product.status`, `product.price`, `product.category`, `product.image`
- Supplier: `supplier.id`, `supplier.businessName`, `supplier.verified`, `supplier.approved`

---

## 4. USER MANAGEMENT

### GET /api/admin/users?status=pending
**Query Parameters:**
- `status`: "pending" | "unverified" (returns unverified users where emailVerified is null)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "status": "pending",
  "users": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "BUYER",
      "emailVerified": null,
      "createdAt": "2026-02-14T...",
      "image": "https://..."
    }
  ]
}
```

### PATCH /api/admin/users?id={userId}
**Request Body:**
```json
{
  "role": "BUYER" | "SUPPLIER" | "MECHANIC" | "LOGISTICS" | "ADMIN",
  "verified": true | false
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "SUPPLIER",
    "emailVerified": "2026-02-14T..." // or null if verified=false
  }
}
```

**Field Names to Match:**
- Query param: `status` (values: "pending", "unverified")
- Request body: `role`, `verified`
- Response: `user.id`, `user.name`, `user.email`, `user.role`, `user.emailVerified`

---

## 5. NOTIFICATIONS/COUNTS

### GET /api/notifications/counts
**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "counts": {
    "orders": 3,
    "messages": 5,
    "products": 2,
    "notifications": 4,
    "home": 1
  }
}
```

**Field Names:**
- `counts.orders`: Pending orders for supplier/mechanic
- `counts.messages`: Unread messages
- `counts.products`: Pending product approvals (admin only)
- `counts.notifications`: Unread notifications
- `counts.home`: Pending payments for admin dashboard

---

## 6. WITHDRAWALS MANAGEMENT

### GET /api/admin/withdrawals?status=pending
**Query Parameters:**
- `status`: "pending" | "processing" | "credited" | "failed"

**Response:**
```json
{
  "success": true,
  "count": 5,
  "status": "pending",
  "withdrawals": [
    {
      "id": "wd_123",
      "userId": "user_123",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "amount": 100000,
      "status": "pending",
      "bankName": "Access Bank",
      "bankCode": "044",
      "accountNumber": "1234567890",
      "accountName": "John Doe",
      "reference": "WD-123456-abcd",
      "initiatedAt": "2026-02-14T...",
      "processedAt": null,
      "processedBy": null
    }
  ]
}
```

### PATCH /api/admin/withdrawals?id={withdrawalId}
**Request Body:**
```json
{
  "status": "pending" | "processing" | "credited" | "failed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal marked as credited",
  "withdrawal": {
    "id": "wd_123",
    "amount": 100000,
    "status": "credited",
    "accountName": "John Doe",
    "accountNumber": "1234567890",
    "processedBy": "admin_user_id",
    "processedAt": "2026-02-14T..."
  }
}
```

**Field Names to Match:**
- Withdrawal: `id`, `userId`, `userName`, `userEmail`, `amount`, `status`, `bankName`, `bankCode`, `reference`
- Bank Details: `accountNumber`, `accountName`, `bankNameCode`, `bankCode`
- Timeline: `initiatedAt`, `processedAt`, `processedBy`

---

## SHIPPING GUARD

### Enforce Server-Side Payment Check
**Endpoint:** PATCH `/api/orders/:id/status`

**Validation:**
If trying to update order status to "SHIPPED" or "OUT_FOR_DELIVERY":
- Check `order.paymentStatus` must be "PAID" or "SUCCESS"
- If not, return 403: `{ "error": "Payment not confirmed" }`

**Request Body:**
```json
{
  "status": "SHIPPED" | "OUT_FOR_DELIVERY" | ..."
}
```

**Response on Payment Block:**
```json
{
  "error": "Payment not confirmed"
}
```
Status Code: **403**

---

## SUMMARY OF FIELD NAMES

### Critical Fields to Verify on Mobile:

**Payments:**
- ✅ Status values: "pending" (lowercase in query), "PAID", "FAILED" (uppercase in request)
- ✅ Method: "transfer" | "cod"
- ✅ Response includes: `payment.status`, `payment.method`, `payment.amount`, `order.trackingId`

**Products:**
- ✅ Status values: "PENDING", "ACTIVE", "INACTIVE", "REJECTED" (uppercase)
- ✅ Response includes: `product.name`, `product.status`, `product.price`, `supplier.businessName`

**Users:**
- ✅ Status query: "pending" | "unverified" (lowercase)
- ✅ Role values: "BUYER", "SUPPLIER", "MECHANIC", "LOGISTICS", "ADMIN"
- ✅ Verified field: boolean (true/false), not "verified"/"unverified"

**Withdrawals:**
- ✅ Status values: "pending", "processing", "credited", "failed" (lowercase)
- ✅ Response includes: `withdrawal.amount`, `withdrawal.accountNumber`, `withdrawal.accountName`, `withdrawal.reference`

**Counts:**
- ✅ Fields: `orders`, `messages`, `products`, `notifications`, `home`

