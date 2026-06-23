"use client";

import type { OrderStatus } from "@food/contract";
import { motion } from "framer-motion";
import {
  Check,
  ChefHat,
  CircleCheck,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

const FLOW: { status: OrderStatus; icon: typeof Clock }[] = [
  { status: "PENDING", icon: Clock },
  { status: "CONFIRMED", icon: CircleCheck },
  { status: "PREPARING", icon: ChefHat },
  { status: "OUT_FOR_DELIVERY", icon: Truck },
  { status: "DELIVERED", icon: Check },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const t = useTranslations("status");

  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-destructive">
        <XCircle className="size-6" />
        <span className="font-medium">{t("CANCELLED")}</span>
      </div>
    );
  }

  const currentIndex = FLOW.findIndex((s) => s.status === status);

  return (
    <ol className="relative">
      {FLOW.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const isLast = i === FLOW.length - 1;
        const Icon = step.icon;
        return (
          <li
            key={step.status}
            className="relative flex items-center gap-4 pb-8 last:pb-0"
          >
            {/* Connector spans from this icon's bottom to the next icon. */}
            {!isLast && (
              <span
                className={cn(
                  "absolute start-5 top-10 -translate-x-1/2 w-0.5 h-[calc(100%-2.5rem)]",
                  i < currentIndex ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 transition-colors",
                done && "border-primary bg-primary text-primary-foreground",
                active &&
                  "border-primary bg-primary/10 text-primary ring-4 ring-primary/15",
                !done && !active && "border-border bg-card text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
            </motion.div>
            <p
              className={cn(
                "font-medium",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {t(step.status)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
