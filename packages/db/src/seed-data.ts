/**
 * Seed data for the "Koshary House" demo — a modern Egyptian / Middle-Eastern
 * eatery. Prices are in EGP piastres (integer). Images use Unsplash; the UI has
 * a graceful fallback if any URL fails to load.
 */

export interface SeedCategory {
  slug: string;
  nameEn: string;
  nameAr: string;
  sortOrder: number;
}

export interface SeedProduct {
  slug: string;
  categorySlug: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  priceCents: number;
  imageUrl: string;
}

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const categoriesData: SeedCategory[] = [
  { slug: "starters", nameEn: "Starters", nameAr: "المقبلات", sortOrder: 1 },
  { slug: "koshari-rice", nameEn: "Koshari & Rice", nameAr: "كشري وأرز", sortOrder: 2 },
  { slug: "grills", nameEn: "Grills", nameAr: "المشويات", sortOrder: 3 },
  { slug: "sandwiches", nameEn: "Sandwiches", nameAr: "ساندويتشات", sortOrder: 4 },
  { slug: "sides", nameEn: "Sides", nameAr: "أطباق جانبية", sortOrder: 5 },
  { slug: "desserts", nameEn: "Desserts", nameAr: "الحلويات", sortOrder: 6 },
  { slug: "drinks", nameEn: "Drinks", nameAr: "المشروبات", sortOrder: 7 },
];

export const productsData: SeedProduct[] = [
  // ── Starters ──
  {
    slug: "hummus",
    categorySlug: "starters",
    nameEn: "Hummus",
    nameAr: "حمص",
    descEn: "Creamy chickpea dip with tahini, olive oil and warm pita.",
    descAr: "حمص كريمي بالطحينة وزيت الزيتون مع الخبز الدافئ.",
    priceCents: 4500,
    imageUrl: img("photo-1637949385162-e416bf4e84a5"),
  },
  {
    slug: "falafel",
    categorySlug: "starters",
    nameEn: "Falafel (Ta'meya)",
    nameAr: "طعمية",
    descEn: "Egyptian-style fava bean fritters, crisp outside and fluffy in.",
    descAr: "طعمية مصرية مقرمشة من الخارج وطرية من الداخل.",
    priceCents: 3500,
    imageUrl: img("photo-1593001874117-c99c800e3eb8"),
  },
  {
    slug: "baba-ganoush",
    categorySlug: "starters",
    nameEn: "Baba Ganoush",
    nameAr: "بابا غنوج",
    descEn: "Smoky roasted eggplant blended with tahini and lemon.",
    descAr: "باذنجان مشوي بالطحينة والليمون بنكهة مدخنة.",
    priceCents: 4800,
    imageUrl: img("photo-1632789395770-20e6f63be806"),
  },
  {
    slug: "vine-leaves",
    categorySlug: "starters",
    nameEn: "Stuffed Vine Leaves",
    nameAr: "ورق عنب",
    descEn: "Hand-rolled vine leaves stuffed with herbed rice.",
    descAr: "ورق عنب محشي بالأرز والأعشاب الطازجة.",
    priceCents: 5500,
    imageUrl: img("photo-1606728035253-49e8a23146de"),
  },

  // ── Koshari & Rice ──
  {
    slug: "classic-koshari",
    categorySlug: "koshari-rice",
    nameEn: "Classic Koshari",
    nameAr: "كشري كلاسيكي",
    descEn: "Egypt's national dish: rice, lentils, pasta, chickpeas, crispy onions and zesty tomato sauce.",
    descAr: "طبق مصر الوطني: أرز وعدس ومكرونة وحمص وبصل مقرمش وصلصة طماطم.",
    priceCents: 5500,
    imageUrl: img("photo-1604908176997-125f25cc6f3d"),
  },
  {
    slug: "koshari-special",
    categorySlug: "koshari-rice",
    nameEn: "Koshari Special",
    nameAr: "كشري سبيشيال",
    descEn: "Loaded koshari with extra crispy onions, garlic vinegar and spicy dakka.",
    descAr: "كشري بإضافات وفيرة من البصل المقرمش والدقة الحارة وخل الثوم.",
    priceCents: 7500,
    imageUrl: img("photo-1567188040759-fb8a883dc6d8"),
  },
  {
    slug: "rice-with-nuts",
    categorySlug: "koshari-rice",
    nameEn: "Rice with Nuts",
    nameAr: "أرز بالمكسرات",
    descEn: "Fragrant rice topped with toasted almonds and raisins.",
    descAr: "أرز معطر باللوز المحمص والزبيب.",
    priceCents: 4000,
    imageUrl: img("photo-1516684732162-798a0062be99"),
  },

  // ── Grills ──
  {
    slug: "mixed-grill",
    categorySlug: "grills",
    nameEn: "Mixed Grill Platter",
    nameAr: "مشاوي مشكلة",
    descEn: "Kofta, shish tawook and lamb chops with grilled veg and rice.",
    descAr: "كفتة وشيش طاووق وريش ضاني مع خضار مشوي وأرز.",
    priceCents: 18500,
    imageUrl: img("photo-1555939594-58d7cb561ad1"),
  },
  {
    slug: "shish-tawook",
    categorySlug: "grills",
    nameEn: "Shish Tawook",
    nameAr: "شيش طاووق",
    descEn: "Marinated chicken skewers grilled over charcoal.",
    descAr: "أسياخ دجاج متبلة مشوية على الفحم.",
    priceCents: 12000,
    imageUrl: img("photo-1599487488170-d11ec9c172f0"),
  },
  {
    slug: "kofta",
    categorySlug: "grills",
    nameEn: "Beef Kofta",
    nameAr: "كفتة لحم",
    descEn: "Spiced minced beef skewers with parsley and onion.",
    descAr: "أسياخ كفتة لحم متبلة بالبقدونس والبصل.",
    priceCents: 13500,
    imageUrl: img("photo-1529193591184-b1d58069ecdd"),
  },
  {
    slug: "grilled-chicken",
    categorySlug: "grills",
    nameEn: "Half Grilled Chicken",
    nameAr: "نصف فرخة مشوية",
    descEn: "Charcoal-grilled chicken with garlic sauce and bread.",
    descAr: "دجاج مشوي على الفحم مع صلصة الثوم والخبز.",
    priceCents: 11000,
    imageUrl: img("photo-1598103442097-8b74394b95c6"),
  },

  // ── Sandwiches ──
  {
    slug: "shawarma-chicken",
    categorySlug: "sandwiches",
    nameEn: "Chicken Shawarma",
    nameAr: "شاورما دجاج",
    descEn: "Tender chicken shawarma with garlic toum and pickles.",
    descAr: "شاورما دجاج طرية مع ثوم ومخللات.",
    priceCents: 6500,
    imageUrl: img("photo-1561651823-34feb02250e4"),
  },
  {
    slug: "shawarma-beef",
    categorySlug: "sandwiches",
    nameEn: "Beef Shawarma",
    nameAr: "شاورما لحم",
    descEn: "Slow-roasted beef shawarma with tahini and tomato.",
    descAr: "شاورما لحم بالطحينة والطماطم.",
    priceCents: 7500,
    imageUrl: img("photo-1633321702518-7feccafb94d5"),
  },
  {
    slug: "falafel-wrap",
    categorySlug: "sandwiches",
    nameEn: "Falafel Wrap",
    nameAr: "ساندويتش طعمية",
    descEn: "Falafel, salad and tahini wrapped in baladi bread.",
    descAr: "طعمية وسلطة وطحينة في خبز بلدي.",
    priceCents: 4000,
    imageUrl: img("photo-1615870216519-2f9fa575fa5c"),
  },

  // ── Sides ──
  {
    slug: "french-fries",
    categorySlug: "sides",
    nameEn: "French Fries",
    nameAr: "بطاطس مقلية",
    descEn: "Golden, crispy fries with a pinch of sea salt.",
    descAr: "بطاطس ذهبية مقرمشة مع رشة ملح.",
    priceCents: 3000,
    imageUrl: img("photo-1573080496219-bb080dd4f877"),
  },
  {
    slug: "baladi-salad",
    categorySlug: "sides",
    nameEn: "Baladi Salad",
    nameAr: "سلطة بلدي",
    descEn: "Fresh tomato, cucumber and onion with lemon dressing.",
    descAr: "طماطم وخيار وبصل طازج بصلصة الليمون.",
    priceCents: 3500,
    imageUrl: img("photo-1540420773420-3366772f4999"),
  },
  {
    slug: "tahini-bread",
    categorySlug: "sides",
    nameEn: "Tahini & Bread",
    nameAr: "طحينة وخبز",
    descEn: "Smooth tahini dip served with fresh baladi bread.",
    descAr: "طحينة ناعمة مع خبز بلدي طازج.",
    priceCents: 2500,
    imageUrl: img("photo-1593001874117-c99c800e3eb8"),
  },

  // ── Desserts ──
  {
    slug: "kunafa",
    categorySlug: "desserts",
    nameEn: "Kunafa",
    nameAr: "كنافة",
    descEn: "Crispy shredded pastry with sweet cream and syrup.",
    descAr: "كنافة مقرمشة بالقشطة والقطر.",
    priceCents: 6000,
    imageUrl: img("photo-1519676867240-f03562e64548"),
  },
  {
    slug: "basbousa",
    categorySlug: "desserts",
    nameEn: "Basbousa",
    nameAr: "بسبوسة",
    descEn: "Semolina cake soaked in syrup, topped with almonds.",
    descAr: "كيكة سميد مشبعة بالقطر ومزينة باللوز.",
    priceCents: 4000,
    imageUrl: img("photo-1505253716362-afaea1d3d1af"),
  },
  {
    slug: "umm-ali",
    categorySlug: "desserts",
    nameEn: "Umm Ali",
    nameAr: "أم علي",
    descEn: "Warm Egyptian bread pudding with nuts and milk.",
    descAr: "أم علي دافئة بالمكسرات والحليب.",
    priceCents: 5000,
    imageUrl: img("photo-1488477181946-6428a0291777"),
  },

  // ── Drinks ──
  {
    slug: "fresh-mango",
    categorySlug: "drinks",
    nameEn: "Fresh Mango Juice",
    nameAr: "عصير مانجو طازج",
    descEn: "Thick, freshly blended Egyptian mango.",
    descAr: "عصير مانجو مصري طازج وكثيف.",
    priceCents: 4500,
    imageUrl: img("photo-1546173159-315724a31696"),
  },
  {
    slug: "hibiscus",
    categorySlug: "drinks",
    nameEn: "Karkadeh (Hibiscus)",
    nameAr: "كركديه",
    descEn: "Chilled hibiscus tea, tart and refreshing.",
    descAr: "شاي الكركديه المثلج المنعش.",
    priceCents: 3000,
    imageUrl: img("photo-1499638673689-79a0b5115d87"),
  },
  {
    slug: "mint-lemonade",
    categorySlug: "drinks",
    nameEn: "Mint Lemonade",
    nameAr: "ليمون بالنعناع",
    descEn: "Zesty lemonade blended with fresh mint.",
    descAr: "عصير ليمون منعش بالنعناع الطازج.",
    priceCents: 3500,
    imageUrl: img("photo-1556679343-c7306c1976bc"),
  },
];
