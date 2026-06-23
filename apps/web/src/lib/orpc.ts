import { contract } from "@food/contract";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

const baseUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/rpc`
    : "http://localhost:3000/rpc";

const link = new RPCLink({
  url: baseUrl,
  // Forward the active locale so the API can build localized payment redirects.
  headers: () => ({
    "x-locale":
      typeof document !== "undefined"
        ? document.documentElement.lang || "en"
        : "en",
  }),
  fetch: (request, init) =>
    fetch(request, { ...init, credentials: "include" }),
});

export const client: ContractRouterClient<typeof contract> =
  createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
