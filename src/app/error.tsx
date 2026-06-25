"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in logs (and, once wired up, an error monitor) for diagnosis.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-sm font-semibold uppercase tracking-wide text-gold">
        Error
      </p>
      <h1 className="mt-3 font-serif text-4xl font-bold text-navy">
        Something went wrong
      </h1>
      <p className="mt-3 text-zinc-500">
        An unexpected error occurred. Please try again — if it keeps happening,
        contact support.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy-dark"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-black/10 px-6 py-3 font-semibold text-navy transition hover:bg-zinc-50"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
