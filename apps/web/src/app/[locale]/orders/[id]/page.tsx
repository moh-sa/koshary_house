import { setRequestLocale } from "next-intl/server";

import { OrderDetail } from "@/components/orders/order-detail";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <OrderDetail id={id} />;
}
