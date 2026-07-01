import Link from "next/link";

export const metadata = {
  title: "Independent Certifications | Golden Triangle Peptides",
  description:
    "How Golden Triangle Peptides verifies identity and purity through independent, third-party laboratory analysis.",
};

const TESTS = [
  {
    title: "Identity — Mass Spectrometry",
    body: "Molecular weight is confirmed by MS to verify the correct sequence and structure.",
  },
  {
    title: "Purity — HPLC ≥99%",
    body: "Reverse-phase HPLC quantifies chromatographic purity for every lot we release.",
  },
  {
    title: "Net Peptide Content",
    body: "Actual peptide mass per vial is measured so your concentration math is accurate.",
  },
  {
    title: "Water Content",
    body: "Residual moisture is checked to confirm a stable, properly lyophilized product.",
  },
  {
    title: "Appearance & Solubility",
    body: "Visual inspection and reconstitution checks confirm a clean, soluble powder.",
  },
  {
    title: "Endotoxin Screening",
    body: "Lots are screened to support sensitive in-vitro research applications.",
  },
];

export default function CertificationsPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-light">
            Quality &amp; Compliance
          </p>
          <h1 className="text-4xl font-extrabold uppercase tracking-tight md:text-5xl">
            Independent Certifications
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            We frequently audit our compounds using independent, third-party
            laboratories. Every lot is verified before it reaches your bench, and
            a Certificate of Analysis is available for each batch.
          </p>
        </div>
      </section>

      {/* What we test */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-navy">
            Every batch is tested for
          </h2>
          <p className="mt-2 text-zinc-500">
            Transparent standards, verified by labs independent of our suppliers.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTS.map((t) => (
            <div
              key={t.title}
              className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 h-0.5 w-10 bg-gold" />
              <h3 className="text-base font-bold text-navy">{t.title}</h3>
              <p className="mt-2 text-sm text-zinc-500">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COA contents + CTA */}
      <section className="bg-background">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2">
          <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              On every Certificate of Analysis
            </p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600">
              {[
                "Product name and CAS number",
                "Lot / batch number and test date",
                "HPLC purity result and chromatogram",
                "Mass spectrometry identity confirmation",
                "Testing laboratory and method reference",
              ].map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-gold">✓</span> {line}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-navy">
              Need the COA for a specific lot?
            </h2>
            <p className="mt-3 text-zinc-600">
              Certificates of Analysis are matched to the batch you receive.
              Reach out with the product name or CAS number and we&rsquo;ll send
              the corresponding report.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-navy px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-navy-dark"
              >
                Request a COA
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-navy/30 px-6 py-3 text-sm font-bold uppercase tracking-wide text-navy transition hover:border-navy"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
