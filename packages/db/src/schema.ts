import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgSchema,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Everything lives in an isolated Postgres schema so this project can share a
 * Railway database with other projects without colliding.
 */
export const schema = pgSchema("food_ordering");

/** All datetime columns are stored as `timestamptz` (timezone-aware). */
const tz = (name: string) => timestamp(name, { withTimezone: true });

/* ────────────────────────── Enums ────────────────────────── */

export const orderStatus = schema.enum("order_status", [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);

export const paymentMethod = schema.enum("payment_method", ["ONLINE", "COD"]);

export const paymentStatus = schema.enum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
]);

/* ──────────────────── Better Auth tables ─────────────────────
 * Column shapes follow better-auth's default Postgres schema plus the
 * admin plugin fields (role / ban*). Keep names in sync with the adapter.
 * ──────────────────────────────────────────────────────────── */

export const user = schema.table("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  // admin plugin
  role: text("role").default("USER").notNull(),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: tz("ban_expires"),
  createdAt: tz("created_at").defaultNow().notNull(),
  updatedAt: tz("updated_at").defaultNow().notNull(),
});

export const session = schema.table("session", {
  id: text("id").primaryKey(),
  expiresAt: tz("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
  createdAt: tz("created_at").defaultNow().notNull(),
  updatedAt: tz("updated_at").defaultNow().notNull(),
});

export const account = schema.table("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: tz("access_token_expires_at"),
  refreshTokenExpiresAt: tz("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: tz("created_at").defaultNow().notNull(),
  updatedAt: tz("updated_at").defaultNow().notNull(),
});

export const verification = schema.table("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: tz("expires_at").notNull(),
  createdAt: tz("created_at").defaultNow().notNull(),
  updatedAt: tz("updated_at").defaultNow().notNull(),
});

/* ──────────────────────── App tables ─────────────────────── */

export const category = schema.table("category", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: tz("created_at").defaultNow().notNull(),
});

export const product = schema.table("product", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  descEn: text("desc_en").notNull().default(""),
  descAr: text("desc_ar").notNull().default(""),
  /** Price in EGP piastres (integer) to avoid float errors. */
  priceCents: integer("price_cents").notNull(),
  imageUrl: text("image_url").notNull(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => category.id, { onDelete: "restrict" }),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: tz("created_at").defaultNow().notNull(),
  updatedAt: tz("updated_at").defaultNow().notNull(),
});

export const order = schema.table("order", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  status: orderStatus("status").default("PENDING").notNull(),
  paymentMethod: paymentMethod("payment_method").notNull(),
  paymentStatus: paymentStatus("payment_status").default("PENDING").notNull(),
  subtotalCents: integer("subtotal_cents").notNull(),
  deliveryFeeCents: integer("delivery_fee_cents").default(0).notNull(),
  totalCents: integer("total_cents").notNull(),
  // Delivery / contact details captured at checkout
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  notes: text("notes"),
  // Paymob linkage (nullable for COD)
  paymobOrderId: text("paymob_order_id"),
  createdAt: tz("created_at").defaultNow().notNull(),
  updatedAt: tz("updated_at").defaultNow().notNull(),
});

export const orderItem = schema.table("order_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => order.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "restrict" }),
  // Snapshot product fields so historical orders are stable
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
});

/* ───────────────────────── Relations ─────────────────────── */

export const categoryRelations = relations(category, ({ many }) => ({
  products: many(product),
}));

export const productRelations = relations(product, ({ one }) => ({
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
}));

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, { fields: [order.userId], references: [user.id] }),
  items: many(orderItem),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, { fields: [orderItem.orderId], references: [order.id] }),
  product: one(product, {
    fields: [orderItem.productId],
    references: [product.id],
  }),
}));

/* ───────────────────────── Inferred types ─────────────────── */

export type User = typeof user.$inferSelect;
export type Category = typeof category.$inferSelect;
export type Product = typeof product.$inferSelect;
export type Order = typeof order.$inferSelect;
export type OrderItem = typeof orderItem.$inferSelect;
