import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { reason } = body;

    // Get mechanic details before deletion
    const mechanic = await prisma.mechanicProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!mechanic) {
      return NextResponse.json(
        { error: "Mechanic not found" },
        { status: 404 },
      );
    }

    // 🔥 NOTIFY MECHANIC - Rejection
    await prisma.notification.create({
      data: {
        userId: mechanic.userId,
        type: "SYSTEM",
        title: "Profile Verification Issue",
        message: `Your mechanic profile application has been reviewed. ${
          reason ||
          "Unfortunately, we cannot approve your profile at this time."
        } Please contact support for more information.`,
        link: `/support`,
        read: false,
      },
    });

    // Delete the profile
    await prisma.mechanicProfile.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Mechanic profile rejected and removed",
    });
  } catch (error) {
    console.error("Error rejecting mechanic:", error);
    return NextResponse.json(
      { error: "Failed to reject mechanic" },
      { status: 500 },
    );
  }
}
