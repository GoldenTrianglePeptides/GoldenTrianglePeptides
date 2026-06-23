"use client";

import { deleteProduct } from "@/app/admin/products/actions";

export default function DeleteButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <form
      action={deleteProduct.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) {
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
  );
}
