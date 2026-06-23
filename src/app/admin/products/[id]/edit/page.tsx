import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Product | Golden Triangle Peptides",
};

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/products");
  if (!user.isAdmin) redirect("/account");

  const { id } = await params;
  const { error } = await searchParams;

  const [product, categoryRows] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-2 text-sm text-zinc-500">
        <Link href="/admin/products" className="hover:text-navy">
          Products
        </Link>{" "}
        / Edit
      </div>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-navy">
        Edit {product.name}
      </h1>

      {error && (
        <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <ProductForm
        product={product}
        categories={categoryRows.map((c) => c.category)}
      />
    </div>
  );
}
