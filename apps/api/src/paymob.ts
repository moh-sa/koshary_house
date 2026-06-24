import { createHmac } from "node:crypto";

import { env, isPaymobLive } from "./env";

export interface PaymentSessionInput {
  orderId: string;
  amountCents: number;
  items: { name: string; amountCents: number; quantity: number }[];
  customer: { firstName: string; lastName: string; email: string; phone: string };
  locale: string;
}

export interface PaymentSession {
  paymentUrl: string;
  paymobOrderId: string | null;
}

/**
 * Creates a payment session. In "sandbox" mode it calls Paymob's Unified
 * Intention API and returns the hosted checkout URL. In "mock" mode it returns
 * a local checkout page that drives the same success/failed redirect flow, so
 * the demo never blocks on credentials.
 */
export async function createPaymentSession(
  input: PaymentSessionInput,
): Promise<PaymentSession> {
  // Fall back to the mock gateway unless real Paymob is active for this env.
  if (!isPaymobLive) {
    if (env.PAYMOB_MODE === "sandbox") {
      console.warn(
        "[paymob] Using mock checkout — real sandbox is inactive here " +
          "(needs full credentials AND a reachable webhook: production, or " +
          "PAYMOB_FORCE_LIVE=true with a public tunnel).",
      );
    }
    return {
      paymentUrl: `${env.WEB_ORIGIN}/${input.locale}/checkout/mock/${input.orderId}`,
      paymobOrderId: null,
    };
  }

  const res = await fetch(`${env.PAYMOB_BASE_URL}/v1/intention/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${env.PAYMOB_SECRET_KEY}`,
    },
    body: JSON.stringify({
      amount: input.amountCents,
      currency: "EGP",
      payment_methods: [Number(env.PAYMOB_INTEGRATION_ID)],
      items: input.items.map((i) => ({
        name: i.name,
        amount: i.amountCents,
        quantity: i.quantity,
      })),
      billing_data: {
        first_name: input.customer.firstName,
        last_name: input.customer.lastName,
        email: input.customer.email,
        phone_number: input.customer.phone,
      },
      extras: { order_id: input.orderId },
      // Path segment, not a query param: Paymob discards whatever query
      // string we pass and appends its own (which includes its own "order"
      // and "id" keys) — a query param here would get silently overwritten.
      redirection_url: `${env.WEB_ORIGIN}/${input.locale}/checkout/success/${input.orderId}`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paymob intention failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    client_secret: string;
    intention_order_id?: string | number;
  };

  return {
    paymentUrl: `${env.PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${env.PAYMOB_PUBLIC_KEY}&clientSecret=${data.client_secret}`,
    paymobOrderId: data.intention_order_id?.toString() ?? null,
  };
}

/**
 * Verifies a Paymob transaction-processed webhook HMAC. Paymob concatenates a
 * fixed, ordered subset of the `obj` fields and signs with the HMAC secret.
 */
export function verifyPaymobHmac(
  obj: Record<string, unknown>,
  receivedHmac: string,
): boolean {
  const fields = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order.id",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
  ];

  const concatenated = fields
    .map((path) => {
      const value = path
        .split(".")
        .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], obj);
      if (typeof value === "boolean") return value ? "true" : "false";
      return value === undefined || value === null ? "" : String(value);
    })
    .join("");

  const computed = createHmac("sha512", env.PAYMOB_HMAC_SECRET)
    .update(concatenated)
    .digest("hex");

  return computed === receivedHmac;
}
