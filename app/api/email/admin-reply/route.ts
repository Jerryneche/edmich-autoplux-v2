import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { to, subject, reply } = await request.json();

    // Email HTML template  
    // TODO: Replace with actual email service to send template
    
    // Log for testing
    console.log("📧 ADMIN REPLY EMAIL:");
    console.log("To:", to);
    console.log("Subject:", `Re: ${subject}`);
    console.log("Reply:", reply);

    // TODO: Replace with actual email service
    // For now, just log and return success

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
