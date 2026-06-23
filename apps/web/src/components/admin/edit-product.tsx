"use client";

import { useQuery } from "@tanstack/react-query";

import { ProductForm } from "@/components/admin/product-form";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";

export function EditProduct({ id }: { id: string }) {
  const { data, isLoading } = useQuery(
    orpc.admin.products.listAll.queryOptions(),
  );
  const product = data?.find((p) => p.id === id);

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }
  if (!product) return <p className="text-muted-foreground">—</p>;

  return <ProductForm product={product} />;
}
