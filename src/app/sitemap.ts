import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/sitemap";
import { isIndexableEnvironment } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Non-production deployments publish an empty sitemap.
  return isIndexableEnvironment() ? buildSitemap() : [];
}
