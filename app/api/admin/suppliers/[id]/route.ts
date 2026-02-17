import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supplier = await prisma.supplierProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            status: true,
            category: true,
          },
          take: 10,
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { approved, verified } = body;

    const updatedSupplier = await prisma.supplierProfile.update({
      where: { id },
      data: {
        ...(approved !== undefined && { approved }),
        ...(verified !== undefined && { verified }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            status: true,
            category: true,
          },
          take: 10,
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 },
    );
  }
}
