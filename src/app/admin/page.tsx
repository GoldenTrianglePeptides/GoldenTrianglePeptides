import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/format";
import DeleteOrderButton from "./DeleteOrderButton";
import OrderStatusActions from "./OrderStatusActions";
import AdminPendingAutoSync from "./AdminPendingAutoSync";
import { PAID_STATUSES } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin | Golden Triangle Peptides",
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) redirect("/account");

  const [orders, pendingOrders, productCount, userCount] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: [...PAID_STATUSES] } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { items: true, user: true },
    }),
    // Orders that aren't paid yet — open invoices and ones that may be stuck
    // because an IPN webhook never arrived. Surfaced so an admin can pull the
    // real status from NOWPayments (or mark paid by hand).
    prisma.order.findMany({
      where: { status: { notIn: [...PAID_STATUSES] } },
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
      <AdminPendingAutoSync pendingCount={pendingOrders.length} />
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
        <Stat label="Paid Orders" value={orders.length.toString()} />
        <Stat label="Revenue (recent)" value={formatPrice(revenue)} />
        <Link href="/admin/products" className="block">
          <Stat label="Products" value={productCount.toString()} hint="Manage →" />
        </Link>
        <Stat label="Customers" value={userCount.toString()} />
      </div>

      <h2 className="mb-4 font-serif text-2xl font-bold text-navy">
        Recent Paid Orders
      </h2>
      {orders.length === 0 ? (
        <p className="text-zinc-500">No paid orders yet.</p>
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
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {orders.map((o) => {
                const orderNumber = o.id.slice(-8).toUpperCase();
                return (
                  <tr key={o.id} className="hover:bg-zinc-50">
                    <td className="p-3">
                      <Link
                        href={`/order/${o.id}`}
                        className="font-mono text-navy hover:underline"
                      >
                        #{orderNumber}
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
                    <td className="p-3 text-right">
                      <DeleteOrderButton
                        orderId={o.id}
                        orderNumber={orderNumber}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mb-2 mt-10 font-serif text-2xl font-bold text-navy">
        Pending &amp; Unpaid Orders
      </h2>
      <p className="mb-4 text-sm text-zinc-500">
        Orders awaiting payment, or that may be stuck because a payment
        notification never arrived. Use <strong>Sync status</strong> to pull the
        real status from NOWPayments; use <strong>Mark paid</strong> only after
        you&apos;ve confirmed the funds arrived.
      </p>
      {pendingOrders.length === 0 ? (
        <p className="text-zinc-500">No pending orders.</p>
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
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {pendingOrders.map((o) => {
                const orderNumber = o.id.slice(-8).toUpperCase();
                return (
                  <tr key={o.id} className="hover:bg-zinc-50">
                    <td className="p-3">
                      <Link
                        href={`/order/${o.id}`}
                        className="font-mono text-navy hover:underline"
                      >
                        #{orderNumber}
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
                    <td className="p-3 text-right">
                      <OrderStatusActions
                        orderId={o.id}
                        orderNumber={orderNumber}
                      />
                    </td>
                  </tr>
                );
              })}
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
