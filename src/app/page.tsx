import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    title: "Independent Laboratory Analysis",
    body: "Every compound is verified by independent, third-party laboratories before it reaches your bench.",
  },
  {
    title: "Wholesale Pricing",
    body: "We're committed to a low, transparent cost per milligram sourced from high-quality partners.",
  },
  {
    title: "Free Shipping",
    body: "Orders over $400 ship free — always — with discreet, tracked delivery across the U.S.",
  },
  {
    title: "99%+ Pure Peptides",
    body: "All products are offered at the highest quality, with verified purity of 99% or greater.",
  },
];

export default async function Home() {
  const featured = await prisma.product.findMany({
    where: { featured: true },
    take: 3,
    orderBy: { priceCents: "asc" },
    include: {
      variants: { orderBy: [{ sortOrder: "asc" }, { sizeMg: "asc" }] },
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
              Precision Peptides. Purpose Driven.
            </p>
            <h1 className="text-4xl font-extrabold uppercase leading-[1.05] tracking-tight md:text-5xl">
              Research-Grade Peptides, Independently Verified for Purity
            </h1>
            <p className="mt-5 max-w-md text-white/80">
              Golden Triangle Peptides supplies lab-tested, high-purity research
              compounds with third-party verification — built for researchers
              who demand consistency and quality.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-lg bg-gold px-7 py-3 font-semibold uppercase tracking-wide text-navy-dark transition hover:bg-gold-light"
              >
                Shop Now
              </Link>
              <Link
                href="/certifications"
                className="rounded-lg border border-gold/50 px-7 py-3 font-semibold uppercase tracking-wide text-white transition hover:border-gold-light hover:text-gold-light"
              >
                Certifications
              </Link>
            </div>
            <div className="mt-10 flex gap-8 text-sm">
              <div>
                <p className="text-2xl font-bold text-gold-light">≥99%</p>
                <p className="text-white/70">Verified purity</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gold-light">3rd-Party</p>
                <p className="text-white/70">Lab tested</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gold-light">Fast</p>
                <p className="text-white/70">U.S. shipping</p>
              </div>
            </div>
          </div>

          {/* Brand logo */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
              <Image
                src="/goldentriangle.png"
                alt="Golden Triangle Peptides"
                width={2400}
                height={1960}
                preload
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer strip */}
      <section className="border-b border-black/5 bg-white">
        <p className="mx-auto max-w-6xl px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-navy/70">
          For research use only. Not for use in diagnostic procedures.
        </p>
      </section>

      {/* Feature row */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-center sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div className="mx-auto mb-3 h-0.5 w-10 bg-gold" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-navy">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold uppercase tracking-tight text-navy">
              Featured Products
            </h2>
            <p className="mt-2 text-zinc-500">
              Our most requested research peptides.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="inline-block rounded-lg border border-navy px-7 py-3 text-sm font-bold uppercase tracking-wide text-navy transition hover:bg-navy hover:text-white"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Research storefront CTA */}
      <section className="bg-gradient-to-b from-background to-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid items-center gap-8 rounded-3xl border border-black/5 bg-white p-8 shadow-sm md:grid-cols-2 md:p-12">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                Research Storefront
              </p>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-navy md:text-4xl">
                The trusted peptide source for verified quality, dependable
                research support, and independent analysis.
              </h2>
            </div>
            <div>
              <p className="text-zinc-600">
                Golden Triangle Peptides connects the research community with
                high-purity compounds, transparent certification standards, and
                a polished storefront built for confidence, clarity, and repeat
                ordering.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="rounded-full bg-navy px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-navy-dark"
                >
                  Browse Products
                </Link>
                <Link
                  href="/certifications"
                  className="rounded-full border border-navy/30 px-6 py-3 text-sm font-bold uppercase tracking-wide text-navy transition hover:border-navy"
                >
                  Independent Certifications
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
