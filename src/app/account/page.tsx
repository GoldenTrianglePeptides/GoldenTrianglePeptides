import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/format";
import CancelOrderButton from "@/components/CancelOrderButton";
import DeleteOrderButton from "@/components/DeleteOrderButton";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account | Golden Triangle Peptides",
};

const statusStyles: Record<string, string> = {
  awaiting_payment: "bg-amber-100 text-amber-800",
  partial: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-amber-100 text-amber-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
  expired: "bg-red-100 text-red-800",
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
            <div
              key={order.id}
              className="overflow-hidden rounded-xl border border-black/10 bg-white transition hover:shadow-md"
            >
              <Link href={`/order/${order.id}`} className="block p-5">
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
                      {order.status.replace(/_/g, " ")}
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
              {order.status === "awaiting_payment" && (
                <div className="flex items-center justify-between gap-3 border-t border-black/10 px-5 py-3">
                  <span className="text-xs text-zinc-500">
                    Payment not completed yet
                  </span>
                  <CancelOrderButton orderId={order.id} />
                </div>
              )}
              {["cancelled", "failed", "expired"].includes(order.status) && (
                <div className="flex items-center justify-between gap-3 border-t border-black/10 px-5 py-3">
                  <span className="text-xs text-zinc-500">
                    This order was not completed
                  </span>
                  <DeleteOrderButton orderId={order.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-4 mt-12 font-serif text-2xl font-bold text-navy">
        Account Settings
      </h2>
      <div className="rounded-xl border border-black/10 bg-white p-6">
        <h3 className="mb-4 font-semibold text-navy">Change password</h3>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
