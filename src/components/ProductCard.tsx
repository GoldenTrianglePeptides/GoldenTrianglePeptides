import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

type ProductCardProps = {
  product: {
    slug: string;
    name: string;
    category: string;
    cas?: string | null;
    priceCents: number;
    sizeMg: number;
    purity: string;
    imageUrl: string;
    inStock: boolean;
  };
};

/** Small boxed label, e.g. [CAS] [PURITY] [RUO] — echoes the reference cards. */
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm border border-navy/40 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-navy">
      {children}
    </span>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const href = `/products/${product.slug}`;

  return (
    <div className="group flex flex-col">
      {/* Spec-sheet "label" card with the vial photo overlapping the right edge */}
      <Link
        href={href}
        className="relative flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        {!product.inStock && (
          <span className="absolute right-3 top-3 z-10 rounded bg-navy px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-gold-light">
            Out of stock
          </span>
        )}

        {/* Brand lockup */}
        <div className="flex items-center gap-2">
          <Image src="/logo-mark.png" alt="" width={26} height={26} />
          <span className="text-[0.6rem] font-bold uppercase leading-none tracking-[0.15em] text-navy">
            Golden Triangle{" "}
            <span className="text-gold">Peptides</span>
          </span>
        </div>

        {/* Content sits above the vial; keep it clear of the bottom-right image */}
        <div className="relative z-10 mt-4 flex flex-1 flex-col pr-[36%]">
          {product.cas && (
            <div className="mb-2 flex items-center gap-2 text-sm">
              <Tag>CAS</Tag>
              <span className="font-semibold text-navy">{product.cas}</span>
            </div>
          )}

          <h3 className="text-2xl font-extrabold leading-tight tracking-tight text-navy">
            {product.name}
          </h3>

          <p className="mt-3 text-lg font-bold text-navy">
            {product.sizeMg > 0 ? `${product.sizeMg} mg` : "10 mL"}
          </p>
          <p className="text-xs text-zinc-500">
            {product.sizeMg > 0 ? "Lyophilized vial" : "Sterile solution"}
          </p>

          <div className="mt-auto space-y-1.5 pt-4 text-sm">
            <div className="flex items-center gap-2">
              <Tag>Purity</Tag>
              <span className="font-semibold text-navy">
                {product.purity} HPLC
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Tag>RUO</Tag>
              <span className="font-semibold text-navy">Research use only</span>
            </div>
            <p className="text-xs text-zinc-500">
              Not for human or veterinary use.
            </p>
          </div>
        </div>

        {/* Vial photo, overlapping the lower-right corner */}
        <div className="pointer-events-none absolute bottom-0 right-1 h-[80%] w-[40%]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 40vw, 15vw"
            className="object-contain object-bottom"
          />
        </div>
      </Link>

      {/* Meta + call to action, below the card (matches the reference layout) */}
      <div className="mt-3">
        <p className="text-sm font-medium text-navy">
          {product.name}
          {product.sizeMg > 0 ? ` (${product.sizeMg}mg vial)` : ""}
        </p>
        <p className="text-sm text-zinc-500">{formatPrice(product.priceCents)}</p>
      </div>
      <Link
        href={href}
        className="mt-2 block rounded-md bg-navy py-2.5 text-center text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-gold hover:text-navy-dark"
      >
        Select Options
      </Link>
    </div>
  );
}
