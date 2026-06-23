"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { pickDesc, pickName } from "@/lib/menu-helpers";
import { orpc } from "@/lib/orpc";
import { formatPrice } from "@/lib/utils";

export function ProductDetail({ slug }: { slug: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);

  const { data, isLoading, isError } = useQuery(
    orpc.menu.getProductBySlug.queryOptions({ input: { slug } }),
  );

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-2">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <p className="text-lg font-medium">{t("menu.empty")}</p>
        <Button asChild variant="secondary">
          <Link href="/menu">{t("product.backToMenu")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/menu">
          <ArrowLeft className="rtl-flip size-4" />
          {t("product.backToMenu")}
        </Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border shadow-sm">
          <ProductImage
            src={data.imageUrl}
            alt={pickName(data, locale)}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {pickName(data, locale)}
          </h1>
          <p className="mt-2 text-2xl font-bold text-primary">
            {formatPrice(data.priceCents, locale)}
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {pickDesc(data, locale)}
          </p>

          <div className="mt-auto pt-8">
            {data.isAvailable ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 rounded-lg border p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{qty}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    add(data, qty);
                    toast.success(t("toast.addedToCart"));
                  }}
                >
                  {t("product.addToCart")}
                </Button>
              </div>
            ) : (
              <p className="rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
                {t("product.unavailable")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
