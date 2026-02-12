import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { to, contactId, name, email, phone, subject, category, message } =
      await request.json();

    // Email HTML template for admin
    // TODO: Replace with actual email service
    
    // Log for testing
    console.log("📧 CONTACT NOTIFICATION EMAIL:");
    console.log("To:", to);
    console.log("From:", name);
    console.log("Contact ID:", contactId);
    console.log("Category:", category);

    // TODO: Replace with actual email service (Resend, SendGrid, etc.)

    return NextResponse.json({
      success: true,
      message: "Admin notification sent",
    });
  } catch (error) {
    console.error("Email notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
