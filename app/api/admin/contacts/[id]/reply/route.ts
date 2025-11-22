import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { reply } = await request.json();

    if (!reply || !reply.trim()) {
      return NextResponse.json(
        { error: "Reply message is required" },
        { status: 400 }
      );
    }

    // Get contact details
    const contact = await prisma.contactSubmission.findUnique({
      where: { id },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Update status to REPLIED (no adminReply field needed)
    const updated = await prisma.contactSubmission.update({
      where: { id },
      data: {
        status: "REPLIED",
      },
    });

    // Send email to customer
    try {
      const emailResponse = await fetch(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }/api/email/admin-reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: contact.email,
            name: contact.name,
            subject: contact.subject,
            originalMessage: contact.message,
            reply,
          }),
        }
      );

      if (!emailResponse.ok) {
        console.error("Failed to send email notification");
      }
    } catch (emailError) {
      console.error("Email error:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      contact: updated,
    });
  } catch (error) {
    console.error("Error sending reply:", error);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 }
    );
  }
}
