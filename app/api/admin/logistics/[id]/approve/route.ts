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

    // Update logistics profile
    const logistics = await prisma.logisticsProfile.update({
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

    // 🔥 NOTIFY LOGISTICS PROVIDER - Approval
    await prisma.notification.create({
      data: {
        userId: logistics.userId,
        type: "SYSTEM",
        title: "Profile Approved! 🎉",
        message: `Congratulations! Your logistics company ${logistics.companyName} has been verified and approved. You can now receive delivery requests from customers.`,
        link: `/dashboard/logistics`,
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Logistics provider approved successfully",
      logistics,
    });
  } catch (error) {
    console.error("Error approving logistics:", error);
    return NextResponse.json(
      { error: "Failed to approve logistics provider" },
      { status: 500 }
    );
  }
}
