import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  // Ensure schema.sql is included in Vercel's deployment bundle
  // so readFileSync in src/lib/db.ts works at runtime.
  outputFileTracingIncludes: {
    "/**": ["./src/lib/schema.sql"],
  },
};

export default nextConfig;
