import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { to, name, subject, originalMessage, reply } = await request.json();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .original-message { background: #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .reply { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Reply from EDMICH AutoPlux</h1>
    </div>
    
    <div class="content">
      <p>Hello ${name},</p>
      
      <p>Thank you for contacting EDMICH AutoPlux. We've reviewed your inquiry and here's our response:</p>

      <div class="original-message">
        <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Your Message:</p>
        <p style="margin: 10px 0 0 0; font-style: italic;">"${originalMessage}"</p>
      </div>

      <div class="reply">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #2563eb;">Our Response:</p>
        <p style="margin: 0; white-space: pre-wrap;">${reply}</p>
      </div>

      <p style="margin-top: 30px;">If you have any further questions, feel free to reply to this email or contact us:</p>
      
      <ul style="list-style: none; padding: 0;">
        <li>📞 Phone: +234 902 557 9441</li>
        <li>✉️ Email: edmichservices@gmail.com</li>
        <li>🌐 Website: www.edmich.com</li>
      </ul>

      <p>Best regards,<br><strong>EDMICH AutoPlux Team</strong></p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} EDMICH AutoPlux. All rights reserved.</p>
      <p>Ladipo, Mushin, Lagos, Nigeria</p>
    </div>
  </div>
</body>
</html>
    `;

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
