import { ClipboardList, CreditCard, Truck } from "lucide-react";
import { useTranslations } from "next-intl";

export function HowItWorks() {
  const t = useTranslations("home");

  const steps = [
    { icon: ClipboardList, title: t("step1Title"), desc: t("step1Desc") },
    { icon: CreditCard, title: t("step2Title"), desc: t("step2Desc") },
    { icon: Truck, title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <section className="border-t bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          {t("howTitle")}
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="bg-warm-gradient grid size-14 place-items-center rounded-2xl text-white shadow-md">
                <s.icon className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
