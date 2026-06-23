"use client";

import type { Product } from "@food/contract";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

const FormSchema = z.object({
  slug: z.string().min(1),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  descEn: z.string().default(""),
  descAr: z.string().default(""),
  price: z.coerce.number().nonnegative(),
  imageUrl: z.string().url(),
  categoryId: z.string().uuid(),
  isAvailable: z.boolean().default(true),
});
type FormValues = z.input<typeof FormSchema>;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function ProductForm({ product }: { product?: Product }) {
  const t = useTranslations("admin");
  const tt = useTranslations("toast");
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = !!product;

  const cats = useQuery(orpc.menu.listCategories.queryOptions());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: product
      ? {
          slug: product.slug,
          nameEn: product.nameEn,
          nameAr: product.nameAr,
          descEn: product.descEn,
          descAr: product.descAr,
          price: product.priceCents / 100,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
          isAvailable: product.isAvailable,
        }
      : { isAvailable: true, categoryId: undefined },
  });

  const onDone = () => {
    qc.invalidateQueries();
    toast.success(tt("productSaved"));
    router.push("/admin/products");
  };

  const createM = useMutation(
    orpc.admin.products.create.mutationOptions({
      onSuccess: onDone,
      onError: () => toast.error(tt("error")),
    }),
  );
  const updateM = useMutation(
    orpc.admin.products.update.mutationOptions({
      onSuccess: onDone,
      onError: () => toast.error(tt("error")),
    }),
  );

  const submitting = createM.isPending || updateM.isPending;
  const categoryId = watch("categoryId");
  const isAvailable = watch("isAvailable");

  function onSubmit(values: FormValues) {
    const parsed = FormSchema.parse(values);
    const payload = {
      slug: parsed.slug || slugify(parsed.nameEn),
      nameEn: parsed.nameEn,
      nameAr: parsed.nameAr,
      descEn: parsed.descEn,
      descAr: parsed.descAr,
      priceCents: Math.round(parsed.price * 100),
      imageUrl: parsed.imageUrl,
      categoryId: parsed.categoryId,
      isAvailable: parsed.isAvailable,
    };
    if (isEdit) updateM.mutate({ id: product!.id, ...payload });
    else createM.mutate(payload);
  }

  return (
    <div className='max-w-2xl'>
      <h1 className='mb-6 text-2xl font-extrabold tracking-tight'>
        {isEdit ? t("editProduct") : t("createProduct")}
      </h1>
      <Card>
        <CardContent className='p-6'>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='grid gap-4 sm:grid-cols-2'
          >
            <FieldRow label={t("productNameEn")} error={errors.nameEn}>
              <Input
                {...register("nameEn")}
                onBlur={(e) => {
                  if (!watch("slug")) setValue("slug", slugify(e.target.value));
                }}
              />
            </FieldRow>
            <FieldRow label={t("productNameAr")} error={errors.nameAr}>
              <Input {...register("nameAr")} dir='rtl' />
            </FieldRow>
            <FieldRow label={t("descEn")} error={errors.descEn} full>
              <Textarea {...register("descEn")} />
            </FieldRow>
            <FieldRow label={t("descAr")} error={errors.descAr} full>
              <Textarea {...register("descAr")} dir='rtl' />
            </FieldRow>
            <FieldRow label={t("price")} error={errors.price}>
              <Input type='number' step='0.01' {...register("price")} />
            </FieldRow>
            <FieldRow label={t("slug")} error={errors.slug}>
              <Input {...register("slug")} />
            </FieldRow>
            <FieldRow label={t("image")} error={errors.imageUrl} full>
              <ImageUpload
                value={watch("imageUrl")}
                onChange={(url) =>
                  setValue("imageUrl", url, { shouldValidate: true })
                }
              />
              <Input {...register("imageUrl")} placeholder='https://…' />
            </FieldRow>
            <FieldRow label={t("category")} error={errors.categoryId}>
              <Select
                value={categoryId}
                onValueChange={(v) =>
                  setValue("categoryId", v, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("category")} />
                </SelectTrigger>
                <SelectContent>
                  {cats.data?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
            <div className='flex items-end'>
              <label className='flex cursor-pointer items-center gap-2 text-sm font-medium'>
                <input
                  type='checkbox'
                  className='size-4 accent-primary'
                  checked={!!isAvailable}
                  onChange={(e) => setValue("isAvailable", e.target.checked)}
                />
                {t("available")}
              </label>
            </div>

            <div className='sm:col-span-2'>
              <Button type='submit' disabled={submitting} className='w-full'>
                {submitting && <Loader2 className='size-4 animate-spin' />}
                {submitting ? t("saving") : t("createProduct")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function FieldRow({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: { message?: string };
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", full && "sm:col-span-2")}>
      <Label>{label}</Label>
      {children}
      {error && <p className='text-xs text-destructive'>{label}</p>}
    </div>
  );
}
