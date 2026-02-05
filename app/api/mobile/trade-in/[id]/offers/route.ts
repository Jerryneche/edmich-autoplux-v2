// app/api/mobile/trade-in/[id]/offers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";
import { pushNotificationService } from "@/services/push-notification.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const amount = Number(body?.amount);
    const note = typeof body?.note === "string" ? body.note : undefined;

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 },
      );
    }

    const tradeIn = await prisma.tradeIn.findUnique({
      where: { id },
      select: { id: true, itemName: true, userId: true, status: true },
    });

    if (!tradeIn) {
      return NextResponse.json({ error: "Trade-in not found" }, { status: 404 });
    }

    if (tradeIn.userId === user.id) {
      return NextResponse.json(
        { error: "You cannot make an offer on your own trade-in" },
        { status: 400 },
      );
    }

    const existing = await prisma.tradeInOffer.findUnique({
      where: { tradeInId_userId: { tradeInId: tradeIn.id, userId: user.id } },
    });

    let offer;
    if (existing) {
      offer = await prisma.tradeInOffer.update({
        where: { id: existing.id },
        data: {
          amount,
          note: note || null,
          status: "SUBMITTED",
        },
      });

      await prisma.tradeInOfferRevision.create({
        data: {
          offerId: existing.id,
          userId: user.id,
          amount,
          note: note || null,
          action: "UPDATED",
        },
      });
    } else {
      offer = await prisma.tradeInOffer.create({
        data: {
          tradeInId: tradeIn.id,
          userId: user.id,
          amount,
          note: note || null,
          status: "SUBMITTED",
        },
      });

      await prisma.tradeInOfferRevision.create({
        data: {
          offerId: offer.id,
          userId: user.id,
          amount,
          note: note || null,
          action: "CREATED",
        },
      });

      if (tradeIn.status === "PENDING") {
        await prisma.tradeIn.update({
          where: { id: tradeIn.id },
          data: { status: "OFFER_MADE" },
        });
      }
    }

    await pushNotificationService.notifyUser(tradeIn.userId, {
      title: existing ? "Offer updated" : "New offer",
      body: `Someone made an offer on your trade-in ${tradeIn.itemName}`,
      data: { type: "trade-in", tradeInId: tradeIn.id },
    });

    await pushNotificationService.notifyUser(user.id, {
      title: existing ? "Offer updated" : "Offer sent",
      body: `Your offer was sent for trade-in ${tradeIn.itemName}`,
      data: { type: "trade-in", tradeInId: tradeIn.id },
    });

    return NextResponse.json(
      { success: true, offer, message: "Offer submitted" },
      { status: existing ? 200 : 201 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to submit offer";
    console.error("[TRADE-IN OFFERS POST] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const tradeIn = await prisma.tradeIn.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!tradeIn) {
      return NextResponse.json({ error: "Trade-in not found" }, { status: 404 });
    }

    if (tradeIn.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const offers = await prisma.tradeInOffer.findMany({
      where: { tradeInId: tradeIn.id },
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        revisions: { orderBy: { createdAt: "desc" }, take: 5 },
        order: { select: { id: true, paymentStatus: true, status: true } },
      },
    });

    return NextResponse.json({ offers }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch offers";
    console.error("[TRADE-IN OFFERS GET] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
