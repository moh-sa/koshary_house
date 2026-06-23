import { setRequestLocale } from "next-intl/server";

import { MenuBrowser } from "@/components/menu/menu-browser";

export default async function MenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);

  return <MenuBrowser initialCategory={category} />;
}
