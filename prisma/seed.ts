import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
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
  },
];

async function main() {
  console.log("Seeding database...");

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log(`Seeded ${products.length} products.`);

  // Remove any products no longer in the catalog (but keep any referenced by
  // existing orders so order history stays intact).
  const keep = products.map((p) => p.slug);
  const stale = await prisma.product.findMany({
    where: { slug: { notIn: keep } },
    select: { id: true, slug: true, _count: { select: { orderItems: true } } },
  });
  for (const s of stale) {
    if (s._count.orderItems === 0) {
      await prisma.product.delete({ where: { id: s.id } });
      console.log(`Removed old product: ${s.slug}`);
    } else {
      console.log(`Kept ${s.slug} (referenced by existing orders)`);
    }
  }

  const demoEmail = "demo@goldentrianglepeptides.com";
  const passwordHash = await bcrypt.hash("demo1234", 10);
  await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Demo Customer",
      passwordHash,
    },
  });
  console.log(`Demo account ready: ${demoEmail} / demo1234`);

  const adminEmail = "admin@goldentrianglepeptides.com";
  const adminHash = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { isAdmin: true },
    create: {
      email: adminEmail,
      name: "Store Admin",
      passwordHash: adminHash,
      isAdmin: true,
    },
  });
  console.log(`Admin account ready: ${adminEmail} / admin1234`);
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
