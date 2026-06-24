"use client";

import { useState } from "react";

export type ProductDetailTab = {
  key: string;
  label: string;
  content: React.ReactNode;
};

export default function ProductDetailTabs({ tabs }: { tabs: ProductDetailTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key ?? "");
  if (tabs.length === 0) return null;
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div>
      <div
        role="tablist"
        className="flex flex-wrap gap-1 border-b border-black/10"
      >
        {tabs.map((t) => {
          const isActive = t.key === activeTab.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.key)}
              className={`-mb-px rounded-t-md px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition ${
                isActive
                  ? "border-x border-t border-b-white border-black/10 bg-white text-navy"
                  : "text-zinc-500 hover:text-navy"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        className="rounded-b-lg rounded-tr-lg border border-t-0 border-black/10 bg-white p-6"
      >
        {activeTab.content}
      </div>
    </div>
  );
}
