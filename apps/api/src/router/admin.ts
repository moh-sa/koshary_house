import { db, order, product } from "@food/db";
import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";

import { toOrderDTO, toProductDTO } from "../mappers";
import { adminOnly } from "../orpc";

/* ───────────────────────── Products ──────────────────────── */

const listAllProducts = adminOnly.admin.products.listAll.handler(async () => {
  const rows = await db.select().from(product).orderBy(desc(product.createdAt));
  return rows.map(toProductDTO);
});

const createProduct = adminOnly.admin.products.create.handler(
  async ({ input }) => {
    const [row] = await db.insert(product).values(input).returning();
    return toProductDTO(row!);
  },
);

const updateProduct = adminOnly.admin.products.update.handler(
  async ({ input }) => {
    const { id, ...patch } = input;
    const [row] = await db
      .update(product)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(product.id, id))
      .returning();
    if (!row)
      throw new ORPCError("NOT_FOUND", { message: "Product not found" });
    return toProductDTO(row);
  },
);

const deleteProduct = adminOnly.admin.products.delete.handler(
  async ({ input }) => {
    await db.delete(product).where(eq(product.id, input.id));
    return { success: true };
  },
);

/* ───────────────────────── Orders ────────────────────────── */

const listAllOrders = adminOnly.admin.orders.listAll.handler(
  async ({ input }) => {
    const rows = await db.query.order.findMany({
      where: input.status ? eq(order.status, input.status) : undefined,
      with: { items: true },
      orderBy: desc(order.createdAt),
    });
    return rows.map(toOrderDTO);
  },
);

const getOrder = adminOnly.admin.orders.getById.handler(async ({ input }) => {
  const row = await db.query.order.findFirst({
    where: eq(order.id, input.id),
    with: { items: true },
  });
  if (!row) throw new ORPCError("NOT_FOUND", { message: "Order not found" });
  return toOrderDTO(row);
});

const updateStatus = adminOnly.admin.orders.updateStatus.handler(
  async ({ input }) => {
    const existing = await db.query.order.findFirst({
      where: eq(order.id, input.id),
    });
    if (!existing)
      throw new ORPCError("NOT_FOUND", { message: "Order not found" });

    const patch: {
      status: typeof input.status;
      updatedAt: Date;
      paymentStatus?: "PAID";
    } = { status: input.status, updatedAt: new Date() };

    // A delivered order is realized revenue: COD is settled on delivery, and an
    // online order can only be handed over once paid. Mark it paid either way so
    // it counts toward revenue (delivered + paid).
    if (input.status === "DELIVERED") {
      patch.paymentStatus = "PAID";
    }

    await db.update(order).set(patch).where(eq(order.id, input.id));
    const row = await db.query.order.findFirst({
      where: eq(order.id, input.id),
      with: { items: true },
    });
    return toOrderDTO(row!);
  },
);

/* ───────────────────────── Stats ─────────────────────────── */

const stats = adminOnly.admin.stats.handler(async () => {
  const [[orders], [products], [pending], [revenue]] = await Promise.all([
    db.select({ c: count() }).from(order),
    db.select({ c: count() }).from(product),
    db.select({ c: count() }).from(order).where(eq(order.status, "PENDING")),
    db
      .select({ total: sql<number>`coalesce(sum(${order.totalCents}), 0)` })
      .from(order)
      .where(
        and(eq(order.status, "DELIVERED"), eq(order.paymentStatus, "PAID")),
      ),
  ]);

  const recent = await db.query.order.findMany({
    with: { items: true },
    orderBy: desc(order.createdAt),
    limit: 8,
  });

  // Revenue per day for the last 7 days, bucketed in a fixed timezone so the
  // day keys line up regardless of the server clock. Delivered + paid only.
  const TZ = "Africa/Cairo";
  const dayKey = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);

  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const recentForChart = await db
    .select({ totalCents: order.totalCents, createdAt: order.createdAt })
    .from(order)
    .where(
      and(
        gte(order.createdAt, weekAgo),
        eq(order.status, "DELIVERED"),
        eq(order.paymentStatus, "PAID"),
      ),
    );

  const byDay = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    byDay.set(dayKey(new Date(Date.now() - i * 86_400_000)), 0);
  }
  for (const r of recentForChart) {
    const key = dayKey(r.createdAt);
    if (byDay.has(key)) byDay.set(key, byDay.get(key)! + r.totalCents);
  }

  return {
    totalOrders: Number(orders!.c),
    totalRevenueCents: Number(revenue!.total),
    pendingOrders: Number(pending!.c),
    totalProducts: Number(products!.c),
    recentOrders: recent.map(toOrderDTO),
    revenueByDay: [...byDay.entries()].map(([date, revenueCents]) => ({
      date,
      revenueCents,
    })),
  };
});

export const adminRouter = {
  products: {
    listAll: listAllProducts,
    create: createProduct,
    update: updateProduct,
    delete: deleteProduct,
  },
  orders: {
    listAll: listAllOrders,
    getById: getOrder,
    updateStatus,
  },
  stats,
};
