"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";

export function PopularDishes() {
  const t = useTranslations("home");
  const { data, isLoading } = useQuery(
    orpc.menu.listProducts.queryOptions({ input: {} }),
  );

  const popular = data?.slice(0, 6);

  return (
    <section id="popular" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("popularTitle")}
        </h2>
        <p className="mt-2 text-muted-foreground">{t("popularSubtitle")}</p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))
          : popular?.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
      </div>
    </section>
  );
}
