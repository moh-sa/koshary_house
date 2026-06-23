import { setRequestLocale } from "next-intl/server";

import { PaymentResult } from "@/components/payment/payment-result";

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  const { order } = await searchParams;
  setRequestLocale(locale);

  return <PaymentResult kind="success" orderId={order} />;
}
