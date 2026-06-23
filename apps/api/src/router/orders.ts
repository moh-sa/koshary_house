import { db, order, orderItem, product } from "@food/db";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";

import { toOrderDTO } from "../mappers";
import { authed } from "../orpc";
import { createPaymentSession } from "../paymob";

/** Flat delivery fee in EGP piastres (25.00 EGP). */
const DELIVERY_FEE_CENTS = 2500;

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "Guest",
    lastName: parts.slice(1).join(" ") || "Customer",
  };
}

export const create = authed.orders.create.handler(async ({ input, context }) => {
  const productIds = input.items.map((i) => i.productId);
  const rows = await db
    .select()
    .from(product)
    .where(inArray(product.id, productIds));
  const byId = new Map(rows.map((p) => [p.id, p]));

  // Re-price from the database — never trust client-supplied prices.
  let subtotal = 0;
  const itemsToInsert = input.items.map((ci) => {
    const p = byId.get(ci.productId);
    if (!p || !p.isAvailable) {
      throw new ORPCError("BAD_REQUEST", {
        message: "One or more items are unavailable",
      });
    }
    subtotal += p.priceCents * ci.quantity;
    return {
      productId: p.id,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      unitPriceCents: p.priceCents,
      quantity: ci.quantity,
    };
  });

  const total = subtotal + DELIVERY_FEE_CENTS;
  const isCod = input.paymentMethod === "COD";

  const [orderRow] = await db
    .insert(order)
    .values({
      userId: context.user.id,
      paymentMethod: input.paymentMethod,
      status: isCod ? "CONFIRMED" : "PENDING",
      paymentStatus: "PENDING",
      subtotalCents: subtotal,
      deliveryFeeCents: DELIVERY_FEE_CENTS,
      totalCents: total,
      contactName: input.address.contactName,
      phone: input.address.phone,
      street: input.address.street,
      city: input.address.city,
      notes: input.address.notes ?? null,
    })
    .returning();

  await db
    .insert(orderItem)
    .values(itemsToInsert.map((i) => ({ ...i, orderId: orderRow!.id })));

  let paymentUrl: string | null = null;
  if (input.paymentMethod === "ONLINE") {
    const locale = context.headers.get("x-locale") ?? "en";
    const name = splitName(context.user.name);
    const session = await createPaymentSession({
      orderId: orderRow!.id,
      amountCents: total,
      items: [
        ...itemsToInsert.map((i) => ({
          name: i.nameEn,
          amountCents: i.unitPriceCents,
          quantity: i.quantity,
        })),
        {
          name: "Delivery",
          amountCents: DELIVERY_FEE_CENTS,
          quantity: 1,
        },
      ],
      customer: {
        firstName: name.firstName,
        lastName: name.lastName,
        email: context.user.email,
        phone: input.address.phone,
      },
      locale,
    });
    paymentUrl = session.paymentUrl;
    if (session.paymobOrderId) {
      await db
        .update(order)
        .set({ paymobOrderId: session.paymobOrderId })
        .where(eq(order.id, orderRow!.id));
    }
  }

  const full = await db.query.order.findFirst({
    where: eq(order.id, orderRow!.id),
    with: { items: true },
  });
  return { order: toOrderDTO(full!), paymentUrl };
});

export const listMine = authed.orders.listMine.handler(async ({ context }) => {
  const rows = await db.query.order.findMany({
    where: eq(order.userId, context.user.id),
    with: { items: true },
    orderBy: desc(order.createdAt),
  });
  return rows.map(toOrderDTO);
});

export const getById = authed.orders.getById.handler(async ({ input, context }) => {
  const row = await db.query.order.findFirst({
    where: and(eq(order.id, input.id), eq(order.userId, context.user.id)),
    with: { items: true },
  });
  if (!row) throw new ORPCError("NOT_FOUND", { message: "Order not found" });
  return toOrderDTO(row);
});

export const ordersRouter = { create, listMine, getById };
