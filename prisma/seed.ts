import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    slug: "bpc-157-5mg",
    name: "BPC-157",
    category: "Healing & Recovery",
    description:
      "BPC-157 is a synthetic peptide fragment studied for its role in tissue repair, angiogenesis, and recovery research. Lyophilized powder supplied for laboratory research use only.",
    priceCents: 4999,
    sizeMg: 5,
    purity: "≥ 99%",
    imageUrl: "/products/vial.jpg",
    featured: true,
  },
  {
    slug: "tb-500-5mg",
    name: "TB-500 (Thymosin Beta-4)",
    category: "Healing & Recovery",
    description:
      "TB-500 is a synthetic version of the naturally occurring peptide Thymosin Beta-4, widely used in cellular migration and recovery research. Lyophilized powder for laboratory use only.",
    priceCents: 5999,
    sizeMg: 5,
    purity: "≥ 99%",
    imageUrl: "/products/vial.jpg",
    featured: true,
  },
  {
    slug: "ghk-cu-50mg",
    name: "GHK-Cu (Copper Peptide)",
    category: "Skin & Cosmetic",
    description:
      "GHK-Cu is a copper-binding tripeptide investigated for collagen synthesis and skin remodeling research. Lyophilized powder supplied for laboratory research use only.",
    priceCents: 6499,
    sizeMg: 50,
    purity: "≥ 99%",
    imageUrl: "/products/vial.jpg",
    featured: true,
  },
  {
    slug: "semaglutide-5mg",
    name: "Semaglutide",
    category: "Metabolic Research",
    description:
      "Semaglutide is a GLP-1 receptor agonist peptide studied extensively in metabolic and glucose-regulation research. Lyophilized powder for laboratory research use only.",
    priceCents: 12999,
    sizeMg: 5,
    purity: "≥ 99%",
    imageUrl: "/products/vial.jpg",
    featured: true,
  },
  {
    slug: "tirzepatide-10mg",
    name: "Tirzepatide",
    category: "Metabolic Research",
    description:
      "Tirzepatide is a dual GIP/GLP-1 receptor agonist peptide used in metabolic research applications. Lyophilized powder supplied for laboratory research use only.",
    priceCents: 18999,
    sizeMg: 10,
    purity: "≥ 99%",
    imageUrl: "/products/vial.jpg",
    featured: false,
  },
  {
    slug: "ipamorelin-5mg",
    name: "Ipamorelin",
    category: "Growth Research",
    description:
      "Ipamorelin is a selective growth hormone secretagogue peptide investigated in endocrine research. Lyophilized powder for laboratory research use only.",
    priceCents: 4499,
    sizeMg: 5,
    purity: "≥ 99%",
    imageUrl: "/products/vial.jpg",
    featured: false,
  },
  {
    slug: "cjc-1295-no-dac-5mg",
    name: "CJC-1295 (No DAC)",
    category: "Growth Research",
    description:
      "CJC-1295 without DAC is a growth hormone releasing hormone analog studied for its pulsatile signaling research properties. Lyophilized powder for laboratory use only.",
    priceCents: 5499,
    sizeMg: 5,
    purity: "≥ 99%",
    imageUrl: "/products/vial.jpg",
    featured: false,
  },
  {
    slug: "melanotan-ii-10mg",
    name: "Melanotan II",
    category: "Pigmentation Research",
    description:
      "Melanotan II is a synthetic analog of the peptide hormone alpha-MSH, studied in pigmentation research. Lyophilized powder supplied for laboratory research use only.",
    priceCents: 3999,
    sizeMg: 10,
    purity: "≥ 99%",
    imageUrl: "/products/vial.jpg",
    featured: false,
  },
  {
    slug: "bacteriostatic-water-30ml",
    name: "Bacteriostatic Water (30 mL)",
    category: "Lab Supplies",
    description:
      "Sterile bacteriostatic water containing 0.9% benzyl alcohol, used for reconstituting lyophilized research peptides in the laboratory.",
    priceCents: 1499,
    sizeMg: 0,
    purity: "USP Grade",
    imageUrl: "/products/water.svg",
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
