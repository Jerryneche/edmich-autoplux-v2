import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    // Get logistics details before deletion
    const logistics = await prisma.logisticsProfile.findUnique({
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

    if (!logistics) {
      return NextResponse.json(
        { error: "Logistics provider not found" },
        { status: 404 }
      );
    }

    // 🔥 NOTIFY LOGISTICS PROVIDER - Rejection
    await prisma.notification.create({
      data: {
        userId: logistics.userId,
        type: "SYSTEM",
        title: "Profile Verification Issue",
        message: `Your logistics company application has been reviewed. ${
          reason ||
          "Unfortunately, we cannot approve your profile at this time."
        } Please contact support for more information.`,
        link: `/support`,
        read: false,
      },
    });

    // Delete the profile
    await prisma.logisticsProfile.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Logistics provider rejected and removed",
    });
  } catch (error) {
    console.error("Error rejecting logistics:", error);
    return NextResponse.json(
      { error: "Failed to reject logistics provider" },
      { status: 500 }
    );
  }
}
