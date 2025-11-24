import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has supplier profile
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!supplierProfile) {
      return NextResponse.json(
        { error: "Supplier profile not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const category = formData.get("category") as string;
    const stock = formData.get("stock") as string;
    const imageFile = formData.get("image") as File | null;

    // Validate required fields
    if (!name || !price || !category || !stock) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate price and stock are numbers
    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    if (isNaN(stockNum) || stockNum < 0) {
      return NextResponse.json(
        { error: "Invalid stock quantity" },
        { status: 400 }
      );
    }

    // Upload image if provided
    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      try {
        const blob = await put(imageFile.name, imageFile, {
          access: "public",
        });
        imageUrl = blob.url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image. Please try again." },
          { status: 500 }
        );
      }
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price: priceNum,
        category,
        stock: stockNum,
        image: imageUrl,
        supplierId: supplierProfile.id,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
