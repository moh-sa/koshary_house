"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import {
  cartCount,
  cartSubtotal,
  useCart,
  useHydrated,
} from "@/lib/cart-store";
import { DELIVERY_FEE_CENTS, pickName } from "@/lib/menu-helpers";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const hydrated = useHydrated();

  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const count = useCart(cartCount);
  const subtotal = useCart(cartSubtotal);
  const total = subtotal + (lines.length ? DELIVERY_FEE_CENTS : 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline' size='icon' className='relative'>
          <ShoppingBag className='size-5' />
          {hydrated && count > 0 && (
            <span className='absolute top-0 end-0 -mt-1.5 -me-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground'>
              {count}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>

        {!hydrated || lines.length === 0 ? (
          <div className='flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center'>
            <div className='grid size-16 place-items-center rounded-full bg-muted'>
              <ShoppingBag className='size-7 text-muted-foreground' />
            </div>
            <div>
              <p className='font-medium'>{t("empty")}</p>
              <p className='text-sm text-muted-foreground'>{t("emptyDesc")}</p>
            </div>
            <SheetClose asChild>
              <Button asChild variant='secondary'>
                <Link href='/menu'>{t("emptyCta")}</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className='flex-1 space-y-3 overflow-y-auto px-6'>
              {lines.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className='flex gap-3 rounded-lg border bg-card p-2'
                >
                  <div className='relative size-16 shrink-0 overflow-hidden rounded-md'>
                    <ProductImage
                      src={product.imageUrl}
                      alt={pickName(product, locale)}
                      sizes='64px'
                    />
                  </div>
                  <div className='flex min-w-0 flex-1 flex-col'>
                    <div className='flex items-start justify-between gap-2'>
                      <p className='truncate text-sm font-medium'>
                        {pickName(product, locale)}
                      </p>
                      <button
                        onClick={() => remove(product.id)}
                        className='text-muted-foreground transition-colors hover:text-destructive'
                        aria-label={t("remove")}
                      >
                        <Trash2 className='size-4' />
                      </button>
                    </div>
                    <p className='text-sm text-primary'>
                      {formatPrice(product.priceCents, locale)}
                    </p>
                    <div className='mt-auto flex items-center gap-1'>
                      <Button
                        variant='outline'
                        size='icon'
                        className='size-7'
                        onClick={() => setQty(product.id, quantity - 1)}
                      >
                        <Minus className='size-3' />
                      </Button>
                      <span className='w-8 text-center text-sm font-medium'>
                        {quantity}
                      </span>
                      <Button
                        variant='outline'
                        size='icon'
                        className='size-7'
                        onClick={() => setQty(product.id, quantity + 1)}
                      >
                        <Plus className='size-3' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='space-y-3 border-t p-6'>
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>{t("subtotal")}</span>
                <span>{formatPrice(subtotal, locale)}</span>
              </div>
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>{t("delivery")}</span>
                <span>{formatPrice(DELIVERY_FEE_CENTS, locale)}</span>
              </div>
              <div className='flex justify-between text-base font-semibold'>
                <span>{t("total")}</span>
                <span>{formatPrice(total, locale)}</span>
              </div>
              <SheetClose asChild>
                <Button asChild size='lg' className='w-full'>
                  <Link href='/checkout'>{t("checkout")}</Link>
                </Button>
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
