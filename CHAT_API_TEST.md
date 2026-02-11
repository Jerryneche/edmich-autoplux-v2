# Chat API Test Guide

## Fixed Issues
1. ✅ **User-Message Relation**: Fixed Prisma schema relation naming conflict between User.messages and Message.sender
2. ✅ **Type Validation**: Added explicit string type checking for participantId and message
3. ✅ **Error Isolation**: Separated error handling for conversation creation and message creation
4. ✅ **Enhanced Logging**: Added detailed error logs with error type and cause

## Test Cases

### Test 1: Valid Request (Create New Conversation)
```bash
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "user-789",
    "message": "Hello! I want to discuss something."
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": {
    "id": "msg-123",
    "conversationId": "conv-456",
    "senderId": "user-123",
    "content": "Hello! I want to discuss something.",
    "read": false,
    "createdAt": "2026-02-11T...",
    "updatedAt": "2026-02-11T...",
    "sender": {
      "id": "user-123",
      "name": "John Doe",
      "image": "..."
    }
  },
  "conversation": {
    "id": "conv-456",
    "isNewConversation": true,
    "participantCount": 2
  }
}
```

### Test 2: Reuse Existing Conversation
Send the same request again with the same participant:

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": { /* new message */ },
  "conversation": {
    "id": "conv-456",
    "isNewConversation": false,
    "participantCount": 2
  }
}
```

### Test 3: Missing Parameter
```bash
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "user-789"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "message must be a non-empty string"
}
```

### Test 4: Self-Messaging
```bash
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "same-user-id",
    "message": "Talking to myself"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Cannot create conversation with yourself"
}
```

### Test 5: Empty Message
```bash
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "user-789",
    "message": "   "
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Message cannot be empty"
}
```

### Test 6: Message Too Long
```bash
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "user-789",
    "message": "[5001 characters]..."
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Message cannot exceed 5000 characters"
}
```

## Server Logs to Check
When testing, check your server logs for:
- `[CHAT API] Created new conversation:`
- `[CHAT API] Using existing conversation:`
- `[CHAT API] POST /conversations error:` (if errors occur)

## What Was Fixed
1. **Schema Relation Fix**: User.messages ↔ Message.sender now properly named with relation "UserMessages"
2. **Type Safety**: ParticipantId and message now validated as strings
3. **Better Error Context**: Each database operation wrapped in try-catch with specific error context
4. **Input Sanitization**: Message trimmed and length validated

## Deploy Notes
- Migration file created: `20260211075304_fix_user_message_relation`
- No breaking changes to API
- Backward compatible - existing conversations will work
