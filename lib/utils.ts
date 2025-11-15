// lib/utils.ts
import { prisma } from "./prisma";

export async function generateSlug(
  title: string,
  model: "Product" | "Category" = "Product"
) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = baseSlug;
  let count = 1;

  // Check uniqueness
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}
