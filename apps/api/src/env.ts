import { config } from "dotenv";

// Load repo-root .env (apps/api is two levels deep).
config({ path: "../../.env" });

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 8000),
  DATABASE_URL: required("DATABASE_URL"),

  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "dev-insecure-secret",
  // Web origin — the browser reaches auth through the Next proxy.
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  WEB_ORIGIN: process.env.WEB_ORIGIN ?? "http://localhost:3000",

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",

  PAYMOB_MODE: (process.env.PAYMOB_MODE ?? "mock") as "sandbox" | "mock",
  // Egypt default; override if your account lives on a different Paymob domain.
  PAYMOB_BASE_URL: (
    process.env.PAYMOB_BASE_URL ?? "https://accept.paymob.com"
  ).replace(/\/$/, ""),
  PAYMOB_SECRET_KEY: process.env.PAYMOB_SECRET_KEY ?? "",
  PAYMOB_PUBLIC_KEY: process.env.PAYMOB_PUBLIC_KEY ?? "",
  PAYMOB_INTEGRATION_ID: process.env.PAYMOB_INTEGRATION_ID ?? "",
  PAYMOB_HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET ?? "",
} as const;

export const isGoogleEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
);

/**
 * Whether the real Paymob gateway should be used. Requires sandbox mode + all
 * credentials, AND an environment where Paymob's webhook can actually reach us:
 * production, or an explicit opt-in (e.g. running ngrok locally). Otherwise we
 * use the mock gateway so an unreachable webhook never leaves orders stuck.
 */
const paymobConfigured =
  env.PAYMOB_MODE === "sandbox" &&
  Boolean(
    env.PAYMOB_SECRET_KEY && env.PAYMOB_PUBLIC_KEY && env.PAYMOB_INTEGRATION_ID,
  );

const webhookReachable =
  env.NODE_ENV === "production" || process.env.PAYMOB_FORCE_LIVE === "true";

export const isPaymobLive = paymobConfigured && webhookReachable;
