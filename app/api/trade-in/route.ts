import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { oldPart, condition, photos } = await request.json();

  const tradeIn = await prisma.tradeIn.create({
    data: {
      userId: session.user.id,
      oldPart,
      condition,
      estimatedValue: 0, // AI or manual appraisal
      photos,
    },
  });

  return NextResponse.json(tradeIn);
}

export async function GET() {
  const tradeIns = await prisma.tradeIn.findMany({
    include: { user: true },
  });
  return NextResponse.json(tradeIns);
}
