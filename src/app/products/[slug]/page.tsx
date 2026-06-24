import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import ProductDetailTabs, {
  type ProductDetailTab,
} from "@/components/ProductDetailTabs";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product Not Found" };
  const title = `${product.name} | Golden Triangle Peptides`;
  return {
    title,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title,
      description: product.description,
      url: `/products/${product.slug}`,
      images: [{ url: product.imageUrl, alt: product.name }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: { orderBy: [{ sortOrder: "asc" }, { sizeMg: "asc" }] } },
  });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { category: product.category, NOT: { id: product.id } },
    include: { variants: { orderBy: [{ sortOrder: "asc" }, { sizeMg: "asc" }] } },
    take: 3,
  });

  // If a product has no variants in the database, treat the legacy
  // priceCents/sizeMg as a single implicit variant so the picker still works.
  const variants =
    product.variants.length > 0
      ? product.variants.map((v) => ({
          id: v.id,
          label: v.label,
          priceCents: v.priceCents,
          inStock: product.inStock && v.inStock,
        }))
      : [
          {
            id: product.id, // legacy fallback id
            label: product.sizeMg > 0 ? `${product.sizeMg} mg` : "Default",
            priceCents: product.priceCents,
            inStock: product.inStock,
          },
        ];

  const minPrice = Math.min(...variants.map((v) => v.priceCents));
  const maxPrice = Math.max(...variants.map((v) => v.priceCents));
  const priceLabel =
    minPrice === maxPrice
      ? formatPrice(minPrice)
      : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;

  const inStock = variants.some((v) => v.inStock);
  // Product structured data so the listing can appear as a Google rich result.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: new URL(product.imageUrl, siteUrl()).toString(),
    category: product.category,
    brand: { "@type": "Brand", name: "Golden Triangle Peptides" },
    ...(product.cas ? { productID: `CAS:${product.cas}` } : {}),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: (minPrice / 100).toFixed(2),
      highPrice: (maxPrice / 100).toFixed(2),
      offerCount: variants.length,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl()}/products/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
        {/* Product label card — each product looks distinct because of its own
            name / CAS / size / purity, printed onto a clean label with the
            vial overlaid in the lower-right corner. */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          {!product.inStock && (
            <span className="absolute right-4 top-4 z-10 rounded bg-navy px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-gold-light">
              Out of stock
            </span>
          )}

          {/* Vial overlay (bottom-right). pointer-events-none so the label's
              text remains interactive. */}
          <div className="pointer-events-none absolute bottom-0 right-0 z-0 h-3/5 w-3/5">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 60vw, 30vw"
              className="object-contain object-right-bottom"
            />
          </div>

          {/* Label content */}
          <div className="relative z-10 flex h-full flex-col gap-5 p-7">
            <div className="flex items-center gap-2">
              <Image src="/logo-mark.png" alt="" width={32} height={32} />
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-navy">
                Golden Triangle <span className="text-gold">Peptides</span>
              </span>
            </div>

            {product.cas && (
              <p className="text-base font-semibold text-navy">
                <span className="mr-2 rounded-sm border border-navy/50 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide">
                  CAS
                </span>
                {product.cas}
              </p>
            )}

            <h2 className="font-serif text-3xl font-extrabold leading-tight text-navy">
              {product.name}
            </h2>

            <p className="text-2xl font-extrabold text-navy">
              {product.sizeMg > 0 ? `${product.sizeMg} mg` : "Solution"}
              {variants.length > 1 && (
                <span className="ml-1 text-sm font-medium text-zinc-500">
                  · {variants.length} sizes
                </span>
              )}
            </p>

            <div className="mt-auto space-y-2 text-xs font-semibold text-navy/90">
              <p>
                <span className="mr-2 rounded-sm border border-navy/50 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide">
                  Purity
                </span>
                {product.purity} HPLC
              </p>
              <p>
                <span className="mr-2 rounded-sm border border-navy/50 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide">
                  RUO
                </span>
                Research use only.
                <br />
                Not for human or veterinary use.
              </p>
            </div>
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
          <p className="mt-4 text-3xl font-bold text-navy">{priceLabel}</p>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
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
              <dt className="text-zinc-500">Sizes</dt>
              <dd className="font-semibold text-navy">
                {variants.map((v) => v.label).join(" · ")}
              </dd>
            </div>
            <div className="rounded-lg border border-black/5 bg-white p-3 shadow-sm">
              <dt className="text-zinc-500">Availability</dt>
              <dd
                className={`font-semibold ${
                  variants.some((v) => v.inStock)
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {variants.some((v) => v.inStock) ? "In stock" : "Out of stock"}
              </dd>
            </div>
          </dl>

          <div className="mt-8">
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                imageUrl: product.imageUrl,
              }}
              variants={variants}
            />
          </div>

          <div className="mt-6 rounded-lg border border-gold/40 bg-gold/5 p-4 text-xs text-navy/80">
            <strong className="text-navy">Research Use Only.</strong> This
            product is intended strictly for laboratory research and is not for
            human or animal consumption.
          </div>
        </div>
      </div>

      {/* Detail tabs — sections without content are omitted automatically. */}
      <section className="mt-12">
        <ProductDetailTabs tabs={buildDetailTabs(product, variants)} />
      </section>

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

// --- Tab content builders ---------------------------------------------------

type ProductForTabs = {
  description: string;
  storage: string | null;
  reconstitution: string | null;
  researchNotes: string | null;
  molecularFormula: string | null;
  molecularWeight: string | null;
  sequence: string | null;
  cas: string | null;
  purity: string;
  sizeMg: number;
};

type VariantForTabs = { label: string; priceCents: number };

function paragraphs(text: string): React.ReactNode {
  return text.split(/\n+/).map((p, i) => (
    <p key={i} className="leading-relaxed text-zinc-700">
      {p}
    </p>
  ));
}

function buildDetailTabs(
  product: ProductForTabs,
  variants: VariantForTabs[],
): ProductDetailTab[] {
  const tabs: ProductDetailTab[] = [];

  const hasSpecs =
    !!product.cas ||
    !!product.molecularFormula ||
    !!product.molecularWeight ||
    !!product.sequence;

  // 1. Description
  tabs.push({
    key: "description",
    label: "Description",
    content: (
      <div className="space-y-4">
        {paragraphs(product.description)}
        {hasSpecs && (
          <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-black/10 pt-4 text-sm sm:grid-cols-2">
            {product.cas && (
              <SpecRow label="CAS Number" value={product.cas} />
            )}
            <SpecRow label="Purity" value={`${product.purity} HPLC`} />
            {product.molecularFormula && (
              <SpecRow label="Molecular Formula" value={product.molecularFormula} />
            )}
            {product.molecularWeight && (
              <SpecRow label="Molecular Weight" value={product.molecularWeight} />
            )}
            {product.sequence && (
              <div className="sm:col-span-2">
                <dt className="text-zinc-500">Sequence</dt>
                <dd className="mt-1 break-words font-mono text-xs text-navy">
                  {product.sequence}
                </dd>
              </div>
            )}
            {variants.length > 1 && (
              <div className="sm:col-span-2">
                <dt className="text-zinc-500">Available Sizes</dt>
                <dd className="mt-1 text-sm font-semibold text-navy">
                  {variants.map((v) => v.label).join(" · ")}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>
    ),
  });

  // 2. Storage Details — falls back to a generic note if no per-product
  // storage text yet, so the tab is always useful.
  const storageText =
    product.storage ??
    "Store lyophilized peptide at -20°C, protected from light. Once reconstituted with bacteriostatic water, refrigerate at 2–8°C and use within 4 weeks for optimal stability.";
  tabs.push({
    key: "storage",
    label: "Storage Details",
    content: (
      <div className="space-y-4">
        <p className="font-semibold text-navy">Storage</p>
        {paragraphs(storageText)}
        {product.reconstitution && (
          <>
            <p className="pt-2 font-semibold text-navy">Reconstitution</p>
            {paragraphs(product.reconstitution)}
          </>
        )}
      </div>
    ),
  });

  // 3. Research Notes — optional; only shown when filled in.
  if (product.researchNotes) {
    tabs.push({
      key: "research",
      label: "Research Notes",
      content: (
        <div className="space-y-3">{paragraphs(product.researchNotes)}</div>
      ),
    });
  }

  return tabs;
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-semibold text-navy">{value}</dd>
    </div>
  );
}
