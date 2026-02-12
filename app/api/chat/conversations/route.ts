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

    // Transform to match contract: latestMessage instead of messages array
    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      updatedAt: conv.updatedAt,
      participants: conv.participants,
      latestMessage: conv.messages[0] || null,
      productId: conv.productId,
      productImage: conv.productImage,
      itemImage: conv.itemImage,
      supplierId: conv.supplierId,
    }));

    return NextResponse.json({ success: true, conversations: formattedConversations });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
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

    const { participantId, message, productId, productImage, itemImage, supplierId } = await request.json();

    if (!participantId) {
      return NextResponse.json(
        { error: "Participant ID is required" },
        { status: 400 }
      );
    }

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Validate that both users exist
    const [currentUserExists, participantExists] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.id } }),
      prisma.user.findUnique({ where: { id: participantId } }),
    ]);

    if (!currentUserExists) {
      return NextResponse.json(
        { error: "Current user not found" },
        { status: 404 }
      );
    }

    if (!participantExists) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Create or get existing conversation
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
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId: user.id }, { userId: participantId }],
          },
          // Save product context
          productId: productId || null,
          productImage: productImage || null,
          itemImage: itemImage || null,
          supplierId: supplierId || null,
        },
      });
    }

    // Create message
    const newMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        content: message,
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

    // Return response with conversation object
    return NextResponse.json({
      success: true,
      message: newMessage,
      conversation: {
        id: conversation.id,
        productId: conversation.productId,
        productImage: conversation.productImage,
        itemImage: conversation.itemImage,
        supplierId: conversation.supplierId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
