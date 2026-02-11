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
      console.error("[CHAT API] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { participantId, message } = body;

    // ✅ VALIDATION: Check required fields
    if (!participantId || typeof participantId !== "string") {
      return NextResponse.json(
        { error: "participantId must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "message must be a non-empty string" },
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

    // Validate message length
    if (trimmedMessage.length > 5000) {
      return NextResponse.json(
        { error: "Message cannot exceed 5000 characters" },
        { status: 400 }
      );
    }

    // ✅ CHECK FOR EXISTING CONVERSATION - prevent duplicates
    const existingConversation = await prisma.conversation.findFirst({
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

    let conversation = existingConversation;
    let isNewConversation = false;

    if (!conversation) {
      // Create new conversation with participants
      isNewConversation = true;
      
      try {
        conversation = await prisma.conversation.create({
          data: {
            participants: {
              create: [
                { userId: user.id },
                { userId: participantId },
              ],
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
          participants: [user.id, participantId],
        });
      } catch (convError) {
        console.error("[CHAT API] Failed to create conversation:", convError);
        return NextResponse.json(
          { error: "Failed to create conversation" },
          { status: 500 }
        );
      }
    } else {
      console.log("[CHAT API] Using existing conversation:", {
        conversationId: conversation.id,
      });
    }

    // ✅ Create message in conversation
    let newMessage;
    try {
      newMessage = await prisma.message.create({
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
    } catch (msgError) {
      console.error("[CHAT API] Failed to create message:", msgError);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    // Update conversation timestamp
    try {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    } catch (updateError) {
      console.warn("[CHAT API] Failed to update conversation timestamp:", updateError);
      // Don't fail the request for this
    }

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
      type: error instanceof Error ? error.constructor.name : typeof error,
    });
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
