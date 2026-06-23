import { setRequestLocale } from "next-intl/server";

import { OrdersList } from "@/components/orders/orders-list";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <OrdersList />;
}
