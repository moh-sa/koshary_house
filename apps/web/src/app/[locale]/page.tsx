import { setRequestLocale } from "next-intl/server";

import { CategoryStrip } from "@/components/home/category-strip";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { PopularDishes } from "@/components/home/popular-dishes";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <CategoryStrip />
      <PopularDishes />
      <HowItWorks />
    </>
  );
}
