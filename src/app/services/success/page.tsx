import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { verifyTransaction } from "@/lib/paystack";
import { checkCheckoutRateLimit } from "@/lib/rate-limit";

export const metadata: Metadata = {
  title: "Payment status",
};

// Paystack references are short alphanumeric strings; skip the API call for junk.
const REFERENCE_PATTERN = /^[\w.=-]{8,64}$/;

async function getTransactionStatus(reference: string | undefined) {
  if (!reference || !REFERENCE_PATTERN.test(reference)) return null;

  // Each verify costs a Paystack API call, so meter it like checkout.
  const ip = (await headers()).get("x-real-ip") ?? "unknown";
  if (!(await checkCheckoutRateLimit(ip))) return null;

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

  const confirmed = status === "success";

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        {confirmed ? "Payment confirmed" : "Checkout"}
      </p>
      <h1 className="text-glow-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
        {confirmed ? "Thank you!" : "Payment not confirmed"}
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {confirmed
          ? "Your payment went through. I'll be in touch shortly to follow up."
          : "We couldn't confirm a payment yet. If you were charged, please don't pay again: I'll see it and get in touch. Otherwise you can try again."}
      </p>
      <Link
        href={confirmed ? "/" : "/services"}
        className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        {confirmed ? "Back home" : "Back to services"}
      </Link>
    </section>
  );
}
