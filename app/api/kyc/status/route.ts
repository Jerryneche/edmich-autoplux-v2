import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kyc = await prisma.kYC.findFirst({
      where: { userId: session.user.id },
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
