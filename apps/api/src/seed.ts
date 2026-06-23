import "./env"; // must run first so dotenv loads before @food/db connects

import {
  categoriesData,
  category,
  db,
  order,
  orderItem,
  product,
  productsData,
  user,
} from "@food/db";
import { eq } from "drizzle-orm";

import { auth } from "./auth";

const ADMIN = {
  email: "admin@koshary.test",
  password: "Admin12345",
  name: "Koshary Admin",
};
const CUSTOMER = {
  email: "customer@koshary.test",
  password: "Customer12345",
  name: "Demo Customer",
};

async function ensureUser(
  creds: { email: string; password: string; name: string },
  role: "USER" | "ADMIN",
) {
  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, creds.email));
  if (existing.length === 0) {
    await auth.api.signUpEmail({ body: creds });
  }
  await db
    .update(user)
    .set({ role, emailVerified: true })
    .where(eq(user.email, creds.email));
}

async function main() {
  console.log("🌱 Seeding…");

  // Wipe app data (respect FK order). Users are preserved / upserted.
  await db.delete(orderItem);
  await db.delete(order);
  await db.delete(product);
  await db.delete(category);

  const slugToId = new Map<string, string>();
  for (const c of categoriesData) {
    const [row] = await db.insert(category).values(c).returning();
    slugToId.set(c.slug, row!.id);
  }
  console.log(`  • ${categoriesData.length} categories`);

  for (const p of productsData) {
    await db.insert(product).values({
      slug: p.slug,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      descEn: p.descEn,
      descAr: p.descAr,
      priceCents: p.priceCents,
      imageUrl: p.imageUrl,
      categoryId: slugToId.get(p.categorySlug)!,
    });
  }
  console.log(`  • ${productsData.length} products`);

  await ensureUser(ADMIN, "ADMIN");
  await ensureUser(CUSTOMER, "USER");
  console.log("  • admin + customer users");

  console.log("✅ Done.");
  console.log(`   Admin:    ${ADMIN.email} / ${ADMIN.password}`);
  console.log(`   Customer: ${CUSTOMER.email} / ${CUSTOMER.password}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
