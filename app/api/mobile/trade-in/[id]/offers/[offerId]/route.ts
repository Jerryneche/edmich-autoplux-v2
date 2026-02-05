// app/api/mobile/trade-in/[id]/offers/[offerId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";
import { pushNotificationService } from "@/services/push-notification.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; offerId: string }> },
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, offerId } = await params;
    const body = await request.json();
    const action = typeof body?.action === "string" ? body.action : "";
    const amount = body?.amount !== undefined ? Number(body.amount) : undefined;
    const note = typeof body?.note === "string" ? body.note : undefined;

    const tradeIn = await prisma.tradeIn.findUnique({
      where: { id },
      select: { id: true, userId: true, itemName: true },
    });

    if (!tradeIn) {
      return NextResponse.json({ error: "Trade-in not found" }, { status: 404 });
    }

    if (tradeIn.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const offer = await prisma.tradeInOffer.findFirst({
      where: { id: offerId, tradeInId: tradeIn.id },
      include: { order: { select: { id: true } } },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (action === "ACCEPT") {
      const updatedOffer = await prisma.tradeInOffer.update({
        where: { id: offer.id },
        data: {
          status: "ACCEPTED",
          ...(amount !== undefined && !Number.isNaN(amount)
            ? { amount }
            : {}),
          ...(note !== undefined ? { note } : {}),
        },
      });

      await prisma.tradeInOfferRevision.create({
        data: {
          offerId: offer.id,
          userId: user.id,
          amount: updatedOffer.amount,
          note: updatedOffer.note,
          action: "ACCEPTED",
        },
      });

      const order = offer.order
        ? await prisma.order.findUnique({ where: { id: offer.order.id } })
        : await prisma.order.create({
            data: {
              userId: offer.userId,
              total: updatedOffer.amount,
              status: "PENDING",
              paymentMethod: "TRADE_IN",
              paymentStatus: "PENDING",
              tradeInId: tradeIn.id,
              tradeInOfferId: updatedOffer.id,
            },
          });

      await prisma.tradeIn.update({
        where: { id: tradeIn.id },
        data: { status: "ACCEPTED" },
      });

      await pushNotificationService.notifyUser(offer.userId, {
        title: "Offer accepted",
        body: `Your offer was accepted for trade-in ${tradeIn.itemName}`,
        data: { type: "trade-in", tradeInId: tradeIn.id, orderId: order?.id },
      });

      await pushNotificationService.notifyUser(tradeIn.userId, {
        title: "Offer accepted",
        body: `You accepted an offer for trade-in ${tradeIn.itemName}`,
        data: { type: "trade-in", tradeInId: tradeIn.id, orderId: order?.id },
      });

      return NextResponse.json(
        { success: true, offer: updatedOffer, orderId: order?.id },
        { status: 200 },
      );
    }

    if (action === "REJECT") {
      const updatedOffer = await prisma.tradeInOffer.update({
        where: { id: offer.id },
        data: { status: "REJECTED", ...(note !== undefined ? { note } : {}) },
      });

      await prisma.tradeInOfferRevision.create({
        data: {
          offerId: offer.id,
          userId: user.id,
          amount: updatedOffer.amount,
          note: updatedOffer.note,
          action: "REJECTED",
        },
      });

      await pushNotificationService.notifyUser(offer.userId, {
        title: "Offer rejected",
        body: `Your offer was rejected for trade-in ${tradeIn.itemName}`,
        data: { type: "trade-in", tradeInId: tradeIn.id },
      });

      await pushNotificationService.notifyUser(tradeIn.userId, {
        title: "Offer rejected",
        body: `You rejected an offer for trade-in ${tradeIn.itemName}`,
        data: { type: "trade-in", tradeInId: tradeIn.id },
      });

      return NextResponse.json(
        { success: true, offer: updatedOffer },
        { status: 200 },
      );
    }

    if (action === "COUNTER") {
      if (amount === undefined || Number.isNaN(amount) || amount <= 0) {
        return NextResponse.json(
          { error: "Valid counter amount is required" },
          { status: 400 },
        );
      }

      const updatedOffer = await prisma.tradeInOffer.update({
        where: { id: offer.id },
        data: {
          status: "COUNTERED",
          amount,
          ...(note !== undefined ? { note } : {}),
        },
      });

      await prisma.tradeInOfferRevision.create({
        data: {
          offerId: offer.id,
          userId: user.id,
          amount: updatedOffer.amount,
          note: updatedOffer.note,
          action: "COUNTERED",
        },
      });

      await pushNotificationService.notifyUser(offer.userId, {
        title: "Counter offer",
        body: `You received a counter offer for trade-in ${tradeIn.itemName}`,
        data: { type: "trade-in", tradeInId: tradeIn.id },
      });

      await pushNotificationService.notifyUser(tradeIn.userId, {
        title: "Counter sent",
        body: `You sent a counter offer for trade-in ${tradeIn.itemName}`,
        data: { type: "trade-in", tradeInId: tradeIn.id },
      });

      return NextResponse.json(
        { success: true, offer: updatedOffer },
        { status: 200 },
      );
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update offer";
    console.error("[TRADE-IN OFFERS PATCH] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
