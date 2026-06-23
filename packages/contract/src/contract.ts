import { oc } from "@orpc/contract";
import { z } from "zod";

import {
  CategorySchema,
  CreateOrderInputSchema,
  CreateOrderResultSchema,
  OrderSchema,
  OrderStatusSchema,
  ProductInputSchema,
  ProductSchema,
  StatsSchema,
} from "./schemas";

/* ───────────────────────── Menu (public) ─────────────────── */

const menu = {
  listCategories: oc
    .route({ method: "GET", path: "/menu/categories", tags: ["Menu"] })
    .output(z.array(CategorySchema)),

  listProducts: oc
    .route({ method: "GET", path: "/menu/products", tags: ["Menu"] })
    .input(
      z.object({
        categoryId: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .output(z.array(ProductSchema)),

  getProductBySlug: oc
    .route({ method: "GET", path: "/menu/products/{slug}", tags: ["Menu"] })
    .input(z.object({ slug: z.string() }))
    .output(ProductSchema),
};

/* ───────────────────────── Orders (auth) ─────────────────── */

const orders = {
  create: oc
    .route({ method: "POST", path: "/orders", tags: ["Orders"] })
    .input(CreateOrderInputSchema)
    .output(CreateOrderResultSchema),

  listMine: oc
    .route({ method: "GET", path: "/orders", tags: ["Orders"] })
    .output(z.array(OrderSchema)),

  getById: oc
    .route({ method: "GET", path: "/orders/{id}", tags: ["Orders"] })
    .input(z.object({ id: z.string() }))
    .output(OrderSchema),
};

/* ───────────────────────── Admin (ADMIN) ─────────────────── */

const admin = {
  products: {
    listAll: oc
      .route({ method: "GET", path: "/admin/products", tags: ["Admin"] })
      .output(z.array(ProductSchema)),

    create: oc
      .route({ method: "POST", path: "/admin/products", tags: ["Admin"] })
      .input(ProductInputSchema)
      .output(ProductSchema),

    update: oc
      .route({ method: "PUT", path: "/admin/products/{id}", tags: ["Admin"] })
      .input(ProductInputSchema.partial().extend({ id: z.string() }))
      .output(ProductSchema),

    delete: oc
      .route({
        method: "DELETE",
        path: "/admin/products/{id}",
        tags: ["Admin"],
      })
      .input(z.object({ id: z.string() }))
      .output(z.object({ success: z.boolean() })),
  },
  orders: {
    listAll: oc
      .route({ method: "GET", path: "/admin/orders", tags: ["Admin"] })
      .input(z.object({ status: OrderStatusSchema.optional() }))
      .output(z.array(OrderSchema)),

    getById: oc
      .route({ method: "GET", path: "/admin/orders/{id}", tags: ["Admin"] })
      .input(z.object({ id: z.string() }))
      .output(OrderSchema),

    updateStatus: oc
      .route({
        method: "PATCH",
        path: "/admin/orders/{id}/status",
        tags: ["Admin"],
      })
      .input(z.object({ id: z.string(), status: OrderStatusSchema }))
      .output(OrderSchema),
  },
  stats: oc
    .route({ method: "GET", path: "/admin/stats", tags: ["Admin"] })
    .output(StatsSchema),
};

export const contract = { menu, orders, admin };
export type Contract = typeof contract;
