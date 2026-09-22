import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { getAllPosts, getPostSource } from "@/lib/blog";
import type { PostFrontmatter } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const source = getPostSource(slug);
  if (!source) return {};

  const { frontmatter } = await compileMDX<PostFrontmatter>({
    source,
    options: { parseFrontmatter: true },
  });

  return {
    title: frontmatter.title,
    description: frontmatter.excerpt,
  };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const source = getPostSource(slug);
  if (!source) notFound();

  const { content, frontmatter } = await compileMDX<PostFrontmatter>({
    source,
    options: { parseFrontmatter: true },
  });

  return (
    <>
      <section className="border-b border-border bg-grid px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All posts
          </Link>
          <h1 className="text-glow-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
            {frontmatter.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <time dateTime={frontmatter.date}>
              {formatDate(frontmatter.date)}
            </time>
            {frontmatter.tags?.length ? (
              <>
                <span>·</span>
                <span>{frontmatter.tags.join(", ")}</span>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <article className="prose prose-sm sm:prose-base dark:prose-invert prose-headings:tracking-tight prose-a:text-accent prose-a:no-underline hover:prose-a:underline mx-auto max-w-3xl">
          {content}
        </article>
      </section>
    </>
  );
}
