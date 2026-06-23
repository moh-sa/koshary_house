import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Run on everything except API/RPC proxy paths, Next internals and files.
  matcher: ["/((?!api|rpc|_next|_vercel|.*\\..*).*)"],
};
