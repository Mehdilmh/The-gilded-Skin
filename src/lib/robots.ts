import type { MetadataRoute } from "next";
import { absoluteUrl } from "./site";

export function buildRobots(indexable: boolean): MetadataRoute.Robots {
  if (!indexable) {
    // Staging, preview and local builds must never be indexed.
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // CSS/JS under /_next stay crawlable so pages render for search engines.
        disallow: ["/search", "/studio", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
