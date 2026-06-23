"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { ProductImage } from "@/components/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { pickName } from "@/lib/menu-helpers";
import { orpc } from "@/lib/orpc";

export function CategoryStrip() {
  const t = useTranslations("home");
  const locale = useLocale();

  const cats = useQuery(orpc.menu.listCategories.queryOptions());
  const products = useQuery(orpc.menu.listProducts.queryOptions({ input: {} }));

  // Cover image + dish count per category, derived from the product list.
  const byCat = useMemo(() => {
    const m = new Map<string, { cover: string; count: number }>();
    for (const p of products.data ?? []) {
      const cur = m.get(p.categoryId);
      if (cur) cur.count++;
      else m.set(p.categoryId, { cover: p.imageUrl, count: 1 });
    }
    return m;
  }, [products.data]);

  const loading = cats.isLoading || products.isLoading;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("featuredTitle")}
        </h2>
        <p className="mt-2 text-muted-foreground">{t("featuredSubtitle")}</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))
          : cats.data?.map((c, i) => {
              const meta = byCat.get(c.id);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
                >
                  <Link
                    href={`/menu?category=${c.id}`}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {meta ? (
                      <ProductImage
                        src={meta.cover}
                        alt={pickName(c, locale)}
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="bg-warm-gradient absolute inset-0" />
                    )}

                    {/* Readability gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                    {/* Animated arrow chip */}
                    <div className="absolute top-3 end-3 grid size-9 place-items-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:bg-primary">
                      <ArrowUpRight className="rtl-flip size-4" />
                    </div>

                    {/* Label */}
                    <div className="absolute inset-x-0 bottom-0 p-4 text-start">
                      <h3 className="text-lg font-bold leading-tight text-white drop-shadow">
                        {pickName(c, locale)}
                      </h3>
                      {meta && (
                        <p className="mt-0.5 text-xs font-medium text-white/80">
                          {t("dishCount", { count: meta.count })}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
      </div>
    </section>
  );
}
