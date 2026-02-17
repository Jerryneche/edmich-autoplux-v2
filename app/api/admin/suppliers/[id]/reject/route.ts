// app/api/admin/suppliers/[id]/reject/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await prisma.supplierProfile.update({
      where: { id },
      data: { verified: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error rejecting supplier:", error);
    return NextResponse.json(
      { error: "Failed to reject supplier" },
      { status: 500 },
    );
  }
}
