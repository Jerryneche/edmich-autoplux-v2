// app/api/mobile/trade-in/public/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const make = searchParams.get("vehicleMake");
    const model = searchParams.get("vehicleModel");
    const year = searchParams.get("vehicleYear");
    const query = searchParams.get("query");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
    );
    const skip = (page - 1) * limit;

    const andFilters: Prisma.TradeInWhereInput[] = [];

    if (category) {
      andFilters.push({
        category: { contains: category, mode: Prisma.QueryMode.insensitive },
      });
    }

    if (condition) {
      andFilters.push({ condition: { equals: condition } });
    }

    if (make) {
      andFilters.push({
        vehicleMake: { contains: make, mode: Prisma.QueryMode.insensitive },
      });
    }

    if (model) {
      andFilters.push({
        vehicleModel: { contains: model, mode: Prisma.QueryMode.insensitive },
      });
    }

    if (year && !Number.isNaN(Number(year))) {
      andFilters.push({ vehicleYear: Number(year) });
    }

    if (query) {
      andFilters.push({
        OR: [
          {
            itemName: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            description: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            brand: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            partNumber: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      });
    }

    const minPriceNumber = minPrice ? Number(minPrice) : undefined;
    const maxPriceNumber = maxPrice ? Number(maxPrice) : undefined;
    const priceFilter: Prisma.FloatFilter = {};

    if (minPriceNumber !== undefined && !Number.isNaN(minPriceNumber)) {
      priceFilter.gte = minPriceNumber;
    }

    if (maxPriceNumber !== undefined && !Number.isNaN(maxPriceNumber)) {
      priceFilter.lte = maxPriceNumber;
    }

    if (Object.keys(priceFilter).length > 0) {
      andFilters.push({ askingPrice: priceFilter });
    }

    const where: Prisma.TradeInWhereInput = {
      status: { in: ["PENDING", "REVIEWING", "OFFER_MADE"] },
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    const [tradeIns, total] = await Promise.all([
      prisma.tradeIn.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, image: true } },
          supplier: {
            select: { id: true, businessName: true, city: true, state: true },
          },
        },
      }),
      prisma.tradeIn.count({ where }),
    ]);

    return NextResponse.json(
      {
        tradeIns,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch trade-ins";
    console.error("[TRADE-IN PUBLIC] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
