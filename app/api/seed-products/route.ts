// app/api/seed-products/route.ts
import { NextResponse } from "next/server";
import { getSeedProducts } from "@/lib/seed-data";

export async function GET() {
  try {
    const products = await getSeedProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Seed products API failed:", error);
    return NextResponse.json([], { status: 500 });
  }
}
