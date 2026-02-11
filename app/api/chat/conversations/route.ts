import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-api";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ success: true, conversations });
  } catch (error) {
    console.error("[CHAT API] GET /conversations error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
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

    const { participantId, message } = await request.json();

    // ✅ VALIDATION: Check required fields
    if (!participantId || !message) {
      return NextResponse.json(
        { error: "participantId and message are required" },
        { status: 400 }
      );
    }

    // ✅ VALIDATION: Prevent self-messaging
    if (participantId === user.id) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      );
    }

    // ✅ VALIDATION: Trim and check message isn't empty
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    // ✅ CHECK FOR EXISTING CONVERSATION - prevent duplicates
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { userId: user.id },
            },
          },
          {
            participants: {
              some: { userId: participantId },
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    let isNewConversation = false;

    if (!conversation) {
      // Create new conversation explicitly with participants
      isNewConversation = true;
      
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            createMany: {
              data: [
                { userId: user.id },
                { userId: participantId },
              ],
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      console.log("[CHAT API] Created new conversation:", {
        conversationId: conversation.id,
        users: [user.id, participantId],
      });
    } else {
      console.log("[CHAT API] Found existing conversation:", {
        conversationId: conversation.id,
        users: [user.id, participantId],
      });
    }

    // Create message
    const newMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        content: trimmedMessage,
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
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      {
        success: true,
        message: newMessage,
        conversation: {
          id: conversation.id,
          isNewConversation,
          participantCount: conversation.participants.length,
        },
      },
      { status: isNewConversation ? 201 : 200 }
    );
  } catch (error) {
    console.error("[CHAT API] POST /conversations error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined,
    });
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
