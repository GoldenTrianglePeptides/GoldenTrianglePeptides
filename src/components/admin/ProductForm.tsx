import Link from "next/link";
import { saveProduct } from "@/app/admin/products/actions";

type ProductValues = {
  id: string;
  name: string;
  category: string;
  cas: string | null;
  priceCents: number;
  sizeMg: number;
  purity: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  inStock: boolean;
  storage: string | null;
  reconstitution: string | null;
  researchNotes: string | null;
  molecularFormula: string | null;
  molecularWeight: string | null;
  sequence: string | null;
};

const field =
  "w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-gold";
const labelText = "mb-1 block text-sm font-medium text-navy";

export default function ProductForm({
  product,
  categories,
}: {
  product?: ProductValues | null;
  categories: string[];
}) {
  const isEdit = !!product;

  return (
    <form
      action={saveProduct}
      className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
    >
      {isEdit && <input type="hidden" name="id" value={product!.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelText}>Product name</span>
          <input
            name="name"
            required
            defaultValue={product?.name ?? ""}
            className={field}
          />
        </label>

        <label className="block">
          <span className={labelText}>Category</span>
          <input
            name="category"
            required
            list="category-options"
            defaultValue={product?.category ?? ""}
            className={field}
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className={labelText}>CAS number (optional)</span>
          <input
            name="cas"
            defaultValue={product?.cas ?? ""}
            placeholder="e.g. 137525-51-0"
            className={field}
          />
        </label>

        <label className="block">
          <span className={labelText}>Price (USD)</span>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={product ? (product.priceCents / 100).toFixed(2) : ""}
            className={field}
          />
        </label>

        <label className="block">
          <span className={labelText}>Size (mg)</span>
          <input
            name="sizeMg"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.sizeMg ?? 0}
            className={field}
          />
          <span className="mt-1 block text-xs text-zinc-500">
            Use 0 for non-peptide items (e.g. bacteriostatic water).
          </span>
        </label>

        <label className="block">
          <span className={labelText}>Purity</span>
          <input
            name="purity"
            required
            defaultValue={product?.purity ?? "≥ 99%"}
            className={field}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelText}>Image path</span>
          <input
            name="imageUrl"
            required
            defaultValue={product?.imageUrl ?? "/products/vial.png"}
            className={field}
          />
          <span className="mt-1 block text-xs text-zinc-500">
            A file under <code>/public</code> (e.g.{" "}
            <code>/products/vial.png</code>).
          </span>
        </label>

        <label className="block sm:col-span-2">
          <span className={labelText}>Description</span>
          <textarea
            name="description"
            required
            rows={4}
            defaultValue={product?.description ?? ""}
            className={field}
          />
        </label>
      </div>

      {/* Optional product-detail fields shown in the on-page tabs. Leaving
          one blank just hides that row on the product page. */}
      <fieldset className="mt-6 border-t border-black/10 pt-5">
        <legend className="-mt-7 mb-2 inline-block bg-white px-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
          Product details (optional)
        </legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelText}>Storage</span>
            <textarea
              name="storage"
              rows={3}
              defaultValue={product?.storage ?? ""}
              placeholder="e.g. Store lyophilized at -20°C; refrigerate after reconstitution and use within 4 weeks."
              className={field}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className={labelText}>Reconstitution</span>
            <textarea
              name="reconstitution"
              rows={2}
              defaultValue={product?.reconstitution ?? ""}
              placeholder="e.g. Add 1–2 mL bacteriostatic water to the vial; swirl gently."
              className={field}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className={labelText}>Research notes</span>
            <textarea
              name="researchNotes"
              rows={4}
              defaultValue={product?.researchNotes ?? ""}
              placeholder="Optional. Background, related studies, mechanism — anything you want shown in the Research Notes tab."
              className={field}
            />
          </label>

          <label className="block">
            <span className={labelText}>Molecular formula</span>
            <input
              name="molecularFormula"
              defaultValue={product?.molecularFormula ?? ""}
              placeholder="e.g. C254H377N73O76S2"
              className={field}
            />
          </label>

          <label className="block">
            <span className={labelText}>Molecular weight</span>
            <input
              name="molecularWeight"
              defaultValue={product?.molecularWeight ?? ""}
              placeholder="e.g. 5929.7 g/mol"
              className={field}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className={labelText}>Amino-acid sequence</span>
            <textarea
              name="sequence"
              rows={2}
              defaultValue={product?.sequence ?? ""}
              placeholder="Single-letter sequence (optional)"
              className={field + " font-mono text-xs"}
            />
          </label>
        </div>
      </fieldset>

      <div className="mt-5 flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-medium text-navy">
          <input
            type="checkbox"
            name="inStock"
            defaultChecked={product?.inStock ?? true}
            className="h-4 w-4 accent-navy"
          />
          In stock
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-navy">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product?.featured ?? false}
            className="h-4 w-4 accent-navy"
          />
          Featured on homepage
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-navy px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-gold hover:text-navy-dark"
        >
          {isEdit ? "Save Changes" : "Create Product"}
        </button>
        <Link
          href="/admin/products"
          className="rounded-md border border-black/15 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-navy hover:border-navy"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
