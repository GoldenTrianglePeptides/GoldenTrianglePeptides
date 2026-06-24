import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { toggleStock, toggleFeatured } from "./actions";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Products | Golden Triangle Peptides",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/products");
  if (!user.isAdmin) redirect("/account");

  const { saved, error } = await searchParams;

  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      variants: {
        orderBy: [{ sortOrder: "asc" }, { sizeMg: "asc" }],
        select: { priceCents: true, label: true, inStock: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-2 text-sm text-zinc-500">
        <Link href="/admin" className="hover:text-navy">
          Admin
        </Link>{" "}
        / Products
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">
          Manage Products
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-navy px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-gold hover:text-navy-dark"
        >
          + Add Product
        </Link>
      </div>

      {saved && (
        <div className="mb-5 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
          {saved}
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <p className="mb-4 text-sm text-zinc-500">
        Click <strong>Stock</strong> or <strong>Featured</strong> to toggle them
        instantly. Click <strong>Edit</strong> to manage the available sizes and
        their prices.
      </p>

      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Sizes &amp; price</th>
              <th className="p-3 text-center">Stock</th>
              <th className="p-3 text-center">Featured</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {products.map((p) => {
              const prices = p.variants.map((v) => v.priceCents);
              const min = prices.length ? Math.min(...prices) : p.priceCents;
              const max = prices.length ? Math.max(...prices) : p.priceCents;
              const priceLabel =
                min === max
                  ? formatPrice(min)
                  : `${formatPrice(min)} – ${formatPrice(max)}`;
              return (
                <tr key={p.id} className="align-middle hover:bg-zinc-50">
                  <td className="p-3">
                    <Link
                      href={`/products/${p.slug}`}
                      className="font-semibold text-navy hover:text-gold"
                    >
                      {p.name}
                    </Link>
                    {p.cas && (
                      <div className="text-xs text-zinc-500">CAS {p.cas}</div>
                    )}
                  </td>
                  <td className="p-3 text-zinc-600">{p.category}</td>
                  <td className="p-3">
                    <p className="font-semibold text-navy">{priceLabel}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {p.variants.length > 0
                        ? p.variants.map((v) => v.label).join(" · ")
                        : "No sizes yet — click Edit"}
                    </p>
                  </td>
                  <td className="p-3 text-center">
                    <form action={toggleStock.bind(null, p.id)}>
                      <button
                        type="submit"
                        title="Click to toggle stock"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          p.inStock
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {p.inStock ? "In stock" : "Out of stock"}
                      </button>
                    </form>
                  </td>
                  <td className="p-3 text-center">
                    <form action={toggleFeatured.bind(null, p.id)}>
                      <button
                        type="submit"
                        title="Click to toggle featured"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          p.featured
                            ? "bg-gold/20 text-navy hover:bg-gold/30"
                            : "border border-black/15 text-zinc-500 hover:border-navy"
                        }`}
                      >
                        {p.featured ? "★ Featured" : "Not featured"}
                      </button>
                    </form>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-xs font-semibold text-navy hover:text-gold"
                      >
                        Edit
                      </Link>
                      <DeleteButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <p className="mt-6 text-zinc-500">
          No products yet.{" "}
          <Link href="/admin/products/new" className="font-semibold text-gold">
            Add your first product
          </Link>
          .
        </p>
      )}
    </div>
  );
}
