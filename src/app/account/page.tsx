import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account | Golden Triangle Peptides",
};

const statusStyles: Record<string, string> = {
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-amber-100 text-amber-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 rounded-xl border border-black/10 bg-white p-6">
        <h1 className="font-serif text-3xl font-bold text-navy">
          Welcome, {user.name}
        </h1>
        <p className="mt-1 text-zinc-500">{user.email}</p>
      </div>

      <h2 className="mb-4 font-serif text-2xl font-bold text-navy">
        Order History
      </h2>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-black/10 bg-white p-8 text-center">
          <p className="text-zinc-500">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-navy px-6 py-3 font-semibold text-white hover:bg-navy-dark"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order/${order.id}`}
              className="block rounded-xl border border-black/10 bg-white p-5 transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-sm text-zinc-500">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      statusStyles[order.status] ?? "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="font-bold text-navy">
                    {formatPrice(order.totalCents)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-zinc-600">
                {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
