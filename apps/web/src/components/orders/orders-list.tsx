"use client";

import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { orpc } from "@/lib/orpc";
import { useRequireAuth } from "@/lib/use-require-auth";
import { formatPrice } from "@/lib/utils";

export function OrdersList() {
  const t = useTranslations("orders");
  const locale = useLocale();
  const { ready } = useRequireAuth("/orders");

  const { data, isLoading } = useQuery(
    orpc.orders.listMine.queryOptions({ enabled: ready }),
  );

  const fmtDate = (d: Date | string) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(d));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight">
        {t("title")}
      </h1>

      {isLoading || !ready ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {t("orderNumber", { id: o.id.slice(0, 8) })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("placedOn", { date: fmtDate(o.createdAt) })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={o.status} />
                    <span className="font-medium">
                      {formatPrice(o.totalCents, locale)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-20 text-center text-muted-foreground">
          <Package className="size-10" />
          <p>{t("empty")}</p>
          <Button asChild>
            <Link href="/menu">{t("emptyCta")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
