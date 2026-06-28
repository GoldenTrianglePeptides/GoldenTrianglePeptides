import DosageCalculator from "@/components/DosageCalculator";

export const metadata = {
  title: "Peptide Reconstitution & Dosage Calculator | Golden Triangle Peptides",
  description:
    "Free peptide reconstitution calculator — enter your vial's mg, the bacteriostatic water added, and your target dose to get the exact draw in insulin units (U-100) and mL, plus doses per vial. For research use only.",
};

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold">
        Research Tools
      </p>
      <h1 className="mt-1 font-serif text-4xl font-bold text-navy">
        Reconstitution &amp; Dosage Calculator
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-600">
        Enter how much peptide is in your vial, how much bacteriostatic water you
        added, and your target dose. The calculator shows the exact amount to
        draw on a standard U-100 insulin syringe, the concentration, and how many
        doses the vial yields.
      </p>

      <div className="mt-8">
        <DosageCalculator />
      </div>

      <div className="mt-8 rounded-xl border border-gold/40 bg-gold/5 p-5 text-sm text-navy/80">
        <strong className="text-navy">Research use only.</strong> This tool is
        provided for laboratory and educational reference. It is not medical
        advice and is not intended for human or veterinary dosing. Always verify
        calculations independently. A U-100 syringe measures 100 units per 1 mL.
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
            <strong className="text-navy">Volume per dose</strong> = dose (mcg) ÷
            concentration (mcg/mL). A 250&nbsp;mcg dose at 5,000&nbsp;mcg/mL =
            0.05&nbsp;mL.
          </li>
          <li>
            <strong className="text-navy">Insulin units</strong> = volume (mL) ×
            100. So 0.05&nbsp;mL = 5&nbsp;units on a U-100 syringe.
          </li>
          <li>
            <strong className="text-navy">Doses per vial</strong> = total mcg in
            the vial ÷ dose. 10&nbsp;mg (10,000&nbsp;mcg) ÷ 250&nbsp;mcg =
            40&nbsp;doses.
          </li>
        </ul>
      </div>
    </div>
  );
}
