import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

import { parseDbUrl } from "./src/db-url";

// Load the repo-root .env (packages/db is two levels deep).
config({ path: "../../.env" });

const { url, ssl } = parseDbUrl(process.env.DATABASE_URL!);

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url, ssl: ssl ? "require" : false },
  // Only manage our isolated schema on the shared Railway database.
  schemaFilter: ["food_ordering"],
  verbose: false,
  strict: false,
});
