// app/api/mobile/trade-in/[id]/interest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";
import { pushNotificationService } from "@/services/push-notification.service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const message =
      typeof body?.message === "string" ? body.message : undefined;

    const tradeIn = await prisma.tradeIn.findUnique({
      where: { id },
      select: { id: true, itemName: true, userId: true },
    });

    if (!tradeIn) {
      return NextResponse.json(
        { error: "Trade-in not found" },
        { status: 404 },
      );
    }

    if (tradeIn.userId === user.id) {
      return NextResponse.json(
        { error: "You cannot express interest in your own trade-in" },
        { status: 400 },
      );
    }

    const existing = await prisma.tradeInInterest.findUnique({
      where: { tradeInId_userId: { tradeInId: tradeIn.id, userId: user.id } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Interest already recorded" },
        { status: 409 },
      );
    }

    await prisma.tradeInInterest.create({
      data: {
        tradeInId: tradeIn.id,
        userId: user.id,
        message: message || null,
      },
    });

    await pushNotificationService.notifyUser(tradeIn.userId, {
      title: "New interest",
      body: `Someone is interested in your trade-in ${tradeIn.itemName}`,
      data: { type: "trade-in", tradeInId: tradeIn.id },
    });

    return NextResponse.json(
      { success: true, message: "Interest recorded" },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to record interest";
    console.error("[TRADE-IN INTEREST] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
