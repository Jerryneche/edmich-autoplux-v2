// app/business/market/page.tsx
import { headers } from "next/headers";
import ClientMarket from "./ClientMarket";
import { ProductCardData } from "@/app/types/product";

const PLACEHOLDER_PRODUCTS: ProductCardData[] = [
  /* ... your 10+ items ... */
];

async function getProducts(
  page: number = 1,
  limit: number = 9
): Promise<ProductCardData[]> {
  try {
    const headersList = headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const res = await fetch(
      `${protocol}://${host}/api/products?page=${page}&limit=${limit}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("API failed");

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Using placeholder products:", error);
    return PLACEHOLDER_PRODUCTS.slice((page - 1) * limit, page * limit);
  }
}

export default async function MarketPage() {
  const initialProducts = await getProducts(1, 9);

  return <ClientMarket initialProducts={initialProducts} />;
}
