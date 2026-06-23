import { account, db, session, user, verification } from "@food/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

import { env, isGoogleEnabled } from "./env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  // Browser origins allowed to use the auth API (CSRF protection).
  trustedOrigins: [env.WEB_ORIGIN],

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  socialProviders: isGoogleEnabled
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }
    : undefined,

  // Roles: we gate routes on a plain `role` string ("USER" | "ADMIN").
  plugins: [admin({ defaultRole: "USER", adminRoles: ["ADMIN"] })],
});

export type Session = typeof auth.$Infer.Session;
