"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A–Z" },
];

export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("sort") ?? "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const sp = new URLSearchParams(Array.from(params.entries()));
    if (e.target.value) sp.set("sort", e.target.value);
    else sp.delete("sort");
    router.push(sp.toString() ? `${pathname}?${sp.toString()}` : pathname);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-navy">
      <span className="text-zinc-500">Sort By</span>
      <select
        value={current}
        onChange={handleChange}
        className="rounded-md border border-black/15 bg-white px-3 py-1.5 text-sm font-medium text-navy outline-none focus:border-gold"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
