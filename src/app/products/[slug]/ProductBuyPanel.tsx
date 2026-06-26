"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { vialImageFor } from "@/lib/productVial";

type Variant = {
  id: string;
  label: string;
  sizeMg: number;
  priceCents: number;
  inStock: boolean;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  cas: string | null;
  purity: string;
  sizeMg: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
};

/**
 * Product hero + buy controls in one client component so the label card on the
 * left reacts to the size chosen on the right: picking a different quantity
 * updates the card's size, the price, and what gets added to the cart.
 */
export default function ProductBuyPanel({
  product,
  variants,
  priceLabel,
}: {
  product: Product;
  variants: Variant[];
  priceLabel: string;
}) {
  const { addItem } = useCart();
  const router = useRouter();

  const defaultIdx = Math.max(
    0,
    variants.findIndex((v) => v.inStock),
  );
  const [selectedIdx, setSelectedIdx] = useState(defaultIdx);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants[selectedIdx] ?? variants[0];
  const vialSrc = vialImageFor(product.name, product.imageUrl);
  const selectedSize =
    selected.sizeMg > 0 ? `${selected.sizeMg} mg` : selected.label;

  function lineItem() {
    return {
      variantId: selected.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantLabel: selected.label,
      priceCents: selected.priceCents,
      imageUrl: product.imageUrl,
    };
  }

  function handleAdd() {
    if (!selected.inStock) return;
    addItem(lineItem(), qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (!selected.inStock) return;
    addItem(lineItem(), qty);
    router.push("/cart");
  }

  const badge =
    "mr-2 rounded-sm border border-navy/50 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide";

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Label card — its size text/vial reflect the selected quantity */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        {!selected.inStock && (
          <span className="absolute right-4 top-4 z-10 rounded bg-navy px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-gold-light">
            Out of stock
          </span>
        )}

        <div className="pointer-events-none absolute bottom-0 right-0 z-0 h-3/5 w-3/5">
          <Image
            src={vialSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 60vw, 30vw"
            className="object-contain object-right-bottom"
          />
        </div>

        <div className="relative z-10 flex h-full flex-col gap-5 p-7">
          <div className="flex items-center gap-2">
            <Image src="/logo-mark.png" alt="" width={32} height={32} />
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-navy">
              Golden Triangle <span className="text-gold">Peptides</span>
            </span>
          </div>

          {product.cas && (
            <p className="text-base font-semibold text-navy">
              <span className={badge}>CAS</span>
              {product.cas}
            </p>
          )}

          <h2 className="font-serif text-3xl font-extrabold leading-tight text-navy">
            {product.name}
          </h2>

          {/* Reacts to the size picker */}
          <p className="text-2xl font-extrabold text-navy">{selectedSize}</p>

          <div className="mt-auto space-y-2 text-xs font-semibold text-navy/90">
            <p>
              <span className={badge}>Purity</span>
              {product.purity} HPLC
            </p>
            <p>
              <span className={badge}>RUO</span>
              Research use only.
              <br />
              Not for human or veterinary use.
            </p>
          </div>
        </div>
      </div>

      {/* Details + buy controls */}
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
        <p className="mt-4 text-sm text-zinc-500">{priceLabel}</p>

        {variants.length > 1 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-navy">
              Quantity (mg)
            </p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedIdx(i)}
                  disabled={!v.inStock}
                  className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                    i === selectedIdx
                      ? "border-navy bg-navy text-white"
                      : "border-black/15 bg-white text-navy hover:border-navy"
                  } ${!v.inStock ? "cursor-not-allowed opacity-50 line-through" : ""}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 text-3xl font-bold text-navy">
          {formatPrice(selected.priceCents)}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <span className="text-sm font-medium text-navy">Quantity</span>
          <div className="flex items-center rounded-lg border border-black/15">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-lg text-navy hover:bg-zinc-100"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center font-medium">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              className="px-3 py-2 text-lg text-navy hover:bg-zinc-100"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-6">
          {!selected.inStock ? (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-zinc-300 px-6 py-3 font-semibold text-zinc-600"
            >
              {selected.label} — Out of Stock
            </button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 rounded-lg bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy-dark"
              >
                {added ? "✓ Added to cart" : "Add to Cart"}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 rounded-lg bg-gold px-6 py-3 font-semibold text-navy-dark transition hover:bg-gold-light"
              >
                Buy Now
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-gold/40 bg-gold/5 p-4 text-xs text-navy/80">
          <strong className="text-navy">Research Use Only.</strong> This product
          is intended strictly for laboratory research and is not for human or
          animal consumption.
        </div>
      </div>
    </div>
  );
}
