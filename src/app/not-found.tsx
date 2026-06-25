import Link from "next/link";

export const metadata = {
  title: "Page Not Found | Golden Triangle Peptides",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-sm font-semibold uppercase tracking-wide text-gold">
        404
      </p>
      <h1 className="mt-3 font-serif text-4xl font-bold text-navy">
        Page not found
      </h1>
      <p className="mt-3 text-zinc-500">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg border border-black/10 px-6 py-3 font-semibold text-navy transition hover:bg-zinc-50"
        >
          Go home
        </Link>
        <Link
          href="/products"
          className="rounded-lg bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy-dark"
        >
          Shop products
        </Link>
      </div>
    </div>
  );
}
