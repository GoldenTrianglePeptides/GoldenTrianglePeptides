import DosageCalculator from "@/components/DosageCalculator";

export const metadata = {
  title: "Peptide Reconstitution Calculator | Golden Triangle Peptides",
  description:
    "Free peptide reconstitution calculator — enter your vial's mg and the bacteriostatic water added to get the resulting concentration in mg/mL and mcg/mL. For laboratory research use only.",
};

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold">
        Research Tools
      </p>
      <h1 className="mt-1 font-serif text-4xl font-bold text-navy">
        Reconstitution Calculator
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-600">
        Enter how much peptide is in your vial and how much bacteriostatic water
        you added. The calculator shows the resulting concentration in mg/mL and
        mcg/mL — the standard reference for preparing a research solution.
      </p>

      <div className="mt-8">
        <DosageCalculator />
      </div>

      <div className="mt-8 rounded-xl border border-gold/40 bg-gold/5 p-5 text-sm text-navy/80">
        <strong className="text-navy">Research use only.</strong> This tool is
        provided for laboratory and educational reference to calculate solution
        concentration. It is not medical advice and is not intended for human or
        veterinary use or dosing. Always verify calculations independently.
      </div>

      <div className="mt-10 border-t border-black/10 pt-8">
        <h2 className="font-serif text-2xl font-bold text-navy">
          How the math works
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-zinc-600">
          <li>
            <strong className="text-navy">Concentration</strong> = peptide (mg) ÷
            water (mL). Example: 10&nbsp;mg in 2&nbsp;mL = 5&nbsp;mg/mL
            (5,000&nbsp;mcg/mL).
          </li>
          <li>
            <strong className="text-navy">Units</strong>: 1&nbsp;mg =
            1,000&nbsp;mcg, so a concentration in mg/mL is simply multiplied by
            1,000 to express it in mcg/mL.
          </li>
          <li>
            <strong className="text-navy">Volume vs. concentration</strong>: more
            diluent gives a lower concentration; less diluent gives a higher
            concentration for the same amount of peptide.
          </li>
        </ul>
      </div>
    </div>
  );
}
