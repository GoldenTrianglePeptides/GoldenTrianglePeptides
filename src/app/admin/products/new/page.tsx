import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add Product | Golden Triangle Peptides",
};

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/products/new");
  if (!user.isAdmin) redirect("/account");

  const { error } = await searchParams;

  const categoryRows = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-2 text-sm text-zinc-500">
        <Link href="/admin/products" className="hover:text-navy">
          Products
        </Link>{" "}
        / Add
      </div>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-navy">
        Add Product
      </h1>

      {error && (
        <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <ProductForm categories={categoryRows.map((c) => c.category)} />
    </div>
  );
}
