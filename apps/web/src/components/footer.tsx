import { useTranslations } from "next-intl";

import { Logo } from "@/components/logo";

export function Footer() {
  const t = useTranslations("common");
  return (
    <footer className="mt-16 border-t bg-card/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center">
        <Logo />
        <p className="max-w-md text-sm text-muted-foreground">{t("tagline")}</p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("appName")}
        </p>
      </div>
    </footer>
  );
}
