import { Soup } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function Logo() {
  const t = useTranslations("common");
  return (
    <Link href="/" className="flex items-center gap-2 font-bold">
      <span className="bg-warm-gradient grid size-9 place-items-center rounded-xl text-white shadow-sm">
        <Soup className="size-5" />
      </span>
      <span className="text-lg tracking-tight">{t("appName")}</span>
    </Link>
  );
}
