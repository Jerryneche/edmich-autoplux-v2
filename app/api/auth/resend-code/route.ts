// app/api/auth/resend-code/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified. Please login." },
        { status: 400 }
      );
    }

    const verificationCode = generateVerificationCode();

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        verificationCode,
        verificationExpiry: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await sendVerificationEmail(normalizedEmail, verificationCode);

    return NextResponse.json({
      success: true,
      message: "New code sent to your email",
    });
  } catch (error: any) {
    console.error("[RESEND-CODE] Error:", error);
    return NextResponse.json(
      { error: "Failed to resend code" },
      { status: 500 }
    );
  }
}
