import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "@/content/blog";
import { siteUrl } from "@/lib/site";
import { formatDate } from "@/lib/format";

// Static content — render the known set of articles at build time.
export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article not found" };
  const url = `${siteUrl()}/blog/${post.slug}`;
  return {
    title: `${post.title} | Golden Triangle Peptides`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "Golden Triangle Peptides" },
    publisher: { "@type": "Organization", name: "Golden Triangle Peptides" },
    mainEntityOfPage: `${siteUrl()}/blog/${post.slug}`,
  };

  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/blog" className="hover:text-navy">
          ← Research Library
        </Link>
      </nav>

      <p className="text-xs text-zinc-500">
        {formatDate(new Date(post.date))} · {post.readingMinutes} min read
      </p>
      <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-navy sm:text-4xl">
        {post.title}
      </h1>

      <div
        className="article-body mt-8"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <div className="mt-12 rounded-xl border border-gold/40 bg-gold/5 p-5 text-center">
        <p className="font-serif text-lg font-bold text-navy">
          Shop research-grade peptides
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          Third-party tested. Verified purity.
        </p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-lg bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy-dark"
        >
          Browse Products
        </Link>
      </div>
    </article>
  );
}
