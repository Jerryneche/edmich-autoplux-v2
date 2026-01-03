// app/api/kyc/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kyc = await prisma.kYC.findFirst({
      where: { userId: user.id },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ kyc });
  } catch (error) {
    console.error("KYC status fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC status" },
      { status: 500 }
    );
  }
}
