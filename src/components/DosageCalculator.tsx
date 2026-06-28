"use client";

import { useState } from "react";

type Unit = "mcg" | "mg";

const field =
  "mt-1 w-full rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-navy";

export default function DosageCalculator() {
  const [peptideMg, setPeptideMg] = useState("10");
  const [waterMl, setWaterMl] = useState("2");
  const [dose, setDose] = useState("250");
  const [unit, setUnit] = useState<Unit>("mcg");

  const p = parseFloat(peptideMg);
  const w = parseFloat(waterMl);
  const d = parseFloat(dose);
  const valid =
    Number.isFinite(p) && p > 0 && Number.isFinite(w) && w > 0 &&
    Number.isFinite(d) && d > 0;

  const concMgMl = valid ? p / w : 0; // mg per mL
  const concMcgMl = concMgMl * 1000; // mcg per mL
  const doseMcg = unit === "mg" ? d * 1000 : d; // requested dose in mcg
  const volMl = valid && concMcgMl > 0 ? doseMcg / concMcgMl : 0; // mL to draw
  const units = volMl * 100; // U-100 insulin syringe: 100 units = 1 mL
  const dosesPerVial =
    valid && doseMcg > 0 ? Math.floor((p * 1000) / doseMcg) : 0;
  const fill = Math.max(0, Math.min(units / 100, 1)); // fraction of a 100-unit barrel
  const overOneSyringe = units > 100;

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

        <div className="mt-4">
          <span className="text-sm font-medium text-navy">Desired dose</span>
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              className={field}
            />
            <div className="flex shrink-0 overflow-hidden rounded-lg border border-black/15">
              {(["mcg", "mg"] as Unit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-4 text-sm font-semibold transition ${
                    unit === u
                      ? "bg-navy text-white"
                      : "bg-white text-navy hover:bg-zinc-50"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-5 font-serif text-xl font-bold text-navy">
          Draw this much
        </h2>

        <div className="rounded-xl bg-navy p-5 text-center text-white">
          <p className="text-sm uppercase tracking-wide text-gold-light">
            Per dose
          </p>
          <p className="mt-1 text-4xl font-extrabold">
            {dash(`${units.toFixed(1)}`)}
            <span className="ml-1 text-lg font-semibold text-gold-light">
              units
            </span>
          </p>
          <p className="mt-1 text-sm text-white/70">
            on a U-100 insulin syringe ({dash(`${volMl.toFixed(3)} mL`)})
          </p>
        </div>

        {/* Syringe fill visual */}
        <div className="mt-5">
          <div className="relative h-7 overflow-hidden rounded-full border border-black/15 bg-zinc-100">
            <div
              className="absolute inset-y-0 left-0 bg-gold"
              style={{ width: `${valid ? fill * 100 : 0}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[0.65rem] text-zinc-400">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100 units</span>
          </div>
          {overOneSyringe && (
            <p className="mt-2 text-xs font-medium text-red-700">
              This dose is more than one full 100-unit syringe ({units.toFixed(0)}{" "}
              units). Consider adding less water for a higher concentration.
            </p>
          )}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <Stat label="Concentration" value={dash(`${concMgMl.toFixed(2)} mg/mL`)} />
          <Stat
            label=""
            value={dash(`${Math.round(concMcgMl).toLocaleString()} mcg/mL`)}
            sub
          />
          <Stat label="Doses per vial" value={dash(`${dosesPerVial}`)} />
          <Stat label="Dose" value={dash(`${doseMcg.toLocaleString()} mcg`)} />
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
