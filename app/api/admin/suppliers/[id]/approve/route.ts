import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.supplierProfile.update({
      where: { id: params.id },
      data: { verified: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to approve supplier" },
      { status: 500 }
    );
  }
}
