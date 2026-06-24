"use client";

import {
  addVariant,
  updateVariant,
  deleteVariant,
  toggleVariantStock,
} from "@/app/admin/products/actions";

type Variant = {
  id: string;
  label: string;
  sizeMg: number;
  priceCents: number;
  inStock: boolean;
  stockQty: number | null;
};

const cell =
  "rounded-md border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-gold";

function VariantRow({ variant }: { variant: Variant }) {
  return (
    <tr className="align-middle">
      {/* Edit form */}
      <td colSpan={3} className="px-2 py-2">
        <form
          action={updateVariant.bind(null, variant.id)}
          className="grid grid-cols-[1fr_80px_110px_80px_auto] gap-2 items-center"
        >
          <input
            name="label"
            defaultValue={variant.label}
            placeholder="Size label, e.g. 10 mg"
            required
            className={cell}
          />
          <input
            name="sizeMg"
            type="number"
            min="0"
            step="1"
            defaultValue={variant.sizeMg}
            required
            className={cell}
            title="Numeric mg (0 for liquids)"
          />
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">$</span>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={(variant.priceCents / 100).toFixed(2)}
              required
              className={cell + " w-full"}
            />
          </div>
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={variant.stockQty ?? ""}
            placeholder="∞"
            className={cell}
            title="Units in stock — leave blank for unlimited"
          />
          <button
            type="submit"
            className="rounded-md border border-black/15 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy"
          >
            Save
          </button>
        </form>
      </td>

      {/* Stock toggle */}
      <td className="px-2 py-2 text-center">
        <form action={toggleVariantStock.bind(null, variant.id)}>
          <button
            type="submit"
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              variant.inStock
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            {variant.inStock ? "In stock" : "Out of stock"}
          </button>
        </form>
      </td>

      {/* Delete */}
      <td className="px-2 py-2 text-right">
        <form
          action={deleteVariant.bind(null, variant.id)}
          onSubmit={(e) => {
            if (!confirm(`Delete the "${variant.label}" size?`)) {
              e.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Delete
          </button>
        </form>
      </td>
    </tr>
  );
}

export default function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: Variant[];
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-navy">Sizes &amp; pricing</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Each row is a size customers can pick on the product page. Add as many
        as you like — the cheapest one sets the &ldquo;from&rdquo; price on the
        product card.
      </p>

      {variants.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-lg border border-black/10">
          <table className="w-full text-left">
            <thead className="border-b border-black/10 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-2 py-2">Label</th>
                <th className="px-2 py-2 w-24">Size (mg)</th>
                <th className="px-2 py-2 w-32">Price</th>
                <th className="px-2 py-2 w-20"></th>
                <th className="px-2 py-2 w-32 text-center">Stock</th>
                <th className="px-2 py-2 w-20 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {variants.map((v) => (
                <VariantRow key={v.id} variant={v} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-black/15 p-4 text-sm text-zinc-500">
          No sizes yet. Add the first one below.
        </p>
      )}

      <form
        action={addVariant.bind(null, productId)}
        className="mt-5 grid grid-cols-[1fr_80px_110px_80px_auto] gap-2 items-center"
      >
        <input
          name="label"
          required
          placeholder="New size label, e.g. 50 mg"
          className={cell}
        />
        <input
          name="sizeMg"
          type="number"
          min="0"
          step="1"
          required
          placeholder="50"
          className={cell}
        />
        <div className="flex items-center gap-1">
          <span className="text-zinc-500">$</span>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="0.00"
            className={cell + " w-full"}
          />
        </div>
        <input
          name="stock"
          type="number"
          min="0"
          step="1"
          placeholder="∞"
          className={cell}
          title="Units in stock — leave blank for unlimited"
        />
        <button
          type="submit"
          className="rounded-md bg-navy px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-gold hover:text-navy-dark"
        >
          + Add Size
        </button>
      </form>
    </div>
  );
}
