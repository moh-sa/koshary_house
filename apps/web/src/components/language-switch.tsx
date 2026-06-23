"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const target = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? "EN" : "ع";

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(() => router.replace(pathname, { locale: target }))
      }
      aria-label="Switch language"
      className="gap-1.5 font-semibold"
    >
      <Languages className="size-4" />
      {label}
    </Button>
  );
}
