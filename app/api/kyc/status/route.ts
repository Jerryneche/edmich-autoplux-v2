// app/api/kyc/status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the latest KYC submission for this user
    const kyc = await prisma.kYC.findFirst({
      where: { userId: session.user.id },
      orderBy: { submittedAt: "desc" }, // ← correct field + correct sorting
      select: {
        id: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        idType: true,
        idNumber: true,
        // include any other fields you want to show
      },
    });

    // Determine status string for frontend
    let status = "not_submitted";
    if (kyc) {
      status = kyc.status.toLowerCase(); // "pending" | "approved" | "rejected"
    }

    return NextResponse.json({
      success: true,
      kyc, // full KYC record (or null if none)
      status, // clean string: "not_submitted", "pending", "approved", "rejected"
    });
  } catch (error: any) {
    console.error("KYC status fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC status" },
      { status: 500 }
    );
  }
}
