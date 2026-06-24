import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact | Golden Triangle Peptides",
  description:
    "Reach the Golden Triangle Peptides team for order questions, product availability, and certification requests.",
};

const INFO = [
  {
    label: "Email",
    value: "support@goldentrianglepeptide.com",
    note: "Best for certification requests and detailed order questions.",
    href: "mailto:support@goldentrianglepeptide.com",
  },
  {
    label: "Hours",
    value: "9am – 5pm CT, M–F",
    note: "Messages sent after hours are reviewed on the next business day.",
  },
  {
    label: "Response",
    value: "Within 1 business day",
    note: "We reply to every research and storefront inquiry we receive.",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
        Contact
      </p>
      <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-tight text-navy md:text-5xl">
        Reach the Golden Triangle Peptides team with the details that matter.
      </h1>
      <p className="mt-4 max-w-2xl text-zinc-600">
        Use the form below for order questions, product availability,
        certification requests, or general storefront support. For detailed help,
        email the support inbox directly.
      </p>

      {/* Info cards */}
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {INFO.map((i) => (
          <div
            key={i.label}
            className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              {i.label}
            </p>
            {i.href ? (
              <a
                href={i.href}
                className="mt-2 block text-lg font-bold text-navy hover:text-gold"
              >
                {i.value}
              </a>
            ) : (
              <p className="mt-2 text-lg font-bold text-navy">{i.value}</p>
            )}
            <p className="mt-2 text-sm text-zinc-500">{i.note}</p>
          </div>
        ))}
      </div>

      {/* Form + guidance */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <ContactForm />

        <div className="space-y-6">
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Useful Details
            </p>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight text-navy">
              What to include
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li className="flex gap-2">
                <span className="text-gold">•</span> Product name or CAS number
                when asking about availability
              </li>
              <li className="flex gap-2">
                <span className="text-gold">•</span> Order number for shipping,
                billing, or account issues
              </li>
              <li className="flex gap-2">
                <span className="text-gold">•</span> Specific certificate or
                lab-report request when relevant
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gold/40 bg-gold/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Research Use Only
            </p>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight text-navy">
              Storefront support
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Golden Triangle Peptides products are sold exclusively for
              laboratory research. Please keep questions focused on storefront
              support, product information, certifications, and order handling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
