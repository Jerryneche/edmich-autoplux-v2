import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { to, contactId, name, email, phone, subject, category, message } =
      await request.json();

    // Email HTML template for admin
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: bold; color: #1f2937; margin-bottom: 5px; }
    .field-value { background: white; padding: 12px; border-radius: 6px; border: 1px solid #d1d5db; }
    .category-badge { display: inline-block; padding: 6px 12px; background: #dbeafe; color: #1e40af; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Contact Form Submission</h1>
      <p>EDMICH AutoPlux Admin Panel</p>
    </div>
    
    <div class="content">
      <div class="field">
        <div class="field-label">Category</div>
        <div class="field-value">
          <span class="category-badge">${category}</span>
        </div>
      </div>

      <div class="field">
        <div class="field-label">From</div>
        <div class="field-value">${name}</div>
      </div>

      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value">${email}</div>
      </div>

      ${
        phone
          ? `
      <div class="field">
        <div class="field-label">Phone</div>
        <div class="field-value">${phone}</div>
      </div>
      `
          : ""
      }

      <div class="field">
        <div class="field-label">Subject</div>
        <div class="field-value">${subject}</div>
      </div>

      <div class="field">
        <div class="field-label">Message</div>
        <div class="field-value">${message.replace(/\n/g, "<br>")}</div>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${
          process.env.NEXTAUTH_URL
        }/dashboard/admin/contacts/${contactId}" class="button">
          View in Admin Panel
        </a>
        <a href="mailto:${email}?subject=Re: ${subject}" class="button" style="background: #059669;">
          Reply to ${name}
        </a>
      </div>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} EDMICH AutoPlux. All rights reserved.</p>
      <p>This is an automated notification from your contact form.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Log email for testing (you'll replace this with actual email service)
    console.log("📧 ADMIN EMAIL NOTIFICATION:");
    console.log("To:", to);
    console.log("Subject:", `New Contact: ${subject}`);
    console.log("From:", name, email);
    console.log("Category:", category);

    // TODO: Replace with actual email service (Resend, SendGrid, etc.)
    // For now, we'll just log and return success
    // Example with Resend:
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'EDMICH AutoPlux <noreply@edmich.com>',
      to: [to],
      subject: `New Contact: ${subject}`,
      html: htmlContent,
    });
    */

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
