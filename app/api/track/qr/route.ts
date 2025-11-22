import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingId = searchParams.get("id");

    if (!trackingId) {
      return NextResponse.json(
        { error: "Tracking ID required" },
        { status: 400 }
      );
    }

    const trackingUrl = `${process.env.NEXTAUTH_URL}/track?id=${trackingId}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#2563eb",
        light: "#ffffff",
      },
    });

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      trackingUrl,
      trackingId,
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
