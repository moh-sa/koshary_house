import { contract } from "@food/contract";
import { implement, ORPCError } from "@orpc/server";

import { auth } from "./auth";

export interface ORPCContext {
  headers: Headers;
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
}

const os = implement(contract).$context<ORPCContext>();

/** Requires a signed-in user; injects `context.user`. */
const requireAuth = os.middleware(({ context, next }) => {
  const user = context.session?.user;
  if (!user) throw new ORPCError("UNAUTHORIZED", { message: "Sign in required" });
  return next({ context: { user } });
});

/** Requires an ADMIN user. */
const requireAdmin = os.middleware(({ context, next }) => {
  const user = context.session?.user;
  if (!user) throw new ORPCError("UNAUTHORIZED", { message: "Sign in required" });
  if (user.role !== "ADMIN")
    throw new ORPCError("FORBIDDEN", { message: "Admins only" });
  return next({ context: { user } });
});

/** Public procedures. */
export const pub = os;
/** Authenticated procedures. */
export const authed = os.use(requireAuth);
/** Admin-only procedures. */
export const adminOnly = os.use(requireAdmin);
