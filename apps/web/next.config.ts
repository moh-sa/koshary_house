import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Next only auto-loads .env from apps/web; pull in the monorepo-root .env so the
// whole project shares one env file (incl. NEXT_PUBLIC_* vars used in the bundle).
loadEnv({ path: "../../.env" });

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const API_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:8000";

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
  // origin; Next forwards to the Express API so auth cookies "just work".
  async rewrites() {
    return [
      { source: "/api/auth/:path*", destination: `${API_TARGET}/api/auth/:path*` },
      { source: "/rpc/:path*", destination: `${API_TARGET}/rpc/:path*` },
      { source: "/payments/:path*", destination: `${API_TARGET}/payments/:path*` },
    ];
  },
};

export default withNextIntl(nextConfig);
