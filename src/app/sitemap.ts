import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/sitemap";
import { isIndexableEnvironment } from "@/lib/site";

export const dynamic = "force-static";
// Re-render hourly so scheduled articles appear on their publish date without a rebuild.
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  // Non-production deployments publish an empty sitemap.
  return isIndexableEnvironment() ? buildSitemap() : [];
}
