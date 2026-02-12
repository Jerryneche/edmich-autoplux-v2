# Chat System Guide for Mobile Team

## Overview

The chat system allows users to have one-on-one conversations. It's built on three main database tables:
- **Conversation** - The chat thread between two users
- **ConversationParticipant** - Links users to conversations
- **Message** - Individual messages in a conversation

## How Chat Works

### Key Concept: One Conversation Between Two Users

Each conversation represents a **one-on-one chat between exactly 2 users**. When you start chatting with someone, the system:
1. **Checks** if a conversation already exists between you and that person
2. **Creates** a new conversation if one doesn't exist
3. **Uses** the existing conversation if found
4. **Adds messages** to that conversation

**Example:**
- User A and User B chat → creates Conversation 1
- Later, User A and User B chat again → uses same Conversation 1 (not a new one)
- User A and User C chat → creates Conversation 2

## API Endpoints

### 1. GET /api/chat/conversations
**Get all conversations for the current user**

**Request:**
```bash
GET /api/chat/conversations
Authorization: Bearer {JWT_TOKEN}  # Mobile
# OR Session cookie (Web)
```

**Response (200 OK):**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "conv_123",
      "title": null,
      "createdAt": "2026-02-12T21:00:00Z",
      "updatedAt": "2026-02-12T21:35:15Z",
      "participants": [
        {
          "id": "part_1",
          "conversationId": "conv_123",
          "userId": "user_1",
          "joinedAt": "2026-02-12T21:00:00Z",
          "user": {
            "id": "user_1",
            "name": "John Doe",
            "image": "https://..."
          }
        },
        {
          "id": "part_2",
          "conversationId": "conv_123",
          "userId": "user_2",
          "joinedAt": "2026-02-12T21:00:00Z",
          "user": {
            "id": "user_2",
            "name": "Jane Smith",
            "image": "https://..."
          }
        }
      ],
      "messages": [
        {
          "id": "msg_999",
          "conversationId": "conv_123",
          "senderId": "user_2",
          "content": "Hey, how are you?",
          "read": false,
          "createdAt": "2026-02-12T21:35:15Z",
          "updatedAt": "2026-02-12T21:35:15Z"
        }
      ]
    }
  ]
}
```

**Error Responses:**
- **401 Unauthorized** - No JWT token or session
  ```json
  { "error": "Unauthorized" }
  ```
- **500 Server Error** - Database issue
  ```json
  { "error": "Failed to fetch conversations" }
  ```

---

### 2. POST /api/chat/conversations
**Create or use existing conversation and send a message**

**Request:**
```bash
POST /api/chat/conversations
Authorization: Bearer {JWT_TOKEN}  # Mobile
Content-Type: application/json

{
  "participantId": "user_2",    # The ID of the person you want to chat with
  "message": "Hello there!"     # The message content
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": {
    "id": "msg_1001",
    "conversationId": "conv_123",
    "senderId": "user_1",
    "content": "Hello there!",
    "read": false,
    "createdAt": "2026-02-12T21:35:20Z",
    "updatedAt": "2026-02-12T21:35:20Z",
    "sender": {
      "id": "user_1",
      "name": "John Doe",
      "image": "https://..."
    }
  }
}
```

**Error Responses:**

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | `{ "error": "Participant ID is required" }` | You didn't provide `participantId` |
| 400 | `{ "error": "Message content is required" }` | You didn't provide `message` or it's empty |
| 401 | `{ "error": "Unauthorized" }` | No JWT token or session |
| 404 | `{ "error": "Current user not found" }` | Your user account doesn't exist in database |
| 404 | `{ "error": "Participant not found" }` | The person you're trying to message doesn't exist |
| 500 | `{ "error": "Failed to send message" }` | Database error during message creation |

---

## Mobile Team Implementation Guide

### Step 1: Get JWT Token (Authentication)

After user logs in, store the JWT token from the login response:

```javascript
// After successful login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
const { token } = await loginResponse.json();
// Save token to secure storage (AsyncStorage, Keychain, etc.)
```

### Step 2: Fetch All Conversations

```javascript
async function getConversations(token) {
  const response = await fetch('https://www.edmich.com/api/chat/conversations', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 401) {
    // Token expired or invalid - redirect to login
    return;
  }
  
  const data = await response.json();
  return data.conversations;
}
```

### Step 3: Display Conversation List

Each conversation has:
- **participants** - Array of 2 users in the conversation
  - Find the OTHER user (not yourself) to display in the list
  - Use their `name` and `image` for the conversation preview
- **messages** - Last message in the conversation (for preview)
- **updatedAt** - Most recent activity time

```javascript
// In your conversation list UI
conversations.forEach(conv => {
  // Find the other participant (not the current user)
  const otherUser = conv.participants.find(p => p.userId !== currentUserId);
  
  // Display info
  const lastMessage = conv.messages[0]; // Most recent message first
  
  console.log(`Chat with: ${otherUser.user.name}`);
  console.log(`Last message: ${lastMessage.content}`);
  console.log(`Last activity: ${conv.updatedAt}`);
});
```

### Step 4: Send a Message

```javascript
async function sendMessage(token, participantId, messageText) {
  const response = await fetch('https://www.edmich.com/api/chat/conversations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      participantId: participantId,  // ID of the person you're messaging
      message: messageText            // The message text
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error(`Error: ${errorData.error}`);
    return null;
  }
  
  const data = await response.json();
  return data.message;  // The newly created message
}
```

### Step 5: Fetch Messages for a Conversation

**NOTE:** There's no dedicated GET endpoint for individual conversation messages yet. 
**Workaround:** Use GET /api/chat/conversations and filter the response:

```javascript
async function getConversationMessages(token, conversationId) {
  const response = await fetch('https://www.edmich.com/api/chat/conversations', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  const conversation = data.conversations.find(c => c.id === conversationId);
  
  // Note: This only returns the LAST message
  // For full message history, you need a new endpoint: /api/chat/messages/{conversationId}
  return conversation.messages;
}
```

---

## Important Notes for Mobile Team

### ✅ What You Should Do

1. **Always include JWT token** in the Authorization header:
   ```
   Authorization: Bearer {token}
   ```

2. **Validate inputs before sending:**
   - Check that `participantId` is not empty
   - Check that `message` is not empty/whitespace
   - Trim whitespace from message: `message.trim()`

3. **Handle errors gracefully:**
   - 404 = User/Participant not found (show error alert)
   - 400 = Invalid input (validate client-side before sending)
   - 401 = Token expired (redirect to login)
   - 500 = Server error (show "Try again later")

4. **Display participant info correctly:**
   - In conversation list, show the OTHER user's name/image
   - In chat screen, show messages with sender info

### ❌ Common Mistakes to Avoid

1. **Don't send empty messages** - Always validate message is not empty
2. **Don't hardcode user IDs** - Always use the authenticated user's ID from token
3. **Don't forget the JWT token** - All requests need Authorization header
4. **Don't assume conversation exists** - Use GET endpoint first to check

### 🔄 Real-time Updates (Future)

Currently, you need to **poll** the GET endpoint periodically to get new messages:
```javascript
// Poll every 3 seconds
setInterval(() => getConversations(token), 3000);
```

**Future enhancement:** WebSocket support for real-time messages

---

## Database Schema Reference

```
Conversation
├── id (String, @id)
├── title (String?, nullable)
├── createdAt (DateTime)
├── updatedAt (DateTime)
├── participants (ConversationParticipant[]) - 2 users
└── messages (Message[]) - All messages in conversation

ConversationParticipant
├── id (String, @id)
├── conversationId (String, FK)
├── userId (String, FK)
├── joinedAt (DateTime)
└── user (User) - The participant user

Message
├── id (String, @id)
├── conversationId (String, FK)
├── senderId (String, FK)
├── content (String)
├── read (Boolean, default: false)
├── createdAt (DateTime)
├── updatedAt (DateTime)
└── sender (User)
```

---

## Missing Endpoints (To Be Implemented)

**These would improve the chat experience:**

1. **GET /api/chat/conversations/{conversationId}**
   - Fetch full message history for a conversation
   - Support pagination (limit, offset)

2. **GET /api/chat/messages**
   - Get paginated messages for a conversation
   - Filter by conversationId, limit, offset

3. **PUT /api/chat/messages/{messageId}**
   - Edit a message you sent

4. **DELETE /api/chat/messages/{messageId}**
   - Delete a message you sent

5. **PUT /api/chat/messages/{messageId}/read**
   - Mark a message as read

6. **WebSocket /ws/chat**
   - Real-time message delivery (instead of polling)

---

## Testing the API

### With cURL:

```bash
# Get conversations
curl -X GET "https://www.edmich.com/api/chat/conversations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Send message
curl -X POST "https://www.edmich.com/api/chat/conversations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "user_2_id_here",
    "message": "Hello!"
  }'
```

### With Postman:

1. Create new POST request to `https://www.edmich.com/api/chat/conversations`
2. Go to Headers tab, add:
   - Key: `Authorization`
   - Value: `Bearer YOUR_JWT_TOKEN`
3. Go to Body tab, select "raw" and "JSON"
4. Paste:
   ```json
   {
     "participantId": "user_2_id_here",
     "message": "Test message"
   }
   ```
5. Click Send

---

## Questions?

If the mobile team has questions about:
- **API behavior** - Check error responses section
- **Authentication** - JWT token must be in Authorization header
- **Data structure** - Refer to Database Schema Reference
- **Implementation** - Check Mobile Team Implementation Guide

**Key Rule:** Always capture participantId before sending a message - this determines who you're chatting with!
