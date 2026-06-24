import { setRequestLocale } from "next-intl/server";

import { PaymentResult } from "@/components/payment/payment-result";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  setRequestLocale(locale);

  return <PaymentResult kind="success" orderId={orderId} />;
}
