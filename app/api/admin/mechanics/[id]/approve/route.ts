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

    // Update mechanic profile
    const mechanic = await prisma.mechanicProfile.update({
      where: { id },
      data: {
        verified: true,
        approved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 🔥 NOTIFY MECHANIC - Approval
    await prisma.notification.create({
      data: {
        userId: mechanic.userId,
        type: "SYSTEM",
        title: "Profile Approved! 🎉",
        message: `Congratulations! Your mechanic profile for ${mechanic.businessName} has been verified and approved. You can now receive service bookings from customers.`,
        link: `/dashboard/mechanic`,
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mechanic approved successfully",
      mechanic,
    });
  } catch (error) {
    console.error("Error approving mechanic:", error);
    return NextResponse.json(
      { error: "Failed to approve mechanic" },
      { status: 500 }
    );
  }
}
