import type { MetadataRoute } from "next";
import { CATEGORIES, PRODUCTS } from "@/server/catalog";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = siteUrl();
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${base}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
  const cats: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${base}/shop?categoryId=${c.id}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));
  const products: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${base}/product/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  return [...staticPages, ...cats, ...products];
}
