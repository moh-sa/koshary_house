import { CheckCircle2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function PaymentResult({
  kind,
  orderId,
}: {
  kind: "success" | "failed";
  orderId?: string;
}) {
  const t = useTranslations("payment");
  const ok = kind === "success";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      {ok ? (
        <CheckCircle2 className="size-16 text-[color:var(--success)]" />
      ) : (
        <XCircle className="size-16 text-destructive" />
      )}
      <h1 className="text-2xl font-bold">
        {t(ok ? "successTitle" : "failedTitle")}
      </h1>
      <p className="text-muted-foreground">
        {t(ok ? "successDesc" : "failedDesc")}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {orderId && (
          <Button asChild>
            <Link href={`/orders/${orderId}`}>{t("viewOrder")}</Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href="/menu">{t("backToMenu")}</Link>
        </Button>
      </div>
    </div>
  );
}
