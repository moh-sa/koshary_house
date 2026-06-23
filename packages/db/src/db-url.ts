/**
 * Splits the `schema` hint out of a DATABASE_URL. `schema` is not a real
 * Postgres connection parameter (it would be rejected as a startup option),
 * so we remove it and surface it separately to set the search_path.
 */
export function parseDbUrl(raw: string): {
  url: string;
  schema: string;
  ssl: boolean;
} {
  const url = new URL(raw);
  const schema = url.searchParams.get("schema") ?? "food_ordering";
  url.searchParams.delete("schema");
  const sslmode = url.searchParams.get("sslmode");
  return {
    url: url.toString(),
    schema,
    ssl: sslmode === "require" || sslmode === "prefer",
  };
}
