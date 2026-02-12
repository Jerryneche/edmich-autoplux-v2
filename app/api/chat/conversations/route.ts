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
          select: {
            id: true,
            content: true,
            attachments: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
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
    console.log("[CHAT API] ========== POST /conversations START ==========");
    
    const user = await getAuthUser(request);
    console.log("[CHAT API] Authenticated user ID:", user?.id);
    
    if (!user?.id) {
      console.error("[CHAT API] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { participantId, message, productId, productImage, itemImage, attachments } = body;
    
    console.log("[CHAT API] Request body:", {
      participantIdFromRequest: participantId,
      productIdFromRequest: productId,
      messageLength: message?.length,
      attachmentCount: attachments?.length || 0,
    });

    // ✅ VALIDATION: Check required fields
    if (!participantId || typeof participantId !== "string") {
      return NextResponse.json(
        { error: "participantId must be a non-empty string" },
        { status: 400 }
      );
    }

    // ✅ VALIDATION: Message or attachments required
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    const hasMessage = message && typeof message === "string" && message.trim().length > 0;

    if (!hasMessage && !hasAttachments) {
      return NextResponse.json(
        { error: "Must provide either message text or attachments" },
        { status: 400 }
      );
    }

    // ✅ VALIDATION: Validate attachments format if provided
    if (hasAttachments) {
      for (const attachment of attachments) {
        if (!attachment.url || !attachment.type || !attachment.name) {
          return NextResponse.json(
            { error: "Each attachment must have url, type, and name" },
            { status: 400 }
          );
        }
      }
      console.log("[CHAT API] Validated attachments:", {
        count: attachments.length,
        types: attachments.map((a: any) => a.type),
      });
    }

    // ✅ RESOLVE participantId: Could be User ID or SupplierProfile ID
    // First check if it's a direct User ID
    let resolvedParticipantId = participantId;
    let participantUser = await prisma.user.findUnique({
      where: { id: participantId },
      select: { id: true, role: true },
    });

    // If not found as User, try as SupplierProfile ID
    if (!participantUser) {
      const supplierProfile = await prisma.supplierProfile.findUnique({
        where: { id: participantId },
        select: { userId: true },
      });

      if (supplierProfile) {
        resolvedParticipantId = supplierProfile.userId;
        console.log("[CHAT API] Resolved SupplierProfile ID to User ID:", {
          supplierProfileId: participantId,
          resolvedUserId: resolvedParticipantId,
        });
      } else {
        return NextResponse.json(
          {
            error: `Participant not found (neither User ID nor SupplierProfile ID)`,
          },
          { status: 404 }
        );
      }
    }

    // ✅ VALIDATION: Prevent self-messaging
    if (resolvedParticipantId === user.id) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      );
    }

    // ✅ Prepare message content
    const trimmedMessage = hasMessage ? message.trim() : "";

    // Validate message length (only if message exists)
    if (trimmedMessage.length > 5000) {
      return NextResponse.json(
        { error: "Message cannot exceed 5000 characters" },
        { status: 400 }
      );
    }

    console.log("[CHAT API] About to create/find conversation with:", {
      currentUserId: user.id,
      originalParticipantId: participantId,
      resolvedParticipantId: resolvedParticipantId,
      productId: productId,
    });

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
              some: { userId: resolvedParticipantId },
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            attachments: true,
            createdAt: true,
            sender: {
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
            productId: productId || undefined,
            productImage: productImage || undefined,
            itemImage: itemImage || undefined,
            participants: {
              create: [
                { userId: user.id },
                { userId: resolvedParticipantId },
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
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                content: true,
                attachments: true,
                createdAt: true,
                sender: {
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
          currentUserId: user.id,
          participantId: participantId,
          productId: productId,
        });
      } catch (convError) {
        console.error("[CHAT API] Failed to create conversation:", {
          currentUserId: user.id,
          participantIdBeingAdded: participantId,
          productIdRequested: productId,
          errorMessage: convError instanceof Error ? convError.message : String(convError),
          errorCode: convError instanceof Error && 'code' in convError ? (convError as any).code : undefined,
        });
        return NextResponse.json(
          { 
            error: "Failed to create conversation",
            debug: {
              userId: user.id,
              participantId: participantId,
              productId: productId,
            }
          },
          { status: 500 }
        );
      }
    } else {
      console.log("[CHAT API] Using existing conversation:", {
        conversationId: conversation.id,
        currentUserId: user.id,
        participantId: participantId,
        productId: productId,
      });
    }

    // ✅ Create message in conversation
    let newMessage;
    try {
      newMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
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
    
    console.log("[CHAT API] ========== POST /conversations SUCCESS ==========");
  } catch (error) {
    console.error("[CHAT API] POST /conversations FATAL ERROR:", {
      message: error instanceof Error ? error.message : String(error),
      code: error instanceof Error && 'code' in error ? (error as any).code : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
