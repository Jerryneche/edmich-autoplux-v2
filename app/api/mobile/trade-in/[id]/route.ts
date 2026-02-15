// app/api/mobile/trade-in/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

// GET - Get single trade-in details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tradeIn = await prisma.tradeIn.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!tradeIn) {
      return NextResponse.json(
        { error: "Trade-in not found" },
        { status: 404 },
      );
    }

    // Only allow owner to view
    if (tradeIn.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ tradeIn }, { status: 200 });
  } catch (error: any) {
    console.error("[TRADE-IN GET BY ID] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch trade-in" },
      { status: 500 },
    );
  }
}

// PATCH - Update trade-in (for user to cancel)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    const tradeIn = await prisma.tradeIn.findUnique({
      where: { id },
    });

    if (!tradeIn) {
      return NextResponse.json(
        { error: "Trade-in not found" },
        { status: 404 },
      );
    }

    // Only owner can modify
    if (tradeIn.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Handle different actions
    switch (action) {
      case "CANCEL":
        if (tradeIn.status !== "PENDING") {
          return NextResponse.json(
            { error: "Cannot cancel at this stage" },
            { status: 400 },
          );
        }

        const cancelledTradeIn = await prisma.tradeIn.update({
          where: { id },
          data: { status: "CANCELLED" },
        });
        return NextResponse.json({
          message: "Trade-in cancelled",
          tradeIn: cancelledTradeIn,
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[TRADE-IN PATCH] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update trade-in" },
      { status: 500 },
    );
  }
}

// DELETE - Delete trade-in (only if pending)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tradeIn = await prisma.tradeIn.findUnique({
      where: { id },
    });

    if (!tradeIn) {
      return NextResponse.json(
        { error: "Trade-in not found" },
        { status: 404 },
      );
    }

    if (tradeIn.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (tradeIn.status !== "PENDING") {
      return NextResponse.json(
        { error: "Can only delete pending trade-ins" },
        { status: 400 },
      );
    }

    await prisma.tradeIn.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Trade-in deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[TRADE-IN DELETE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete trade-in" },
      { status: 500 },
    );
  }
}
