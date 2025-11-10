// app/api/user/complete-onboarding/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingStatus: "COMPLETED" },
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to update" }, { status: 500 });
  }
}
