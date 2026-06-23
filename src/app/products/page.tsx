import Link from "next/link";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop Research Peptides | Golden Triangle Peptides",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const categories = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });

  const products = await prisma.product.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-navy">
          {category ?? "All Products"}
        </h1>
        <p className="mt-1 text-zinc-500">
          {products.length} research compound{products.length === 1 ? "" : "s"}{" "}
          available.
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            !category
              ? "border-navy bg-navy text-white"
              : "border-black/15 text-navy hover:border-navy"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.category}
            href={`/products?category=${encodeURIComponent(c.category)}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              category === c.category
                ? "border-navy bg-navy text-white"
                : "border-black/15 text-navy hover:border-navy"
            }`}
          >
            {c.category}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-zinc-500">No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
