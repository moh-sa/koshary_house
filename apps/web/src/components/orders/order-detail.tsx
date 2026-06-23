"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { OrderTimeline } from "@/components/orders/order-timeline";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { pickName } from "@/lib/menu-helpers";
import { orpc } from "@/lib/orpc";
import { useRequireAuth } from "@/lib/use-require-auth";
import { formatPrice } from "@/lib/utils";

export function OrderDetail({ id }: { id: string }) {
  const t = useTranslations("orders");
  const tc = useTranslations("cart");
  const tm = useTranslations("payMethod");
  const tp = useTranslations("payStatus");
  const locale = useLocale();
  const { ready } = useRequireAuth(`/orders/${id}`);

  const { data, isLoading } = useQuery(
    orpc.orders.getById.queryOptions({
      input: { id },
      enabled: ready,
      // Poll so admin status changes appear "live".
      refetchInterval: 5000,
    }),
  );

  if (isLoading || !ready || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/orders">
          <ArrowLeft className="rtl-flip size-4" />
          {t("title")}
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {t("orderNumber", { id: data.id.slice(0, 8) })}
        </h1>
        <StatusBadge status={data.status} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1fr]">
        {/* Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>{t("trackTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline status={data.status} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>{t("itemsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {pickName(item, locale)} ×{item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.unitPriceCents * item.quantity, locale)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{tc("subtotal")}</span>
                <span>{formatPrice(data.subtotalCents, locale)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{tc("delivery")}</span>
                <span>{formatPrice(data.deliveryFeeCents, locale)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>{tc("total")}</span>
                <span>{formatPrice(data.totalCents, locale)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery + payment */}
          <Card>
            <CardHeader>
              <CardTitle>{t("deliveryTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{data.contactName}</p>
              <p className="text-muted-foreground">{data.phone}</p>
              <p className="text-muted-foreground">
                {data.street}, {data.city}
              </p>
              {data.notes && (
                <p className="text-muted-foreground">{data.notes}</p>
              )}
              <Separator className="my-3" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("paymentMethod")}
                </span>
                <span>{tm(data.paymentMethod)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("paymentStatus")}
                </span>
                <span>{tp(data.paymentStatus)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
