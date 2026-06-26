import Link from "next/link";
import { POSTS } from "@/content/blog";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Research & Education | Golden Triangle Peptides",
  description:
    "Educational articles on research peptides — overviews, lab handling, reconstitution, storage, and how to read a Certificate of Analysis. Research use only.",
};

export default function BlogIndexPage() {
  const posts = [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold">
        Research &amp; Education
      </p>
      <h1 className="mt-1 font-serif text-4xl font-bold text-navy">
        The Research Library
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-600">
        Educational overviews of research peptides and good laboratory practice.
        For research use only — not medical advice.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex flex-col rounded-xl border border-black/10 bg-white p-6 transition hover:shadow-md"
          >
            <p className="text-xs text-zinc-500">
              {formatDate(new Date(post.date))} · {post.readingMinutes} min read
            </p>
            <h2 className="mt-2 font-serif text-xl font-bold text-navy">
              {post.title}
            </h2>
            <p className="mt-2 text-sm text-zinc-600">{post.description}</p>
            <span className="mt-4 text-sm font-semibold text-gold">
              Read article →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
