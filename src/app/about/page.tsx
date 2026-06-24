import Link from "next/link";

export const metadata = {
  title: "About | Golden Triangle Peptides",
};

export default function AboutPage() {
  return (
    <div>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
            Precision Peptides. Purpose Driven.
          </p>
          <h1 className="text-4xl font-extrabold uppercase tracking-tight">
            About Golden Triangle Peptides
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <div className="space-y-6 text-zinc-700">
          <p>
            Golden Triangle Peptides is a research-focused supplier of
            high-purity peptides for laboratory and scientific applications. We
            partner with established manufacturers and independent labs to
            deliver compounds that meet rigorous quality and purity standards.
          </p>
          <p>
            Every batch is third-party tested and verified to{" "}
            <strong>≥ 99% purity</strong>. Our peptides are lyophilized,
            carefully handled, and shipped to preserve integrity from our facility
            to your lab.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-black/10 bg-white p-5 text-center">
              <p className="text-2xl font-bold text-gold">≥99%</p>
              <p className="text-sm text-zinc-500">Verified purity</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-white p-5 text-center">
              <p className="text-2xl font-bold text-gold">3rd-Party</p>
              <p className="text-sm text-zinc-500">Independent testing</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-white p-5 text-center">
              <p className="text-2xl font-bold text-gold">USA</p>
              <p className="text-sm text-zinc-500">Fast domestic shipping</p>
            </div>
          </div>

          <div id="contact" className="rounded-xl border border-black/10 bg-white p-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-navy">Contact Us</h2>
            <p className="mt-2 text-sm">
              Questions about an order or a product? Reach our team at{" "}
              <a
                href="mailto:support@goldentrianglepeptide.com"
                className="font-semibold text-gold hover:underline"
              >
                support@goldentrianglepeptide.com
              </a>
              .
            </p>
          </div>

          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Research Use Only.</strong> All products are intended strictly
            for laboratory research and development. They are not for human or
            veterinary use, and are not drugs, foods, or supplements.
          </div>

          <div className="text-center">
            <Link
              href="/products"
              className="inline-block rounded-lg bg-navy px-6 py-3 font-semibold text-white hover:bg-navy-dark"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
