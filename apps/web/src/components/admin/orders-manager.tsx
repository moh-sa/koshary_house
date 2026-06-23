"use client";

import { type OrderStatus, OrderStatusSchema } from "@food/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/orders/status-badge";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import { formatPrice } from "@/lib/utils";

const STATUSES = OrderStatusSchema.options;
const ALL = "ALL";

export function OrdersManager() {
  const t = useTranslations("admin");
  const ts = useTranslations("status");
  const tt = useTranslations("toast");
  const locale = useLocale();
  const qc = useQueryClient();

  const [filter, setFilter] = useState<string>(ALL);
  const status = filter === ALL ? undefined : (filter as OrderStatus);

  const { data, isLoading } = useQuery(
    orpc.admin.orders.listAll.queryOptions({
      input: { status },
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

  const fmtDate = (d: Date | string) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(d));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {t("orders")}
        </h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filterAll")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ts(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-semibold hover:text-primary hover:underline"
                    >
                      #{o.id.slice(0, 8)}
                    </Link>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {o.contactName} · {o.phone} · {fmtDate(o.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.items.length} {t("items")} ·{" "}
                    {formatPrice(o.totalCents, locale)}
                  </p>
                </div>
                <Select
                  value={o.status}
                  onValueChange={(v) =>
                    updateStatus.mutate({ id: o.id, status: v as OrderStatus })
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
            </Card>
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-muted-foreground">
          {t("noOrders")}
        </p>
      )}
    </div>
  );
}
