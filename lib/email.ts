// lib/email.ts
import nodemailer from "nodemailer";

// Create transporter (use your email service)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER, // your email
    pass: process.env.SMTP_PASSWORD, // app password
  },
});

// Generate 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: `"EDMICH AutoPlux" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify Your Email - EDMICH AutoPlux",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .logo { text-align: center; margin-bottom: 30px; }
          .logo h1 { color: #1F2937; font-size: 32px; margin: 0; letter-spacing: 2px; }
          .logo p { color: #4F46E5; font-size: 14px; margin: 5px 0 0; }
          .code-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
          .code { font-size: 48px; font-weight: 900; letter-spacing: 8px; margin: 10px 0; }
          .message { color: #6B7280; line-height: 1.8; margin-bottom: 20px; }
          .footer { text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>EDMICH</h1>
            <p>AUTOPLUX</p>
          </div>
          
          <h2 style="color: #1F2937;">Verify Your Email Address</h2>
          <p class="message">
            Welcome to EDMICH AutoPlux! Please use the verification code below to complete your registration.
          </p>
          
          <div class="code-box">
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your Verification Code</p>
            <div class="code">${code}</div>
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">Valid for 15 minutes</p>
          </div>
          
          <p class="message">
            If you didn't request this code, please ignore this email.
          </p>
          
          <div class="footer">
            <p>© 2025 EDMICH AutoPlux. Nigeria's #1 Auto Platform.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"EDMICH AutoPlux" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Your Password - EDMICH AutoPlux",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .logo { text-align: center; margin-bottom: 30px; }
          .logo h1 { color: #1F2937; font-size: 32px; margin: 0; letter-spacing: 2px; }
          .logo p { color: #4F46E5; font-size: 14px; margin: 5px 0 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; margin: 20px 0; }
          .message { color: #6B7280; line-height: 1.8; margin-bottom: 20px; }
          .footer { text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
          .warning { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; color: #991B1B; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>EDMICH</h1>
            <p>AUTOPLUX</p>
          </div>
          
          <h2 style="color: #1F2937;">Reset Your Password</h2>
          <p class="message">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p class="message">
            This link will expire in 1 hour for security reasons.
          </p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email and secure your account.
          </div>
          
          <p class="message" style="font-size: 12px;">
            Or copy this link: <br>
            <code style="background: #F3F4F6; padding: 8px; display: inline-block; margin-top: 8px; word-break: break-all;">${resetUrl}</code>
          </p>
          
          <div class="footer">
            <p>© 2025 EDMICH AutoPlux. Nigeria's #1 Auto Platform.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Generic email sender
export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  const mailOptions = {
    from: `"EDMICH AutoPlux" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}

// Add to .env file:
// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_USER=your-email@gmail.com
// SMTP_PASSWORD=your-app-password
