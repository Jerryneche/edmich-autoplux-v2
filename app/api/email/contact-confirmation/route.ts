import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { to, name, subject } = await request.json();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .checkmark { width: 60px; height: 60px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-center; margin: 0 auto 20px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Message Received!</h1>
    </div>
    
    <div class="content">
      <div class="checkmark">
        <span style="color: white; font-size: 30px;">✓</span>
      </div>

      <h2 style="text-align: center; color: #1f2937;">Thank you, ${name}!</h2>
      
      <p>We've received your message regarding "<strong>${subject}</strong>" and our team will review it shortly.</p>

      <p><strong>What happens next?</strong></p>
      <ul>
        <li>Our team will review your message within 24 hours</li>
        <li>You'll receive a personalized response at this email address</li>
        <li>For urgent matters, call us at +234 902 557 9441</li>
      </ul>

      <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #1e40af;"><strong>📌 Tip:</strong> Add edmichservices@gmail.com to your contacts to ensure our reply doesn't go to spam.</p>
      </div>

      <p style="text-align: center; margin-top: 30px;">
        <a href="https://www.edmich.com" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Visit Our Platform
        </a>
      </p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} EDMICH AutoPlux. All rights reserved.</p>
      <p>Ladipo, Mushin, Lagos, Nigeria | +234 902 557 9441</p>
    </div>
  </div>
</body>
</html>
    `;

    console.log("📧 CONFIRMATION EMAIL:");
    console.log("To:", to);
    console.log("Name:", name);

    // TODO: Replace with actual email service

    return NextResponse.json({
      success: true,
      message: "Confirmation email sent",
    });
  } catch (error) {
    console.error("Confirmation email error:", error);
    return NextResponse.json(
      { error: "Failed to send confirmation" },
      { status: 500 }
    );
  }
}
