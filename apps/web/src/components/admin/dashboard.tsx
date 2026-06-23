"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, DollarSign, Package, ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatusBadge } from "@/components/orders/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { orpc } from "@/lib/orpc";
import { formatPrice } from "@/lib/utils";

export function AdminDashboard() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { data, isLoading } = useQuery(
    orpc.admin.stats.queryOptions({ refetchInterval: 10_000 }),
  );

  if (isLoading || !data) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-28 rounded-xl' />
          ))}
        </div>
        <Skeleton className='h-72 rounded-xl' />
      </div>
    );
  }

  const chartData = data.revenueByDay.map((d) => ({
    label: new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
      weekday: "short",
    }).format(new Date(d.date)),
    value: d.revenueCents / 100,
  }));

  const stats = [
    {
      label: t("totalOrders"),
      value: data.totalOrders,
      icon: ShoppingBag,
    },
    {
      label: t("revenue"),
      value: formatPrice(data.totalRevenueCents, locale),
      icon: DollarSign,
    },
    {
      label: t("pending"),
      value: data.pendingOrders,
      icon: Clock,
    },
    {
      label: t("totalProducts"),
      value: data.totalProducts,
      icon: Package,
    },
  ];

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-extrabold tracking-tight'>
        {t("overview")}
      </h1>

      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className='flex flex-col gap-2 p-5'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>{s.label}</span>
                <s.icon className='size-4 text-primary' />
              </div>
              <span className='text-2xl font-bold'>{s.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("revenueChart")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-64 w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id='rev' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor='#d2691e' stopOpacity={0.45} />
                    <stop offset='100%' stopColor='#d2691e' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey='label'
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis hide />
                <Tooltip
                  formatter={
                    ((v: number) => formatPrice(v * 100, locale)) as never
                  }
                  labelStyle={{ color: "var(--foreground)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='value'
                  stroke='#c2511f'
                  strokeWidth={2}
                  fill='url(#rev)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentOrders")}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {data.recentOrders.length === 0 && (
            <p className='text-sm text-muted-foreground'>{t("noOrders")}</p>
          )}
          {data.recentOrders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders`}
              className='flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-secondary/50'
            >
              <span className='font-medium'>#{o.id.slice(0, 8)}</span>
              <span className='text-muted-foreground'>{o.contactName}</span>
              <StatusBadge status={o.status} />
              <span className='font-medium'>
                {formatPrice(o.totalCents, locale)}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
