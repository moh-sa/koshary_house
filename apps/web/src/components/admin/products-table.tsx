"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { pickName } from "@/lib/menu-helpers";
import { orpc } from "@/lib/orpc";
import { formatPrice } from "@/lib/utils";

export function ProductsTable() {
  const t = useTranslations("admin");
  const tt = useTranslations("toast");
  const locale = useLocale();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery(
    orpc.admin.products.listAll.queryOptions(),
  );

  const del = useMutation(
    orpc.admin.products.delete.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success(tt("productDeleted"));
      },
      onError: () => toast.error(tt("error")),
    }),
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {t("products")}
        </h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            {t("newProduct")}
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-start text-xs text-muted-foreground">
              <tr>
                <th className="p-3 text-start font-medium">{t("products")}</th>
                <th className="p-3 text-start font-medium">{t("price")}</th>
                <th className="hidden p-3 text-start font-medium sm:table-cell">
                  {t("available")}
                </th>
                <th className="p-3 text-end font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-md">
                        <ProductImage
                          src={p.imageUrl}
                          alt={pickName(p, locale)}
                          sizes="40px"
                        />
                      </div>
                      <span className="font-medium">{pickName(p, locale)}</span>
                    </div>
                  </td>
                  <td className="p-3">{formatPrice(p.priceCents, locale)}</td>
                  <td className="hidden p-3 sm:table-cell">
                    {p.isAvailable ? (
                      <Badge variant="success">✓</Badge>
                    ) : (
                      <Badge variant="secondary">✕</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/products/${p.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm(t("deleteConfirm"))) del.mutate({ id: p.id });
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
