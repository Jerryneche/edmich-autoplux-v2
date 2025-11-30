import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      idType,
      idNumber,
      businessName,
      businessRegNumber,
      address,
      city,
      state,
      idFrontUrl,
      idBackUrl,
      selfieUrl,
      businessCertUrl,
    } = body;

    // Check if already submitted
    const existing = await prisma.kYC.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ["pending", "approved"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have a KYC submission" },
        { status: 400 }
      );
    }

    const kyc = await prisma.kYC.create({
      data: {
        userId: session.user.id,
        idType,
        idNumber,
        businessName,
        businessRegNumber,
        address,
        city,
        state,
        idFrontUrl,
        idBackUrl,
        selfieUrl,
        businessCertUrl,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, kyc });
  } catch (error) {
    console.error("KYC submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit KYC" },
      { status: 500 }
    );
  }
}
