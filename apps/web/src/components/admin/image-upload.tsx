"use client";

import { Loader2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ProductImage } from "@/components/product-image";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Unsigned client-side Cloudinary upload. If Cloudinary isn't configured, the
 * uploader hides and the admin can still paste an image URL (rendered alongside).
 */
export function ImageUpload({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const t = useTranslations("admin");
  const tt = useTranslations("toast");
  const [uploading, setUploading] = useState(false);
  const configured = Boolean(CLOUD && PRESET);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", PRESET!);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
        { method: "POST", body: fd },
      );
      const data = await res.json();
      if (data.secure_url) onChange(data.secure_url as string);
      else throw new Error("no url");
    } catch {
      toast.error(tt("error"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative h-40 w-full overflow-hidden rounded-lg border">
          <ProductImage src={value} alt="preview" sizes="500px" />
        </div>
      )}
      {configured && (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground transition-colors hover:bg-secondary/40">
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploading ? t("uploading") : t("uploadImage")}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      )}
    </div>
  );
}
