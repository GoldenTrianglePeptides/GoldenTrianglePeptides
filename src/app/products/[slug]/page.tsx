import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | Golden Triangle Peptides`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { category: product.category, NOT: { id: product.id } },
    take: 3,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-navy">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/products" className="hover:text-navy">
          Shop
        </Link>{" "}
        / <span className="text-navy">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Image panel */}
        <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white p-6">
          <div className="flex items-center gap-2">
            <Image src="/logo-mark.png" alt="" width={28} height={28} />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-navy">
              Golden Triangle <span className="text-gold">Peptides</span>
            </span>
          </div>
          {!product.inStock && (
            <span className="absolute right-4 top-4 rounded bg-navy px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-gold-light">
              Out of stock
            </span>
          )}
          <div className="relative mx-auto my-4 aspect-square max-w-sm">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              preload
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs font-bold uppercase tracking-wide text-navy">
            <span className="rounded-sm border border-navy/40 px-2 py-1">
              Purity {product.purity}
            </span>
            <span className="rounded-sm border border-navy/40 px-2 py-1">
              HPLC Verified
            </span>
            <span className="rounded-sm border border-navy/40 px-2 py-1">
              Research Use Only
            </span>
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            {product.category}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy">
            {product.name}
          </h1>
          {product.cas && (
            <p className="mt-2 text-sm text-zinc-500">
              <span className="rounded-sm border border-navy/30 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase text-navy">
                CAS
              </span>{" "}
              <span className="font-semibold text-navy">{product.cas}</span>
            </p>
          )}
          <p className="mt-4 text-3xl font-bold text-navy">
            {formatPrice(product.priceCents)}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {product.sizeMg > 0 && (
              <div className="rounded-lg border border-black/5 bg-white p-3 shadow-sm">
                <dt className="text-zinc-500">Size</dt>
                <dd className="font-semibold text-navy">{product.sizeMg} mg</dd>
              </div>
            )}
            <div className="rounded-lg border border-black/5 bg-white p-3 shadow-sm">
              <dt className="text-zinc-500">Purity</dt>
              <dd className="font-semibold text-navy">{product.purity}</dd>
            </div>
            <div className="rounded-lg border border-black/5 bg-white p-3 shadow-sm">
              <dt className="text-zinc-500">Form</dt>
              <dd className="font-semibold text-navy">
                {product.sizeMg > 0 ? "Lyophilized powder" : "Solution"}
              </dd>
            </div>
            <div className="rounded-lg border border-black/5 bg-white p-3 shadow-sm">
              <dt className="text-zinc-500">Availability</dt>
              <dd
                className={`font-semibold ${
                  product.inStock ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.inStock ? "In stock" : "Out of stock"}
              </dd>
            </div>
          </dl>

          <p className="mt-6 leading-relaxed text-zinc-700">
            {product.description}
          </p>

          <div className="mt-8">
            <AddToCartButton
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.priceCents,
                imageUrl: product.imageUrl,
                sizeMg: product.sizeMg,
              }}
              disabled={!product.inStock}
            />
          </div>

          <div className="mt-6 rounded-lg border border-gold/40 bg-gold/5 p-4 text-xs text-navy/80">
            <strong className="text-navy">Research Use Only.</strong> This
            product is intended strictly for laboratory research and is not for
            human or animal consumption.
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-extrabold uppercase tracking-tight text-navy">
            Related Products
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
