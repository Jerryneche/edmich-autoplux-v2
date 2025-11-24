import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const supplierId = params.id;

    // Update supplier profile
    const updatedSupplier = await prisma.supplierProfile.update({
      where: { id: supplierId },
      data: {
        verified: true,
        approved: true,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Send notification to supplier
    await prisma.notification.create({
      data: {
        userId: updatedSupplier.userId,
        type: "SYSTEM",
        title: "Supplier Application Approved! 🎉",
        message: `Congratulations! Your supplier profile for "${updatedSupplier.businessName}" has been verified and approved. You can now start listing products.`,
        link: "/dashboard/supplier",
      },
    });

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error("Error approving supplier:", error);
    return NextResponse.json(
      { error: "Failed to approve supplier" },
      { status: 500 }
    );
  }
}
