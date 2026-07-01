"use client";

import { useState } from "react";

const field =
  "mt-1 w-full rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-navy";

// Reconstitution CONCENTRATION calculator. Neutral laboratory math only:
// peptide mass + diluent volume -> resulting concentration. It intentionally
// does NOT compute human "doses", syringe draws, or units — the store sells
// research-use-only compounds and must not provide dosing guidance.
export default function DosageCalculator() {
  const [peptideMg, setPeptideMg] = useState("10");
  const [waterMl, setWaterMl] = useState("2");

  const p = parseFloat(peptideMg);
  const w = parseFloat(waterMl);
  const valid =
    Number.isFinite(p) && p > 0 && Number.isFinite(w) && w > 0;

  const concMgMl = valid ? p / w : 0; // mg per mL
  const concMcgMl = concMgMl * 1000; // mcg per mL

  const dash = (s: string) => (valid ? s : "—");

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-5 font-serif text-xl font-bold text-navy">
          Your vial
        </h2>

        <label className="block text-sm font-medium text-navy">
          Peptide in vial (mg)
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={peptideMg}
            onChange={(e) => setPeptideMg(e.target.value)}
            className={field}
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-navy">
          Bacteriostatic water added (mL)
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={waterMl}
            onChange={(e) => setWaterMl(e.target.value)}
            className={field}
          />
        </label>

        <p className="mt-4 text-xs text-zinc-400">
          Adding more water lowers the concentration; adding less raises it.
        </p>
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-5 font-serif text-xl font-bold text-navy">
          Resulting concentration
        </h2>

        <div className="rounded-xl bg-navy p-5 text-center text-white">
          <p className="text-sm uppercase tracking-wide text-gold-light">
            Concentration
          </p>
          <p className="mt-1 text-4xl font-extrabold">
            {dash(`${concMgMl.toFixed(2)}`)}
            <span className="ml-1 text-lg font-semibold text-gold-light">
              mg/mL
            </span>
          </p>
          <p className="mt-1 text-sm text-white/70">
            {dash(`${Math.round(concMcgMl).toLocaleString()} mcg/mL`)}
          </p>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <Stat label="Peptide in vial" value={dash(`${p.toLocaleString()} mg`)} />
          <Stat label="Water added" value={dash(`${w.toLocaleString()} mL`)} />
          <Stat label="Concentration" value={dash(`${concMgMl.toFixed(2)} mg/mL`)} />
          <Stat
            label="Concentration"
            value={dash(`${Math.round(concMcgMl).toLocaleString()} mcg/mL`)}
            sub
          />
        </dl>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-black/5 p-3 ${sub ? "bg-zinc-50" : "bg-white shadow-sm"}`}
    >
      {label && <dt className="text-xs text-zinc-500">{label}</dt>}
      <dd className="font-semibold text-navy">{value}</dd>
    </div>
  );
}
