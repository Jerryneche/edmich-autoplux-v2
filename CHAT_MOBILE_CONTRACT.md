# Chat System Contract (Mobile <-> Backend)
**Date: February 12, 2026**

## Purpose
Define the exact flow, function expectations, payloads, and response shapes used by the mobile app to start and manage 1:1 chats.

**Key Rule:** Chats are between two USER accounts. Supplier profile IDs are metadata only.

---

## Required Identifiers

| Term | Meaning | Example | Usage |
|------|---------|---------|-------|
| **participantId** | Supplier USER id | `user_2` | Required for chat creation (must be a real user id) |
| **supplierId** | Supplier PROFILE id | `supplier_profile_1` | Metadata for linking and display (NOT used for chat) |

**Critical:** Never use `supplierId` as `participantId`. Mobile MUST extract `userId` from the supplier profile first.

---

## Mobile Flow Summary

### Step 1) Product Detail Page -> Start Chat
Mobile function:
```typescript
startChatWithSupplier(productId: string)
```

**Required product payload fields:**
```json
{
  "product": {
    "id": "prod_1",
    "name": "iPhone 14 Pro",
    "supplierId": "supplier_profile_1",
    "supplierUserId": "user_2"  // ← CRITICAL: This is participantId
  }
}
```

**If product.supplierUserId is missing, mobile calls:**
```
GET /api/suppliers/public/:supplierId
```

**Response contains:**
```json
{
  "supplier": { "id": "supplier_profile_1", "userId": "supplier_user_id" },
  "contact": { "userId": "supplier_user_id" }
}
```

Extract `userId` from response → use as `participantId`.

---

## API Endpoints

### A) Create or Reuse Conversation + Send Initial Message

**Endpoint:**
```
POST /api/chat/conversations
```

**Request body:**
```json
{
  "participantId": "USER_ID_OF_SUPPLIER",
  "message": "Hi, I'm interested in iPhone 14 Pro.",
  "productId": "prod_1",
  "productImage": "https://example.com/product.jpg",
  "itemImage": "https://example.com/item.jpg",
  "supplierId": "supplier_profile_1"
}
```

**Behavior:**
- If a conversation already exists between the two users, reuse it.
- If not, create a new one.
- Save product context (productId, images, supplierId) on the conversation.
- Create and return the initial message.

**Response (200 OK):**
```json
{
  "success": true,
  "message": {
    "id": "msg_123",
    "conversationId": "conv_123",
    "senderId": "current_user_id",
    "content": "Hi, I'm interested in iPhone 14 Pro.",
    "read": false,
    "createdAt": "2026-02-12T21:35:20Z",
    "updatedAt": "2026-02-12T21:35:20Z",
    "sender": {
      "id": "current_user_id",
      "name": "John Doe",
      "image": "https://..."
    }
  },
  "conversation": {
    "id": "conv_123",
    "productId": "prod_1",
    "productImage": "https://example.com/product.jpg",
    "itemImage": "https://example.com/item.jpg",
    "supplierId": "supplier_profile_1"
  }
}
```

**Error responses:**

| Status | Response | Meaning |
|--------|----------|---------|
| 400 | `{ "error": "Participant ID is required" }` | `participantId` parameter missing |
| 400 | `{ "error": "Message content is required" }` | `message` is empty or missing |
| 401 | `{ "error": "Unauthorized" }` | No valid JWT/session token |
| 404 | `{ "error": "Current user not found" }` | User account doesn't exist in database |
| 404 | `{ "error": "Participant not found" }` | Target user (supplier) doesn't exist |
| 500 | `{ "error": "Failed to send message" }` | Server error during message creation |

---

### B) Send Message in Existing Conversation

**Endpoint:**
```
POST /api/chat/messages
```

**Request body:**
```json
{
  "conversationId": "conv_123",
  "message": "What's your lowest price?",
  "attachments": [
    { "url": "https://...", "type": "image", "name": "photo.jpg" }
  ]
}
```

**Behavior:**
- Send a message in an existing conversation.
- Verify user is a participant in the conversation.
- Update conversation's `updatedAt` timestamp.

**Response (200 OK):**
```json
{
  "success": true,
  "message": {
    "id": "msg_456",
    "conversationId": "conv_123",
    "senderId": "current_user_id",
    "content": "What's your lowest price?",
    "read": false,
    "createdAt": "2026-02-12T21:36:00Z",
    "updatedAt": "2026-02-12T21:36:00Z",
    "sender": {
      "id": "current_user_id",
      "name": "John Doe",
      "image": "https://..."
    }
  }
}
```

**Error responses:**

| Status | Response | Meaning |
|--------|----------|---------|
| 400 | `{ "error": "Conversation ID is required" }` | `conversationId` parameter missing |
| 400 | `{ "error": "Message content is required" }` | `message` is empty or missing |
| 401 | `{ "error": "Unauthorized" }` | No valid JWT/session token |
| 403 | `{ "error": "Not a participant in this conversation" }` | You're not in this conversation |
| 404 | `{ "error": "Conversation not found" }` | Conversation doesn't exist |
| 500 | `{ "error": "Failed to send message" }` | Server error during message creation |

---

### C) Get All Conversations for Current User

**Endpoint:**
```
GET /api/chat/conversations
```

**Request headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (200 OK):**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "conv_123",
      "updatedAt": "2026-02-12T21:36:00Z",
      "participants": [
        {
          "id": "part_1",
          "conversationId": "conv_123",
          "userId": "current_user_id",
          "joinedAt": "2026-02-12T21:00:00Z",
          "user": {
            "id": "current_user_id",
            "name": "John Doe",
            "image": "https://..."
          }
        },
        {
          "id": "part_2",
          "conversationId": "conv_123",
          "userId": "supplier_user_id",
          "joinedAt": "2026-02-12T21:00:00Z",
          "user": {
            "id": "supplier_user_id",
            "name": "Tech Store",
            "image": "https://..."
          }
        }
      ],
      "latestMessage": {
        "id": "msg_996",
        "conversationId": "conv_123",
        "senderId": "supplier_user_id",
        "content": "Sure! I can offer 10% discount.",
        "read": false,
        "createdAt": "2026-02-12T21:36:00Z",
        "updatedAt": "2026-02-12T21:36:00Z"
      },
      "productId": "prod_1",
      "productImage": "https://example.com/product.jpg",
      "itemImage": "https://example.com/item.jpg",
      "supplierId": "supplier_profile_1"
    }
  ]
}
```

**Error responses:**

| Status | Response | Meaning |
|--------|----------|---------|
| 401 | `{ "error": "Unauthorized" }` | No valid JWT/session token |
| 500 | `{ "error": "Failed to fetch conversations" }` | Server error |

---

### D) Supplier Public Profile (Fallback Lookup)

**Endpoint:**
```
GET /api/suppliers/public/:supplierId
```

**Response (200 OK) - Includes userId in contact:**
```json
{
  "supplier": {
    "id": "supplier_profile_1",
    "businessName": "Tech Store",
    "description": "Electronics and gadgets",
    "city": "Lagos",
    "state": "Lagos",
    "verified": true,
    "createdAt": "2026-01-01T00:00:00Z",
    "tagline": "Best prices guaranteed",
    "website": "https://techstore.com",
    "logo": "https://..."
  },
  "contact": {
    "userId": "supplier_user_id",  // ← USE THIS as participantId
    "name": "Tech Store Owner",
    "email": "owner@techstore.com",
    "phone": "+234 800 000 0000",
    "image": "https://..."
  },
  "products": [ /* array of products */ ],
  "stats": { /* stats */ }
}
```

---

## Backend Implementation Requirements

1. **participantId must map to a real user id** in the database.
2. **supplierId is metadata only** - never use as foreign key for chat relationship.
3. **If conversation exists** between two user ids, reuse it.
4. **If new conversation**, create one and attach product context.
5. **Always save** productId, productImage, itemImage, supplierId when creating conversation.
6. **Include latestMessage** in GET /conversations response (avoid extra fetch on mobile).
7. **Update updatedAt** on conversation after every message.

---

## Mobile Expectations & Validation

### Client-Side Validation (Before Sending Request)

```typescript
// Before calling POST /api/chat/conversations
if (!participantId || participantId.trim() === "") {
  // Show error: "Participant ID required"
  return;
}

if (!message || message.trim() === "") {
  // Show error: "Message cannot be empty"
  return;
}

if (message.trim().length > 5000) {
  // Show error: "Message too long (max 5000 chars)"
  return;
}
```

### Handling API Responses

```typescript
// Always include Authorization header
const headers = {
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json'
};

// Handle 404 - Participant not found
if (response.status === 404) {
  // This user doesn't exist or was deleted
  showError("User not found. Cannot start chat.");
  return;
}

// Handle 401 - Token invalid/expired
if (response.status === 401) {
  // Redirect to login
  navigateToLogin();
  return;
}

// Handle 400 - Bad request
if (response.status === 400) {
  const data = await response.json();
  showError(data.error); // Show backend error message
  return;
}
```

---

## Quick Debug Checklist

**If chat creation fails:**

- ✅ Confirm `participantId` is a valid user ID (not supplier profile ID)
- ✅ Confirm user exists in database: `SELECT * FROM "User" WHERE id = ?`
- ✅ Confirm JWT token is valid and not expired
- ✅ Confirm message is not empty
- ✅ Call `/api/suppliers/public/:id` to verify userId is in response

**If message sending fails:**

- ✅ Confirm `conversationId` exists in database
- ✅ Confirm current user is a participant in the conversation
- ✅ Confirm message is not empty

**If conversation list is empty:**

- ✅ Confirm user has participated in at least one conversation
- ✅ Confirm JWT token matches the correct user ID

---

## Example Mobile Implementation

### Function: Start Chat with Supplier

```typescript
async function startChatWithSupplier(
  productId: string,
  product: Product,
  jwtToken: string
): Promise<ChatConversation> {
  // Step 1: Get supplier user ID
  let supplierUserId = product.supplierUserId;

  if (!supplierUserId) {
    // Fallback: Fetch from public supplier endpoint
    const supplierResponse = await fetch(
      `https://www.edmich.com/api/suppliers/public/${product.supplierId}`,
      { headers: { 'Authorization': `Bearer ${jwtToken}` } }
    );
    const { contact } = await supplierResponse.json();
    supplierUserId = contact.userId;
  }

  // Step 2: Create conversation and send message
  const response = await fetch(
    'https://www.edmich.com/api/chat/conversations',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        participantId: supplierUserId,
        message: `Hi, I'm interested in ${product.name}. What's the best price?`,
        productId: product.id,
        productImage: product.image,
        itemImage: product.images?.[0],
        supplierId: product.supplierId
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const { message, conversation } = await response.json();
  return conversation;
}
```

---

## Example Curl Commands

### Create conversation:
```bash
curl -X POST "https://www.edmich.com/api/chat/conversations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "user_2",
    "message": "Hi, interested in this product!",
    "productId": "prod_1",
    "productImage": "https://example.com/product.jpg",
    "itemImage": "https://example.com/item.jpg",
    "supplierId": "supplier_profile_1"
  }'
```

### Send message:
```bash
curl -X POST "https://www.edmich.com/api/chat/messages" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv_123",
    "message": "What'\''s your lowest price?"
  }'
```

### Get conversations:
```bash
curl -X GET "https://www.edmich.com/api/chat/conversations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get supplier public profile:
```bash
curl -X GET "https://www.edmich.com/api/suppliers/public/supplier_profile_1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Common Mistakes to Avoid

❌ **Don't use supplierId as participantId**
```typescript
// WRONG:
fetch('/api/chat/conversations', {
  body: JSON.stringify({
    participantId: product.supplierId,  // ← This is WRONG!
    message: "Hi"
  })
});

// CORRECT:
fetch('/api/chat/conversations', {
  body: JSON.stringify({
    participantId: product.supplierUserId,  // ← Use USER id
    message: "Hi"
  })
});
```

❌ **Don't forget JWT token**
```typescript
// WRONG:
fetch('/api/chat/conversations'); // No Authorization header

// CORRECT:
fetch('/api/chat/conversations', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

❌ **Don't send empty messages**
```typescript
// WRONG:
fetch('/api/chat/messages', {
  body: JSON.stringify({
    conversationId: "conv_123",
    message: ""  // ← Empty!
  })
});

// CORRECT:
const message = userInput.trim();
if (!message) {
  showError("Message cannot be empty");
  return;
}
fetch('/api/chat/messages', {
  body: JSON.stringify({
    conversationId: "conv_123",
    message: message
  })
});
```

❌ **Don't hardcode user IDs**
```typescript
// WRONG:
const userId = "user_123";  // Hardcoded

// CORRECT:
const userId = jwtToken.decode().sub;  // From JWT
```

---

## Future Enhancements

These endpoints should be implemented in the future:

- **GET /api/chat/conversations/{conversationId}** - Fetch full message history with pagination
- **GET /api/chat/messages** - Get paginated messages (limit, offset)
- **PUT /api/chat/messages/{messageId}** - Edit a message
- **DELETE /api/chat/messages/{messageId}** - Delete a message
- **PUT /api/chat/messages/{messageId}/read** - Mark as read
- **WebSocket /ws/chat** - Real-time message delivery (instead of polling)

---

## Testing

### Postman Collection

1. **Create conversation:**
   - Method: POST
   - URL: `https://www.edmich.com/api/chat/conversations`
   - Headers: `Authorization: Bearer YOUR_TOKEN`
   - Body (JSON):
     ```json
     {
       "participantId": "user_id",
       "message": "Hello",
       "productId": "prod_1",
       "supplierId": "supplier_1"
     }
     ```

2. **Get all conversations:**
   - Method: GET
   - URL: `https://www.edmich.com/api/chat/conversations`
   - Headers: `Authorization: Bearer YOUR_TOKEN`

---

## Questions?

**For API issues:** Check error responses table in each endpoint section.

**For authentication:** Refer to the Authorization header requirement in each endpoint.

**For data structure:** Check the Request/Response JSON examples.

**Key Rule to Remember:** `participantId` = USER ID, `supplierId` = PROFILE ID (metadata only).

---

**Last Updated:** February 12, 2026
**Version:** 1.0
