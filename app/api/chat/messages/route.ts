import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper to get user from either JWT (mobile) or session (web)
async function getCurrentUser(request: NextRequest) {
  // Try JWT first (mobile)
  const authUser = await getAuthUser(request);
  if (authUser) return authUser;

  // Fall back to session (web)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { id: session.user.id, role: session.user.role };
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID required" },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    console.log("[CHAT-MSG] GET messages", {
      conversationId,
      messageCount: messages.length,
      attachmentsSample: messages.slice(0, 2).map((m) => ({
        id: m.id,
        attachments: m.attachments,
      })),
    });

    // Format messages to ensure attachments are arrays
    const formattedMessages = messages.map((msg) => ({
      ...msg,
      attachments: Array.isArray(msg.attachments) ? msg.attachments : [],
    }));

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true, messages: formattedMessages });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, message, attachments } = await request.json();

    console.log("[CHAT-MSG] POST request received", {
      conversationId,
      messageLength: message?.length || 0,
      attachmentsCount: Array.isArray(attachments) ? attachments.length : 0,
      attachments: attachments,
    });

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Verify conversation exists and user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          where: { userId: user.id },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.participants.length === 0) {
      return NextResponse.json(
        { error: "Not a participant in this conversation" },
        { status: 403 }
      );
    }

    // Validate attachments if provided
    let validatedAttachments: any[] = [];
    if (attachments && Array.isArray(attachments)) {
      validatedAttachments = attachments.filter(
        (att) => att.url && att.type && att.name
      );
    }
    console.log("[CHAT-MSG] Attachments validation", {
      rawCount: Array.isArray(attachments) ? attachments.length : 0,
      validatedCount: validatedAttachments.length,
      validated: validatedAttachments,
    });

    // Create message with attachments
    const newMessage = await prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: user.id,
        content: message,
        attachments: validatedAttachments,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
