"use client";

import { AddressSchema, type Address } from "@food/contract";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CreditCard, Loader2, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "@/lib/auth-client";
import {
  cartSubtotal,
  useCart,
  useHydrated,
} from "@/lib/cart-store";
import { DELIVERY_FEE_CENTS, pickName } from "@/lib/menu-helpers";
import { orpc } from "@/lib/orpc";
import { cn, formatPrice } from "@/lib/utils";

type Method = "ONLINE" | "COD";

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const tt = useTranslations("toast");
  const locale = useLocale();
  const router = useRouter();
  const hydrated = useHydrated();

  const { data: session, isPending } = useSession();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart(cartSubtotal);
  const total = subtotal + (lines.length ? DELIVERY_FEE_CENTS : 0);

  const [method, setMethod] = useState<Method>("ONLINE");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Address>({
    resolver: zodResolver(AddressSchema),
    defaultValues: { contactName: session?.user?.name ?? "" },
  });

  // Guard: must be signed in.
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login?redirect=/checkout");
    }
  }, [isPending, session, router]);

  const createOrder = useMutation(
    orpc.orders.create.mutationOptions({
      onSuccess: (result) => {
        clear();
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          toast.success(tt("orderPlaced"));
          router.push(`/orders/${result.order.id}`);
        }
      },
      onError: () => toast.error(tt("error")),
    }),
  );

  if (!hydrated || isPending) return null;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-lg font-medium">{t("title")}</p>
        <p className="mt-2 text-muted-foreground">—</p>
      </div>
    );
  }

  function onSubmit(address: Address) {
    createOrder.mutate({
      items: lines.map((l) => ({
        productId: l.product.id,
        quantity: l.quantity,
      })),
      address,
      paymentMethod: method,
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight">
        {t("title")}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          {/* Delivery details */}
          <Card>
            <CardHeader>
              <CardTitle>{t("contactTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label={t("name")} error={errors.contactName?.message}>
                <Input {...register("contactName")} />
              </Field>
              <Field label={t("phone")} error={errors.phone?.message}>
                <Input {...register("phone")} inputMode="tel" />
              </Field>
              <Field
                label={t("street")}
                error={errors.street?.message}
                className="sm:col-span-2"
              >
                <Input {...register("street")} />
              </Field>
              <Field label={t("city")} error={errors.city?.message}>
                <Input {...register("city")} />
              </Field>
              <Field
                label={t("notes")}
                className="sm:col-span-2"
                error={errors.notes?.message}
              >
                <Textarea
                  {...register("notes")}
                  placeholder={t("notesPlaceholder")}
                />
              </Field>
            </CardContent>
          </Card>

          {/* Payment method */}
          <Card>
            <CardHeader>
              <CardTitle>{t("paymentTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <MethodCard
                active={method === "ONLINE"}
                onClick={() => setMethod("ONLINE")}
                icon={<CreditCard className="size-5" />}
                title={t("online")}
                desc={t("onlineDesc")}
              />
              <MethodCard
                active={method === "COD"}
                onClick={() => setMethod("COD")}
                icon={<Wallet className="size-5" />}
                title={t("cod")}
                desc={t("codDesc")}
              />
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>{t("summaryTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {lines.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md">
                    <ProductImage
                      src={product.imageUrl}
                      alt={pickName(product, locale)}
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {pickName(product, locale)}
                    </p>
                    <p className="text-xs text-muted-foreground">×{quantity}</p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatPrice(product.priceCents * quantity, locale)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 border-t pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{tc("subtotal")}</span>
                <span>{formatPrice(subtotal, locale)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{tc("delivery")}</span>
                <span>{formatPrice(DELIVERY_FEE_CENTS, locale)}</span>
              </div>
              <div className="flex justify-between pt-1 text-base font-semibold">
                <span>{tc("total")}</span>
                <span>{formatPrice(total, locale)}</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={createOrder.isPending}
            >
              {createOrder.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {createOrder.isPending ? t("placing") : t("placeOrder")}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function MethodCard({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1 rounded-lg border p-4 text-start transition-colors",
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-secondary/50",
      )}
    >
      <span className="flex items-center gap-2 font-medium">
        {icon}
        {title}
      </span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
  );
}

