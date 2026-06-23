"use client";

import { LayoutDashboard, Loader2, Package, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { useRequireAdmin } from "@/lib/use-require-auth";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const { ready } = useRequireAdmin("/admin");

  const nav = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: t("products"), icon: Package },
    { href: "/admin/orders", label: t("orders"), icon: ShoppingBag },
  ];

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:grid md:grid-cols-[210px_1fr] md:gap-8">
      <aside className="mb-6 md:mb-0">
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {nav.map((n) => {
            const active = n.exact
              ? pathname === n.href
              : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
