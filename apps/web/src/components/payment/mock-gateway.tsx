"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "@/i18n/navigation";
import { orpc } from "@/lib/orpc";
import { formatPrice } from "@/lib/utils";

export function MockGateway() {
  const t = useTranslations("payment");
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get("order") ?? "";
  const [pending, setPending] = useState<"pay" | "cancel" | null>(null);

  const { data } = useQuery(
    orpc.orders.getById.queryOptions({
      input: { id: orderId },
      enabled: !!orderId,
    }),
  );

  async function resolve(success: boolean) {
    setPending(success ? "pay" : "cancel");
    try {
      await fetch(`/payments/mock/${orderId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ success }),
      });
    } finally {
      router.push(
        `/checkout/${success ? "success" : "failed"}?order=${orderId}`,
      );
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="bg-warm-gradient mx-auto grid size-12 place-items-center rounded-xl text-white">
            <CreditCard className="size-6" />
          </div>
          <CardTitle className="mt-2">{t("mockTitle")}</CardTitle>
          <CardDescription>{t("mockDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data && (
            <div className="rounded-lg border bg-muted/40 p-4 text-center">
              <p className="text-3xl font-extrabold">
                {formatPrice(data.totalCents, locale)}
              </p>
            </div>
          )}
          <Button
            size="lg"
            className="w-full"
            disabled={pending !== null}
            onClick={() => resolve(true)}
          >
            {pending === "pay" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            {pending === "pay"
              ? t("processing")
              : t("mockPay", {
                  amount: data ? formatPrice(data.totalCents, locale) : "",
                })}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={pending !== null}
            onClick={() => resolve(false)}
          >
            {t("mockCancel")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
