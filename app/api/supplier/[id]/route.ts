import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { verified } = await req.json();

  try {
    const supplier = await prisma.supplierProfile.update({
      where: { id },
      data: { verified },
    });

    return NextResponse.json(supplier);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 },
    );
  }
}
