"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, UtensilsCrossed } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { pickName } from "@/lib/menu-helpers";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

export function MenuBrowser({ initialCategory }: { initialCategory?: string }) {
  const t = useTranslations("menu");
  const locale = useLocale();
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(id);
  }, [search]);

  const cats = useQuery(orpc.menu.listCategories.queryOptions());
  const products = useQuery(
    orpc.menu.listProducts.queryOptions({
      input: { categoryId: category, search: debounced || undefined },
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Search */}
      <div className="relative mx-auto mt-6 max-w-md">
        <Search className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="ps-9"
        />
      </div>

      {/* Category pills */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <CategoryPill
          active={!category}
          onClick={() => setCategory(undefined)}
          label={t("allCategories")}
        />
        {cats.data?.map((c) => (
          <CategoryPill
            key={c.id}
            active={category === c.id}
            onClick={() => setCategory(c.id)}
            label={pickName(c, locale)}
          />
        ))}
      </div>

      {/* Grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))
          : products.data?.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
      </div>

      {!products.isLoading && products.data?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <UtensilsCrossed className="size-10" />
          <p>{t("empty")}</p>
        </div>
      )}
    </div>
  );
}

function CategoryPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-card hover:border-primary/40 hover:text-primary",
      )}
    >
      {label}
    </button>
  );
}
