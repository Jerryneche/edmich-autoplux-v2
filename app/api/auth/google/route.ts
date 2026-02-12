import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET!;
const googleClient = new OAuth2Client();

const googleAudiences = [
  process.env.GOOGLE_WEB_CLIENT_ID,
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_ANDROID_CLIENT_ID,
  process.env.GOOGLE_IOS_CLIENT_ID,
].filter((value): value is string => !!value);

export async function POST(req: Request) {
  try {
    console.log("[GOOGLE AUTH] Request received");
    console.log("[GOOGLE AUTH] Has GOOGLE_WEB_CLIENT_ID:", !!process.env.GOOGLE_WEB_CLIENT_ID);
    console.log("[GOOGLE AUTH] Has JWT_SECRET:", !!process.env.JWT_SECRET);
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 },
      );
    }

    // ✅ VERIFY TOKEN WITH GOOGLE
    if (googleAudiences.length === 0) {
      return NextResponse.json(
        { error: "Google client ID not configured" },
        { status: 500 },
      );
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: googleAudiences,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: "Invalid Google token" },
        { status: 401 },
      );
    }

    console.log("[GOOGLE AUTH] Token verified for:", payload.email);

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || "User";
    const image = payload.picture;

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId }],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image,
          googleId,
          isGoogleAuth: true,
          hasPassword: false,
          emailVerified: new Date(),
          role: "BUYER",
          onboardingStatus: "COMPLETED",
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          isGoogleAuth: true,
          googleId: user.googleId || googleId,
          emailVerified: user.emailVerified || new Date(),
          image: user.image || image,
          name: user.name || name,
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" },
    );

    return NextResponse.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
