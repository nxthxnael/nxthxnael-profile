import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { PageHeader } from "@/components/page-header";
import { termsVersion } from "@/content/terms";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Terms for website builds, hosting and monthly care plans from nxthxnael.dev.",
};

export default async function TermsPage() {
  const source = fs.readFileSync(
    path.join(process.cwd(), "content", "terms.mdx"),
    "utf8",
  );
  const { content } = await compileMDX({
    source,
    options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
  });

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of service."
        description={`Website builds, hosting and monthly care plans. Last updated ${new Date(
          termsVersion,
        ).toLocaleDateString("en-GB", { dateStyle: "long", timeZone: "UTC" })}.`}
      />
      <section className="px-6 py-16">
        <article className="prose prose-sm sm:prose-base dark:prose-invert prose-headings:tracking-tight prose-h2:scroll-mt-24 prose-a:text-accent prose-a:no-underline hover:prose-a:underline mx-auto max-w-3xl">
          {content}
        </article>
      </section>
    </>
  );
}
