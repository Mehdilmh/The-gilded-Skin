import type { MetadataRoute } from "next";
import { buildRobots } from "@/lib/robots";
import { isIndexableEnvironment } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(isIndexableEnvironment());
}
