// app/api/auth/resend-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationCode } from "@/lib/email";
import nodemailer from "nodemailer";
import { ratelimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Extract IP from headers
    const ip =
      req.headers.get("x-real-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0] ??
      "unknown";

    // Rate limiting
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in 1 minute." },
        { status: 429 }
      );
    }

    const { email } = await req.json();

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        verificationExpiry: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email. Please sign up first." },
        { status: 404 }
      );
    }

    // Check if already has recent OTP
    if (user.verificationExpiry && user.verificationExpiry > new Date()) {
      const timeLeft = Math.ceil(
        (user.verificationExpiry.getTime() - Date.now()) / 1000 / 60
      );
      if (timeLeft > 13) {
        return NextResponse.json(
          {
            error: `Please wait ${timeLeft} minutes before requesting a new code`,
          },
          { status: 429 }
        );
      }
    }

    // Generate new OTP
    const otp = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Update user with new OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: otp,
        verificationExpiry: expiresAt,
      },
    });

    console.log(`[OTP] Resent code for: ${normalizedEmail}`);

    // Send email
    const hasSmtpConfig =
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      (process.env.SMTP_PASSWORD || process.env.SMTP_PASS);

    if (!hasSmtpConfig) {
      console.error("[EMAIL] SMTP not configured");
      return NextResponse.json(
        { error: "Email service unavailable. Please contact support." },
        { status: 503 }
      );
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: true,
        },
      });

      await transporter.verify();

      await transporter.sendMail({
        from: `"EDMICH AutoPlux" <${process.env.SMTP_USER}>`,
        to: normalizedEmail,
        subject: user.emailVerified
          ? "Your EDMICH Login Code"
          : "Your EDMICH Verification Code",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; margin: 0; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .logo { text-align: center; margin-bottom: 30px; }
              .logo h1 { color: #1F2937; font-size: 32px; margin: 0; letter-spacing: 2px; }
              .logo p { color: #4F46E5; font-size: 14px; margin: 5px 0 0; }
              .code-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
              .code { font-size: 48px; font-weight: 900; letter-spacing: 8px; margin: 10px 0; }
              .message { color: #6B7280; line-height: 1.8; margin-bottom: 20px; }
              .footer { text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
              .warning { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px; margin: 20px 0; color: #991B1B; font-size: 14px; }
              @media only screen and (max-width: 600px) {
                .container { padding: 20px; }
                .code { font-size: 36px; letter-spacing: 6px; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                <h1>EDMICH AUTOPLUX</h1>
              
              </div>
              
              <h2 style="color: #1F2937;">${
                user.emailVerified
                  ? "Login to Your Account"
                  : "Verify Your Email"
              }</h2>
              <p class="message">
                ${
                  user.emailVerified
                    ? "Use this code to login to your EDMICH AutoPlux account."
                    : "Welcome back! Use this code to complete your registration."
                }
              </p>
              
              <div class="code-box">
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your ${
                  user.emailVerified ? "Login" : "Verification"
                } Code</p>
                <div class="code">${otp}</div>
                <p style="margin: 0; font-size: 12px; opacity: 0.8;">Valid for 15 minutes</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. EDMICH staff will never ask for your verification code.
              </div>
              
              <p class="message">
                If you didn't request this code, please ignore this email and secure your account.
              </p>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} EDMICH AutoPlux. Nigeria's #1 Auto Platform.</p>
                <p>This is an automated email, please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`[EMAIL] OTP sent to: ${normalizedEmail}`);

      return NextResponse.json(
        {
          message: user.emailVerified
            ? "Login code sent to your email"
            : "Verification code sent to your email",
        },
        { status: 200 }
      );
    } catch (emailError: any) {
      console.error("[EMAIL] Failed to send:", emailError.message);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[OTP] Resend error:", error.message);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
