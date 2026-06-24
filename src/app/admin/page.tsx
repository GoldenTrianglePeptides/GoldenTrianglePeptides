import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin | Golden Triangle Peptides",
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) redirect("/account");

  const [orders, productCount, userCount] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { items: true, user: true },
    }),
    prisma.product.count(),
    prisma.user.count(),
  ]);

  const revenue = orders.reduce((sum, o) => sum + o.totalCents, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">
          Admin Dashboard
        </h1>
        <Link
          href="/admin/products"
          className="rounded-md bg-navy px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-gold hover:text-navy-dark"
        >
          Manage Products
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <Stat label="Orders" value={orders.length.toString()} />
        <Stat label="Revenue (recent)" value={formatPrice(revenue)} />
        <Link href="/admin/products" className="block">
          <Stat label="Products" value={productCount.toString()} hint="Manage →" />
        </Link>
        <Stat label="Customers" value={userCount.toString()} />
      </div>

      <h2 className="mb-4 font-serif text-2xl font-bold text-navy">
        Recent Orders
      </h2>
      {orders.length === 0 ? (
        <p className="text-zinc-500">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 text-zinc-500">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50">
                  <td className="p-3">
                    <Link
                      href={`/order/${o.id}`}
                      className="font-mono text-navy hover:underline"
                    >
                      #{o.id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="p-3">{o.user.email}</td>
                  <td className="p-3">{formatDate(o.createdAt)}</td>
                  <td className="p-3 capitalize">
                    {o.status.replace(/_/g, " ")}
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {formatPrice(o.totalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-5 transition hover:border-gold">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy">{value}</p>
      {hint && (
        <p className="mt-1 text-xs font-semibold text-gold">{hint}</p>
      )}
    </div>
  );
}
