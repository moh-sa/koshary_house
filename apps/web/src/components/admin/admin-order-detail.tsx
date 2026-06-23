"use client";

import { type OrderStatus, OrderStatusSchema } from "@food/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { OrderTimeline } from "@/components/orders/order-timeline";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { pickName } from "@/lib/menu-helpers";
import { orpc } from "@/lib/orpc";
import { formatPrice } from "@/lib/utils";

const STATUSES = OrderStatusSchema.options;

export function AdminOrderDetail({ id }: { id: string }) {
  const t = useTranslations("orders");
  const ta = useTranslations("admin");
  const tc = useTranslations("cart");
  const ts = useTranslations("status");
  const tm = useTranslations("payMethod");
  const tp = useTranslations("payStatus");
  const tt = useTranslations("toast");
  const locale = useLocale();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery(
    orpc.admin.orders.getById.queryOptions({
      input: { id },
      refetchInterval: 10_000,
    }),
  );

  const updateStatus = useMutation(
    orpc.admin.orders.updateStatus.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success(tt("statusUpdated"));
      },
      onError: () => toast.error(tt("error")),
    }),
  );

  if (isLoading || !data) {
    return <Skeleton className="h-96 rounded-xl" />;
  }

  const fmtDate = (d: Date | string) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(d));

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/admin/orders">
          <ArrowLeft className="rtl-flip size-4" />
          {ta("orders")}
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">
          #{data.id.slice(0, 8)}
        </h1>
        <div className="flex items-center gap-3">
          <StatusBadge status={data.status} />
          <Select
            value={data.status}
            onValueChange={(v) =>
              updateStatus.mutate({ id: data.id, status: v as OrderStatus })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {ts(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("trackTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline status={data.status} />
          </CardContent>
        </Card>

        <div className="space-y-6">
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
              <div className="flex justify-between font-semibold">
                <span>{tc("total")}</span>
                <span>{formatPrice(data.totalCents, locale)}</span>
              </div>
            </CardContent>
          </Card>

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
              <p className="text-muted-foreground">{fmtDate(data.createdAt)}</p>
              <Separator className="my-3" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("paymentMethod")}</span>
                <span>{tm(data.paymentMethod)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("paymentStatus")}</span>
                <span>{tp(data.paymentStatus)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
