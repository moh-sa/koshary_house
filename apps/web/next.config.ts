import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Next only auto-loads .env from apps/web; pull in the monorepo-root .env so the
// whole project shares one env file (incl. NEXT_PUBLIC_* vars used in the bundle).
loadEnv({ path: "../../.env" });

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Allow the contract/db workspace packages to be transpiled.
  transpilePackages: ["@food/contract"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  // Same-origin proxy: the browser talks to /api/* and /rpc/* on the web
  // origin; route handlers under those paths forward to the Express API via
  // fetch() so auth cookies "just work" (see src/lib/api-proxy.ts — using
  // Next's declarative `rewrites()` here breaks on Railway's domains, which
  // Vercel's rewrite engine flags as resolving to a private IP).
};

export default withNextIntl(nextConfig);
