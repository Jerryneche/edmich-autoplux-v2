import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
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

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, message, attachments } = body;

    // Validate conversation ID
    if (!conversationId || typeof conversationId !== "string") {
      return NextResponse.json(
        { error: "conversationId must be a non-empty string" },
        { status: 400 }
      );
    }

    // Validate message or attachments are provided
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    const hasMessage = message && typeof message === "string" && message.trim().length > 0;

    if (!hasMessage && !hasAttachments) {
      return NextResponse.json(
        { error: "Must provide either message text or attachments" },
        { status: 400 }
      );
    }

    // Validate attachments format if provided
    if (hasAttachments) {
      for (const attachment of attachments) {
        if (!attachment.url || !attachment.type || !attachment.name) {
          return NextResponse.json(
            { error: "Each attachment must have url, type, and name" },
            { status: 400 }
          );
        }
      }
    }

    // Verify the conversation exists and user is a participant
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
        { error: "You are not a participant in this conversation" },
        { status: 403 }
      );
    }

    // Prepare message content
    const trimmedMessage = hasMessage ? message.trim() : "";

    // Validate message length (only if message exists)
    if (trimmedMessage.length > 5000) {
      return NextResponse.json(
        { error: "Message cannot exceed 5000 characters" },
        { status: 400 }
      );
    }

    // Create the message
    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: trimmedMessage || null,
        attachments: hasAttachments ? attachments : [],
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
    try {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
    } catch (updateError) {
      console.warn("[CHAT API] Failed to update conversation timestamp:", updateError);
      // Don't fail the request for this
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("[CHAT API] POST /messages error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}