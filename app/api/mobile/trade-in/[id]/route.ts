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
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tradeIn = await prisma.tradeIn.findUnique({
      where: { id: params.id },
      include: {
        supplier: {
          select: {
            id: true,
            businessName: true,
            city: true,
            state: true,
            phone: true,
          },
        },
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

    // Only allow owner or assigned supplier to view
    if (tradeIn.userId !== user.id && tradeIn.supplierId !== user.id) {
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

// PATCH - Update trade-in (for user to cancel or supplier to make offer)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, offerAmount, offerNote, responseNote } = body;

    const tradeIn = await prisma.tradeIn.findUnique({
      where: { id: params.id },
    });

    if (!tradeIn) {
      return NextResponse.json(
        { error: "Trade-in not found" },
        { status: 404 },
      );
    }

    // Handle different actions
    switch (action) {
      case "CANCEL":
        // Only owner can cancel
        if (tradeIn.userId !== user.id) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
        if (tradeIn.status !== "PENDING" && tradeIn.status !== "REVIEWING") {
          return NextResponse.json(
            { error: "Cannot cancel at this stage" },
            { status: 400 },
          );
        }

        const cancelledTradeIn = await prisma.tradeIn.update({
          where: { id: params.id },
          data: { status: "CANCELLED" },
        });
        return NextResponse.json({
          message: "Trade-in cancelled",
          tradeIn: cancelledTradeIn,
        });

      case "ACCEPT_OFFER":
        // Only owner can accept offer
        if (tradeIn.userId !== user.id) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
        if (tradeIn.status !== "OFFER_MADE") {
          return NextResponse.json(
            { error: "No offer to accept" },
            { status: 400 },
          );
        }

        const acceptedTradeIn = await prisma.tradeIn.update({
          where: { id: params.id },
          data: {
            status: "ACCEPTED",
            responseNote: responseNote || null,
          },
        });
        return NextResponse.json({
          message: "Offer accepted",
          tradeIn: acceptedTradeIn,
        });

      case "REJECT_OFFER":
        // Only owner can reject offer
        if (tradeIn.userId !== user.id) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
        if (tradeIn.status !== "OFFER_MADE") {
          return NextResponse.json(
            { error: "No offer to reject" },
            { status: 400 },
          );
        }

        const rejectedTradeIn = await prisma.tradeIn.update({
          where: { id: params.id },
          data: {
            status: "REJECTED",
            responseNote: responseNote || null,
          },
        });
        return NextResponse.json({
          message: "Offer rejected",
          tradeIn: rejectedTradeIn,
        });

      case "MAKE_OFFER":
        // Only supplier can make offer
        if (user.role !== "SUPPLIER") {
          return NextResponse.json(
            { error: "Only suppliers can make offers" },
            { status: 403 },
          );
        }
        if (!offerAmount || offerAmount <= 0) {
          return NextResponse.json(
            { error: "Valid offer amount required" },
            { status: 400 },
          );
        }

        const offerTradeIn = await prisma.tradeIn.update({
          where: { id: params.id },
          data: {
            status: "OFFER_MADE",
            supplierId: user.id,
            offerAmount: parseFloat(offerAmount),
            offerNote: offerNote || null,
            offerDate: new Date(),
          },
        });
        return NextResponse.json({
          message: "Offer submitted",
          tradeIn: offerTradeIn,
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
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tradeIn = await prisma.tradeIn.findUnique({
      where: { id: params.id },
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
      where: { id: params.id },
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
