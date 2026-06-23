import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { parseDbUrl } from "./db-url";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const { url, schema: searchPath } = parseDbUrl(connectionString);

// Reuse a single client across hot-reloads in dev.
const globalForDb = globalThis as unknown as {
  __sql?: ReturnType<typeof postgres>;
};

const sql =
  globalForDb.__sql ??
  postgres(url, {
    max: 10,
    prepare: false,
    connection: { search_path: searchPath },
  });
if (process.env.NODE_ENV !== "production") globalForDb.__sql = sql;

export const db = drizzle(sql, { schema });
export { sql };
