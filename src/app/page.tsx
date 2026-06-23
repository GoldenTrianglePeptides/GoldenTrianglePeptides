import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featured = await prisma.product.findMany({
    where: { featured: true },
    take: 4,
    orderBy: { priceCents: "asc" },
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
              Precision Peptides. Purpose Driven.
            </p>
            <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
              Research-Grade Peptides You Can Trust
            </h1>
            <p className="mt-4 max-w-md text-white/80">
              Golden Triangle Peptides supplies lab-tested, high-purity research
              compounds with third-party verification. Built for researchers who
              demand consistency and quality.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-lg bg-gold px-6 py-3 font-semibold text-navy-dark transition hover:bg-gold-light"
              >
                Shop Products
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-gold/50 px-6 py-3 font-semibold text-white transition hover:border-gold-light"
              >
                Create Account
              </Link>
            </div>
            <div className="mt-8 flex gap-8 text-sm">
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
          <div className="flex justify-center">
            <div className="rounded-2xl bg-gradient-to-b from-white to-zinc-100 p-6 shadow-2xl">
              <Image
                src="/products/vial.svg"
                alt="Golden Triangle Peptides research vial"
                width={300}
                height={440}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 text-center text-sm sm:grid-cols-3">
          <div className="font-medium text-navy">🔬 Third-Party Lab Tested</div>
          <div className="font-medium text-navy">🧊 Lyophilized & Cold-Shipped</div>
          <div className="font-medium text-navy">📦 Discreet, Tracked Shipping</div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-navy">
              Featured Products
            </h2>
            <p className="mt-1 text-zinc-500">Our most requested research peptides.</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-gold hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-navy to-navy-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <h2 className="font-serif text-3xl font-bold">
            Create an account & start ordering
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Sign up to track orders, save your shipping details, and check out
            faster on every purchase.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-lg bg-gold px-8 py-3 font-semibold text-navy-dark transition hover:bg-gold-light"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
