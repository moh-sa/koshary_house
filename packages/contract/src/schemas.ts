import { z } from "zod";

/* ───────────────────────── Enums ─────────────────────────── */

export const OrderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const PaymentMethodSchema = z.enum(["ONLINE", "COD"]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const PaymentStatusSchema = z.enum(["PENDING", "PAID", "FAILED"]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

/* ──────────────────────── Entities ───────────────────────── */

export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameEn: z.string(),
  nameAr: z.string(),
  sortOrder: z.number().int(),
});
export type Category = z.infer<typeof CategorySchema>;

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameEn: z.string(),
  nameAr: z.string(),
  descEn: z.string(),
  descAr: z.string(),
  /** Price in EGP piastres (integer). */
  priceCents: z.number().int().nonnegative(),
  imageUrl: z.string(),
  categoryId: z.string(),
  isAvailable: z.boolean(),
});
export type Product = z.infer<typeof ProductSchema>;

export const OrderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  nameEn: z.string(),
  nameAr: z.string(),
  unitPriceCents: z.number().int(),
  quantity: z.number().int().positive(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  status: OrderStatusSchema,
  paymentMethod: PaymentMethodSchema,
  paymentStatus: PaymentStatusSchema,
  subtotalCents: z.number().int(),
  deliveryFeeCents: z.number().int(),
  totalCents: z.number().int(),
  contactName: z.string(),
  phone: z.string(),
  street: z.string(),
  city: z.string(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  items: z.array(OrderItemSchema),
});
export type Order = z.infer<typeof OrderSchema>;

/* ───────────────────────── Inputs ────────────────────────── */

export const AddressSchema = z.object({
  contactName: z.string().min(2).max(80),
  phone: z.string().min(6).max(20),
  street: z.string().min(3).max(160),
  city: z.string().min(2).max(80),
  notes: z.string().max(400).optional(),
});
export type Address = z.infer<typeof AddressSchema>;

export const CartItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});

export const CreateOrderInputSchema = z.object({
  items: z.array(CartItemInputSchema).min(1),
  address: AddressSchema,
  paymentMethod: PaymentMethodSchema,
});

export const CreateOrderResultSchema = z.object({
  order: OrderSchema,
  /** Present only for ONLINE payments — redirect the user here. */
  paymentUrl: z.string().nullable(),
});

export const ProductInputSchema = z.object({
  slug: z.string().min(1).max(120),
  nameEn: z.string().min(1).max(120),
  nameAr: z.string().min(1).max(120),
  descEn: z.string().max(600).default(""),
  descAr: z.string().max(600).default(""),
  priceCents: z.number().int().nonnegative(),
  imageUrl: z.string().url(),
  categoryId: z.string().uuid(),
  isAvailable: z.boolean().default(true),
});
export type ProductInput = z.infer<typeof ProductInputSchema>;

/* ──────────────────────── Admin stats ────────────────────── */

export const StatsSchema = z.object({
  totalOrders: z.number().int(),
  totalRevenueCents: z.number().int(),
  pendingOrders: z.number().int(),
  totalProducts: z.number().int(),
  recentOrders: z.array(OrderSchema),
  revenueByDay: z.array(
    z.object({ date: z.string(), revenueCents: z.number().int() }),
  ),
});
export type Stats = z.infer<typeof StatsSchema>;
