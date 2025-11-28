import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Generate new code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationExpiry,
      },
    });

    // Send email
    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json({
      success: true,
      message: "Verification code sent!",
    });
  } catch (error: any) {
    console.error("Resend code error:", error);
    return NextResponse.json(
      { error: "Failed to resend code" },
      { status: 500 }
    );
  }
}
