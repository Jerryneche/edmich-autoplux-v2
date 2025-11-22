import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Submit contact form
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, category, message } = body;

    // Validation
    if (!name || !email || !subject || !category || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Create contact submission in database
    const contact = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        category,
        message,
        status: "NEW",
      },
    });

    // Send email notification to admin
    try {
      const adminEmailResponse = await fetch(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }/api/email/contact-notification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: process.env.ADMIN_EMAIL || "edmichservices@gmail.com",
            contactId: contact.id,
            name,
            email,
            phone,
            subject,
            category,
            message,
          }),
        }
      );

      if (!adminEmailResponse.ok) {
        console.error("Failed to send admin notification email");
      }
    } catch (emailError) {
      console.error("Email notification error:", emailError);
      // Don't fail the request if email fails
    }

    // Send auto-reply to user
    try {
      await fetch(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }/api/email/contact-confirmation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            name,
            subject,
          }),
        }
      );
    } catch (emailError) {
      console.error("Confirmation email error:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been sent successfully!",
        id: contact.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}

// GET - Admin only: View all contact submissions
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const where: any = {};
    if (status && status !== "all") where.status = status;
    if (category && category !== "all") where.category = category;

    const contacts = await prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact submissions" },
      { status: 500 }
    );
  }
}
