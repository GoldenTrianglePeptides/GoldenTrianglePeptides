import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

type ProductCardProps = {
  product: {
    slug: string;
    name: string;
    category: string;
    priceCents: number;
    sizeMg: number;
    purity: string;
    imageUrl: string;
    inStock: boolean;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain p-4 transition-transform group-hover:scale-105"
        />
        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gold">
          {product.category}
        </p>
        <h3 className="mt-1 font-serif text-lg font-semibold text-navy">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          {product.sizeMg > 0 ? `${product.sizeMg} mg · ` : ""}Purity {product.purity}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-navy">
            {formatPrice(product.priceCents)}
          </span>
          <span className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white group-hover:bg-gold group-hover:text-navy-dark">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
