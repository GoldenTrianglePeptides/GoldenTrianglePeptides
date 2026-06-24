import { Suspense } from "react";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import SortSelect from "./SortSelect";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop Research Peptides | Golden Triangle Peptides",
};

type SP = {
  category?: string;
  search?: string;
  stock?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const category = sp.category ?? "";
  const search = sp.search ?? "";
  const stock = sp.stock ?? "";
  const sort = sp.sort ?? "";
  const minPrice = sp.minPrice ?? "";
  const maxPrice = sp.maxPrice ?? "";

  function buildHref(overrides: Partial<Record<keyof SP, string | undefined>>) {
    const merged: SP = {
      category,
      search,
      stock,
      sort,
      minPrice,
      maxPrice,
      ...overrides,
    };
    const usp = new URLSearchParams();
    (Object.entries(merged) as [string, string | undefined][]).forEach(
      ([k, v]) => {
        if (v) usp.set(k, v);
      },
    );
    const qs = usp.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  // Build the Prisma query from the active filters.
  const where: Prisma.ProductWhereInput = {};
  if (category) where.category = category;
  if (search) where.name = { contains: search };
  if (stock === "in") where.inStock = true;
  else if (stock === "out") where.inStock = false;

  const min = minPrice ? Math.round(parseFloat(minPrice) * 100) : undefined;
  const max = maxPrice ? Math.round(parseFloat(maxPrice) * 100) : undefined;
  const priceFilter: Prisma.IntFilter = {};
  if (min !== undefined && !Number.isNaN(min)) priceFilter.gte = min;
  if (max !== undefined && !Number.isNaN(max)) priceFilter.lte = max;
  if (Object.keys(priceFilter).length) where.priceCents = priceFilter;

  let orderBy:
    | Prisma.ProductOrderByWithRelationInput
    | Prisma.ProductOrderByWithRelationInput[];
  switch (sort) {
    case "price-asc":
      orderBy = { priceCents: "asc" };
      break;
    case "price-desc":
      orderBy = { priceCents: "desc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
    default:
      orderBy = [{ featured: "desc" }, { name: "asc" }];
  }

  const [products, categoryRows] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        variants: { orderBy: [{ sortOrder: "asc" }, { sizeMg: "asc" }] },
      },
    }),
    prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
  ]);
  const categories = categoryRows.map((c) => c.category);

  const sidebarHeader =
    "rounded-md bg-navy px-4 py-2 text-sm font-bold uppercase tracking-wide text-white";
  const filterLink = (active: boolean) =>
    `block py-1.5 text-sm transition ${
      active ? "font-semibold text-gold" : "text-navy/80 hover:text-gold"
    }`;

  return (
    <div>
      {/* Banner */}
      <section className="bg-gradient-to-r from-navy to-navy-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h1 className="text-4xl font-extrabold uppercase tracking-tight">
            Shop
          </h1>
          <p className="mt-2 text-sm text-white/70">
            <Link href="/" className="hover:text-gold-light">
              Home
            </Link>{" "}
            / Shop
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-6">
          <div>
            <h2 className={sidebarHeader}>Category</h2>
            <div className="mt-2 px-1">
              <Link href={buildHref({ category: undefined })} className={filterLink(!category)}>
                All Products
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={buildHref({ category: c })}
                  className={filterLink(category === c)}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className={sidebarHeader}>Availability</h2>
            <div className="mt-2 px-1">
              <Link href={buildHref({ stock: undefined })} className={filterLink(!stock)}>
                All
              </Link>
              <Link href={buildHref({ stock: "in" })} className={filterLink(stock === "in")}>
                In Stock
              </Link>
              <Link href={buildHref({ stock: "out" })} className={filterLink(stock === "out")}>
                Out of Stock
              </Link>
            </div>
          </div>

          <div>
            <h2 className={sidebarHeader}>Price (USD)</h2>
            <form action="/products" className="mt-3 px-1">
              {category && <input type="hidden" name="category" value={category} />}
              {search && <input type="hidden" name="search" value={search} />}
              {stock && <input type="hidden" name="stock" value={stock} />}
              {sort && <input type="hidden" name="sort" value={sort} />}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minPrice"
                  min="0"
                  placeholder="Min"
                  defaultValue={minPrice}
                  className="w-full rounded-md border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-gold"
                />
                <span className="text-zinc-400">–</span>
                <input
                  type="number"
                  name="maxPrice"
                  min="0"
                  placeholder="Max"
                  defaultValue={maxPrice}
                  className="w-full rounded-md border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-gold"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="submit"
                  className="rounded-md bg-navy px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-navy-dark"
                >
                  Apply
                </button>
                <Link
                  href={buildHref({ minPrice: undefined, maxPrice: undefined })}
                  className="rounded-md border border-black/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-navy hover:border-navy"
                >
                  Clear
                </Link>
              </div>
            </form>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-6 flex flex-col gap-3 rounded-lg bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              {search ? (
                <>
                  Showing {products.length} result
                  {products.length === 1 ? "" : "s"} for{" "}
                  <span className="font-semibold text-navy">
                    &ldquo;{search}&rdquo;
                  </span>
                </>
              ) : (
                <>
                  Showing {products.length} result
                  {products.length === 1 ? "" : "s"}
                </>
              )}
            </p>
            <Suspense fallback={null}>
              <SortSelect />
            </Suspense>
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-black/10 bg-white p-10 text-center">
              <p className="text-zinc-500">
                No products match your filters.{" "}
                <Link href="/products" className="font-semibold text-gold">
                  Reset
                </Link>
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
