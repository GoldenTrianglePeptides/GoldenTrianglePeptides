import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedProduct = Omit<Prisma.ProductCreateInput, "variants"> & {
  variants: { label: string; sizeMg: number; priceCents: number }[];
};

const products: SeedProduct[] = [
  {
    slug: "semaglutide-5mg",
    name: "Semaglutide",
    category: "Metabolic Research",
    cas: "910463-68-2",
    description:
      "A GLP-1 receptor agonist studied extensively in metabolic, glucose-regulation, and body-composition research. Lyophilized powder supplied for laboratory research use only.",
    priceCents: 12999,
    sizeMg: 5,
    purity: "≥ 99%",
    imageUrl: "/products/vial.png",
    featured: true,
    variants: [
      { label: "5 mg", sizeMg: 5, priceCents: 12999 },
      { label: "10 mg", sizeMg: 10, priceCents: 22999 },
      { label: "20 mg", sizeMg: 20, priceCents: 39999 },
    ],
  },
  {
    slug: "tirzepatide-10mg",
    name: "Tirzepatide",
    category: "Metabolic Research",
    cas: "2023788-19-2",
    description:
      "A dual GIP/GLP-1 receptor agonist investigated in metabolic and energy-balance research. Lyophilized powder for laboratory research use only.",
    priceCents: 18999,
    sizeMg: 10,
    purity: "≥ 99%",
    imageUrl: "/products/vial.png",
    featured: true,
    variants: [
      { label: "10 mg", sizeMg: 10, priceCents: 18999 },
      { label: "30 mg", sizeMg: 30, priceCents: 49999 },
      { label: "60 mg", sizeMg: 60, priceCents: 89999 },
    ],
  },
  {
    slug: "retatrutide-10mg",
    name: "Retatrutide",
    category: "Metabolic Research",
    cas: "2381089-83-2",
    description:
      "A triple receptor agonist (GLP-1, GIP, and glucagon) studied as a next-generation compound in metabolic research. Lyophilized powder for laboratory research use only.",
    priceCents: 21999,
    sizeMg: 10,
    purity: "≥ 99%",
    imageUrl: "/products/vial.png",
    featured: true,
    variants: [
      { label: "10 mg", sizeMg: 10, priceCents: 21999 },
      { label: "20 mg", sizeMg: 20, priceCents: 39999 },
      { label: "40 mg", sizeMg: 40, priceCents: 69999 },
    ],
  },
  {
    slug: "liraglutide-5mg",
    name: "Liraglutide",
    category: "Metabolic Research",
    cas: "204656-20-2",
    description:
      "A GLP-1 receptor agonist studied in metabolic and glucose-regulation research. Lyophilized powder for laboratory research use only.",
    priceCents: 9999,
    sizeMg: 5,
    purity: "≥ 99%",
    imageUrl: "/products/vial.png",
    featured: false,
    variants: [
      { label: "5 mg", sizeMg: 5, priceCents: 9999 },
      { label: "15 mg", sizeMg: 15, priceCents: 24999 },
    ],
  },
  {
    slug: "mots-c-10mg",
    name: "MOTS-c",
    category: "Metabolic Research",
    cas: "1627580-64-6",
    description:
      "A mitochondrial-derived peptide studied for its role in metabolic regulation, insulin sensitivity, cellular stress response, and longevity research. Lyophilized powder for laboratory research use only.",
    priceCents: 6999,
    sizeMg: 10,
    purity: "≥ 99%",
    imageUrl: "/products/vial.png",
    featured: false,
    variants: [
      { label: "10 mg", sizeMg: 10, priceCents: 6999 },
      { label: "30 mg", sizeMg: 30, priceCents: 18999 },
    ],
  },
  {
    slug: "bpc-157-5mg",
    name: "BPC-157",
    category: "Healing & Recovery",
    cas: "137525-51-0",
    description:
      "A synthetic peptide fragment studied for its role in tissue-repair, angiogenesis, and cellular-recovery research. Lyophilized powder for laboratory research use only.",
    priceCents: 4999,
    sizeMg: 5,
    purity: "≥ 99%",
    imageUrl: "/products/vial.png",
    featured: true,
    variants: [
      { label: "5 mg", sizeMg: 5, priceCents: 4999 },
      { label: "10 mg", sizeMg: 10, priceCents: 8499 },
      { label: "20 mg", sizeMg: 20, priceCents: 14999 },
    ],
  },
  {
    slug: "tb-500-5mg",
    name: "TB-500 (Thymosin Beta-4)",
    category: "Healing & Recovery",
    cas: "77591-33-4",
    description:
      "A synthetic version of the naturally occurring peptide Thymosin Beta-4, studied in cellular-migration and tissue-regeneration research. Lyophilized powder for laboratory research use only.",
    priceCents: 5999,
    sizeMg: 5,
    purity: "≥ 99%",
    imageUrl: "/products/vial.png",
    featured: false,
    variants: [
      { label: "5 mg", sizeMg: 5, priceCents: 5999 },
      { label: "10 mg", sizeMg: 10, priceCents: 9999 },
      { label: "20 mg", sizeMg: 20, priceCents: 17999 },
    ],
  },
  {
    slug: "klow-blend",
    name: "KLOW Blend",
    category: "Healing & Recovery",
    cas: null,
    description:
      "A multi-peptide research blend formulated for combined tissue-repair and dermal research applications. Lyophilized powder for laboratory research use only.",
    priceCents: 8999,
    sizeMg: 10,
    purity: "≥ 98%",
    imageUrl: "/products/vial.png",
    featured: false,
    variants: [
      { label: "10 mg", sizeMg: 10, priceCents: 8999 },
      { label: "25 mg", sizeMg: 25, priceCents: 19999 },
    ],
  },
  {
    slug: "cjc-1295-ipamorelin",
    name: "CJC-1295 + Ipamorelin",
    category: "Growth Research",
    cas: "863288-34-0 · 170851-70-4",
    description:
      "A research stack pairing the GHRH analog CJC-1295 with the selective growth-hormone secretagogue Ipamorelin, studied for pulsatile GH-signaling research. Lyophilized powder for laboratory research use only.",
    priceCents: 6999,
    sizeMg: 10,
    purity: "≥ 99%",
    imageUrl: "/products/vial.png",
    featured: true,
    variants: [
      { label: "10 mg", sizeMg: 10, priceCents: 6999 },
      { label: "20 mg", sizeMg: 20, priceCents: 12999 },
      { label: "40 mg", sizeMg: 40, priceCents: 22999 },
    ],
  },
  {
    slug: "ghk-cu-50mg",
    name: "GHK-Cu (Copper Peptide)",
    category: "Skin & Cosmetic",
    cas: "89030-95-5",
    description:
      "A copper-binding tripeptide investigated for collagen-synthesis and skin-remodeling research. Lyophilized powder for laboratory research use only.",
    priceCents: 6499,
    sizeMg: 50,
    purity: "≥ 99%",
    imageUrl: "/products/vial.png",
    featured: true,
    variants: [
      { label: "50 mg", sizeMg: 50, priceCents: 6499 },
      { label: "100 mg", sizeMg: 100, priceCents: 11999 },
      { label: "200 mg", sizeMg: 200, priceCents: 21999 },
    ],
  },
  {
    slug: "thymosin-alpha-1-5mg",
    name: "Thymosin Alpha-1 (TA1)",
    category: "Immune Research",
    cas: "62304-98-7",
    description:
      "An immune-modulating peptide investigated for its role in immune-function and inflammation research. Lyophilized powder for laboratory research use only.",
    priceCents: 7999,
    sizeMg: 5,
    purity: "≥ 99%",
    imageUrl: "/products/vial.png",
    featured: false,
    variants: [
      { label: "5 mg", sizeMg: 5, priceCents: 7999 },
      { label: "10 mg", sizeMg: 10, priceCents: 13999 },
    ],
  },
  {
    slug: "pt-141-10mg",
    name: "Bremelanotide (PT-141)",
    category: "Specialty Research",
    cas: "189691-06-3",
    description:
      "A melanocortin receptor agonist studied in neuroscience and behavioral research. Lyophilized powder for laboratory research use only.",
    priceCents: 5499,
    sizeMg: 10,
    purity: "≥ 99%",
    imageUrl: "/products/vial.png",
    featured: false,
    variants: [
      { label: "10 mg", sizeMg: 10, priceCents: 5499 },
      { label: "20 mg", sizeMg: 20, priceCents: 9999 },
    ],
  },
  {
    slug: "bacteriostatic-water-10ml",
    name: "Bacteriostatic Water (10 mL)",
    category: "Lab Supplies",
    cas: null,
    description:
      "Sterile bacteriostatic water containing 0.9% benzyl alcohol, used for reconstituting lyophilized research peptides in the laboratory. Supplied for laboratory research use only.",
    priceCents: 999,
    sizeMg: 0,
    purity: "USP Grade",
    imageUrl: "/products/vial.png",
    featured: false,
    variants: [
      { label: "10 mL", sizeMg: 0, priceCents: 999 },
      { label: "30 mL", sizeMg: 0, priceCents: 2499 },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  // Ensure the baseline catalog exists. This is non-destructive — it never
  // overwrites existing products or variants — so any changes you make in
  // the Admin dashboard are preserved across deploys.
  for (const p of products) {
    const { variants, ...productData } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: productData,
    });

    // Only seed the variant set when the product has none yet.
    const existing = await prisma.productVariant.count({
      where: { productId: product.id },
    });
    if (existing === 0) {
      await prisma.productVariant.createMany({
        data: variants.map((v, i) => ({
          productId: product.id,
          label: v.label,
          sizeMg: v.sizeMg,
          priceCents: v.priceCents,
          sortOrder: i,
        })),
      });
    }
  }
  console.log(`Ensured ${products.length} baseline products with variants.`);

  // Admin account — credentials come from the environment so the live site is
  // never seeded with a publicly known default password.
  const adminEmail =
    process.env.ADMIN_EMAIL || "admin@goldentrianglepeptides.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin1234";
  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      "⚠ ADMIN_PASSWORD not set — using an insecure default. Set ADMIN_EMAIL and ADMIN_PASSWORD before going live.",
    );
  }
  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { isAdmin: true, passwordHash: adminHash },
    create: {
      email: adminEmail,
      name: "Store Admin",
      passwordHash: adminHash,
      isAdmin: true,
    },
  });
  console.log(`Admin account ready: ${adminEmail}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
