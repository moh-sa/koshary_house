import { db, order } from "@food/db";
import { eq } from "drizzle-orm";
import { Router } from "express";

import { verifyPaymobHmac } from "./paymob";

export const paymentRoutes: Router = Router();

/**
 * Paymob transaction-processed webhook. Paymob POSTs `{ type, obj }` with the
 * HMAC in the `?hmac=` query param. This is the source of truth for ONLINE
 * payment status.
 */
paymentRoutes.post("/webhooks/paymob", async (req, res) => {
  const receivedHmac = String(req.query.hmac ?? "");
  const obj = req.body?.obj as Record<string, unknown> | undefined;

  if (!obj || !verifyPaymobHmac(obj, receivedHmac)) {
    return res.status(401).json({ ok: false, error: "invalid hmac" });
  }

  const success = obj.success === true || obj.success === "true";
  const paymobOrderId = (obj as { order?: { id?: unknown } }).order?.id;
  if (paymobOrderId == null) {
    return res.status(400).json({ ok: false, error: "missing order id" });
  }

  await db
    .update(order)
    .set({
      paymentStatus: success ? "PAID" : "FAILED",
      status: success ? "CONFIRMED" : "CANCELLED",
      updatedAt: new Date(),
    })
    .where(eq(order.paymobOrderId, String(paymobOrderId)));

  return res.json({ ok: true });
});

/**
 * Mock payment endpoint used when PAYMOB_MODE=mock. The mock checkout page in
 * the web app calls this to simulate a paid/failed transaction.
 */
paymentRoutes.post("/payments/mock/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const success = req.body?.success !== false;

  await db
    .update(order)
    .set({
      paymentStatus: success ? "PAID" : "FAILED",
      status: success ? "CONFIRMED" : "CANCELLED",
      updatedAt: new Date(),
    })
    .where(eq(order.id, orderId));

  return res.json({ ok: true, success });
});
