/**
 * PATCH /api/notifications/[id]
 * Mark a single notification as read or unread
 * 
 * Body:
 * {
 *   read: boolean (optional, defaults to true)
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { read } = body;

    // Fetch notification to verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized - notification belongs to another user" },
        { status: 403 }
      );
    }

    // Update notification
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: read ?? true },
    });

    return NextResponse.json({
      success: true,
      notification: updated,
    });
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized - notification belongs to another user" },
        { status: 403 }
      );
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
