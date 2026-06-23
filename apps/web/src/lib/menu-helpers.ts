export const pickName = (
  item: { nameEn: string; nameAr: string },
  locale: string,
) => (locale === "ar" ? item.nameAr : item.nameEn);

export const pickDesc = (
  item: { descEn: string; descAr: string },
  locale: string,
) => (locale === "ar" ? item.descAr : item.descEn);

/** Flat delivery fee in EGP piastres (mirrors the API). */
export const DELIVERY_FEE_CENTS = 2500;
