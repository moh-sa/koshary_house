import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden border-b">
      <div className="bg-warm-gradient pointer-events-none absolute inset-0 opacity-[0.07]" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col items-start gap-5">
          <span className="rounded-full bg-accent/30 px-3 py-1 text-xs font-semibold text-accent-foreground">
            {t("heroEyebrow")}
          </span>
          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="max-w-md text-pretty text-lg text-muted-foreground">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/menu">
                {t("heroCta")}
                <ArrowRight className="rtl-flip size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#popular">{t("heroSecondary")}</a>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="bg-warm-gradient absolute -inset-4 rounded-[2rem] opacity-20 blur-2xl" />
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border shadow-xl">
            <ProductImage
              src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80"
              alt={t("heroTitle")}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
