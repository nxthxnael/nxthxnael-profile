import type { Metadata } from "next";
import Link from "next/link";
import { verifyTransaction } from "@/lib/paystack";

export const metadata: Metadata = {
  title: "Payment successful",
};

async function getTransactionStatus(reference: string | undefined) {
  if (!reference) return null;

  try {
    const result = await verifyTransaction(reference);
    return result.status;
  } catch {
    return null;
  }
}

export default async function ServicesSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const { reference, trxref } = await searchParams;
  const status = await getTransactionStatus(reference ?? trxref);

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        {status === "success" ? "Payment confirmed" : "Checkout complete"}
      </p>
      <h1 className="text-glow-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
        Thank you!
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Your payment went through. I&apos;ll be in touch shortly to follow up.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Back home
      </Link>
    </section>
  );
}
