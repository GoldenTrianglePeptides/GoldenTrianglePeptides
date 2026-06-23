type Section = { heading: string; body: string[] };

export default function PolicyPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: Section[];
}) {
  return (
    <div>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-white/60">Last updated: {updated}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-lg font-bold text-navy">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-2 leading-relaxed text-zinc-700">
                  {p}
                </p>
              ))}
            </div>
          ))}

          <div className="rounded-lg border border-gold/40 bg-gold/5 p-4 text-sm text-navy/80">
            <strong className="text-navy">Research Use Only.</strong> All products
            are intended strictly for laboratory research and development and are
            not for human or veterinary use. This page is provided for general
            information and is not legal advice.
          </div>
        </div>
      </section>
    </div>
  );
}
