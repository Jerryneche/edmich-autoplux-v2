import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXTAUTH_URL || "https://www.edmich.com";

// Define all static public routes
const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/shop", priority: "0.9", changefreq: "daily" },
  { path: "/business", priority: "0.8", changefreq: "weekly" },
  { path: "/business/market", priority: "0.8", changefreq: "weekly" },
  { path: "/business/mechanics", priority: "0.8", changefreq: "weekly" },
  { path: "/business/logistics", priority: "0.8", changefreq: "weekly" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.7", changefreq: "monthly" },
  { path: "/login", priority: "0.6", changefreq: "yearly" },
  { path: "/signup", priority: "0.6", changefreq: "yearly" },
  { path: "/terms", priority: "0.5", changefreq: "yearly" },
  { path: "/legal", priority: "0.5", changefreq: "yearly" },
  { path: "/blog", priority: "0.7", changefreq: "weekly" },
  { path: "/careers", priority: "0.6", changefreq: "monthly" },
];

export async function GET() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
  ${staticRoutes
    .map(
      ({ path, priority, changefreq }) => `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
  `
    )
    .join("")}
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
