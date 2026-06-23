"use client";

import type { OrderStatus } from "@food/contract";
import { useTranslations } from "next-intl";

import { Badge, type BadgeProps } from "@/components/ui/badge";

const VARIANT: Record<OrderStatus, BadgeProps["variant"]> = {
  PENDING: "warning",
  CONFIRMED: "default",
  PREPARING: "default",
  OUT_FOR_DELIVERY: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("status");
  return <Badge variant={VARIANT[status]}>{t(status)}</Badge>;
}
