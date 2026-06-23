import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { MockGateway } from "@/components/payment/mock-gateway";

export default async function MockPaymentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense>
      <MockGateway />
    </Suspense>
  );
}
