import { category, db, product } from "@food/db";
import { ORPCError } from "@orpc/server";
import { and, asc, eq, ilike, or } from "drizzle-orm";

import { toProductDTO } from "../mappers";
import { pub } from "../orpc";

export const listCategories = pub.menu.listCategories.handler(async () => {
  const rows = await db
    .select()
    .from(category)
    .orderBy(asc(category.sortOrder));
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameEn: c.nameEn,
    nameAr: c.nameAr,
    sortOrder: c.sortOrder,
  }));
});

export const listProducts = pub.menu.listProducts.handler(async ({ input }) => {
  const filters = [eq(product.isAvailable, true)];
  if (input.categoryId) filters.push(eq(product.categoryId, input.categoryId));
  if (input.search) {
    const q = `%${input.search}%`;
    filters.push(
      or(ilike(product.nameEn, q), ilike(product.nameAr, q))!,
    );
  }
  const rows = await db
    .select()
    .from(product)
    .where(and(...filters))
    .orderBy(asc(product.nameEn));
  return rows.map(toProductDTO);
});

export const getProductBySlug = pub.menu.getProductBySlug.handler(
  async ({ input }) => {
    const row = await db.query.product.findFirst({
      where: eq(product.slug, input.slug),
    });
    if (!row) throw new ORPCError("NOT_FOUND", { message: "Product not found" });
    return toProductDTO(row);
  },
);

export const menuRouter = {
  listCategories,
  listProducts,
  getProductBySlug,
};
