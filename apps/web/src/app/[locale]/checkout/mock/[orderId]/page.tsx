import { setRequestLocale } from "next-intl/server";

import { MockGateway } from "@/components/payment/mock-gateway";

export default async function MockPaymentPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  setRequestLocale(locale);

  return <MockGateway orderId={orderId} />;
}
