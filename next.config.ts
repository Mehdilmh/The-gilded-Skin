import type { NextConfig } from "next";

const isProduction = process.env.SITE_ENV === "production";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  ...(isProduction ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: false,
  // Always render <title>, canonical and other metadata in <head>, even on
  // dynamic pages (contact, search). Search engines ignore canonicals in <body>.
  htmlLimitedBots: /.*/,
  pageExtensions: ["ts", "tsx"],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Moved or renamed content: add permanent redirects in content/redirects.json.
    const redirects: { source: string; destination: string; permanent: boolean }[] = (
      await import("./content/redirects.json")
    ).default;
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.thegildedskin.com" }],
        destination: "https://thegildedskin.com/:path*",
        permanent: true,
      },
      ...redirects,
    ];
  },
};

export default nextConfig;
