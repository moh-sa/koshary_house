import "./env"; // must run first so dotenv loads before @food/db connects

import { RPCHandler } from "@orpc/server/node";
import { CORSPlugin } from "@orpc/server/plugins";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import type { IncomingMessage } from "node:http";

import { auth } from "./auth";
import { env } from "./env";
import { generateSpec, openAPIHandler, scalarHtml } from "./openapi";
import type { ORPCContext } from "./orpc";
import { router } from "./router";
import { paymentRoutes } from "./webhooks";

const app = express();

app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));

// Build per-request oRPC context (auth session from cookies).
async function makeContext(req: IncomingMessage): Promise<ORPCContext> {
  const headers = fromNodeHeaders(req.headers);
  const session = await auth.api.getSession({ headers });
  return { headers, session };
}

// 1) Better Auth — must be registered BEFORE express.json (parses own body).
app.all("/api/auth/*splat", toNodeHandler(auth));

// 2) oRPC RPC handler (consumed by the web app). Raw body — before json().
const rpcHandler = new RPCHandler(router, { plugins: [new CORSPlugin()] });
app.use(async (req, res, next) => {
  if (!req.path.startsWith("/rpc")) return next();
  const { matched } = await rpcHandler.handle(req, res, {
    prefix: "/rpc",
    context: await makeContext(req),
  });
  if (!matched) next();
});

// 3) oRPC OpenAPI handler (REST surface for docs). Raw body — before json().
app.use(async (req, res, next) => {
  if (!req.path.startsWith("/api/v1")) return next();
  const { matched } = await openAPIHandler.handle(req, res, {
    prefix: "/api/v1",
    context: await makeContext(req),
  });
  if (!matched) next();
});

// JSON body parsing for the remaining routes.
app.use(express.json());

// OpenAPI spec + Scalar docs UI.
app.get("/spec.json", async (_req, res) => {
  res.json(await generateSpec());
});
app.get("/docs", (_req, res) => {
  res.type("html").send(scalarHtml);
});

// Payment webhooks + mock endpoint.
app.use(paymentRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(env.PORT, () => {
  console.log(`✅ API ready on http://localhost:${env.PORT}`);
  console.log(`📖 API docs at  http://localhost:${env.PORT}/docs`);
});
