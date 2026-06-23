"use client";

import type { Product } from "@food/contract";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { pickDesc, pickName } from "@/lib/menu-helpers";
import { formatPrice } from "@/lib/utils";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const add = useCart((s) => s.add);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <Link
        href={`/menu/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <ProductImage
          src={product.imageUrl}
          alt={pickName(product, locale)}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {!product.isAvailable && (
          <div className="absolute inset-0 grid place-items-center bg-black/50 text-sm font-medium text-white">
            {t("product.unavailable")}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/menu/${product.slug}`} className="font-semibold hover:text-primary">
          {pickName(product, locale)}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {pickDesc(product, locale)}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.priceCents, locale)}
          </span>
          <Button
            size="sm"
            disabled={!product.isAvailable}
            onClick={() => {
              add(product);
              toast.success(t("toast.addedToCart"));
            }}
          >
            <Plus className="size-4" />
            {t("product.addToCart")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
