import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { TipForm } from "@/components/tip-form";

export const metadata: Metadata = {
  title: "Support",
  description: "Support the work with a tip — no scope required.",
};

export default function SupportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Support"
        title="Support the work."
        description="Found something useful? Send a tip — no fixed scope, no strings."
      />

      <section className="px-6 py-16">
        <div className="mx-auto max-w-md">
          <TipForm />
        </div>
      </section>
    </>
  );
}
