import type { Metadata } from "next";
import Link from "next/link";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Payment successful",
};

async function getSessionStatus(sessionId: string | undefined) {
  if (!sessionId) return null;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session.payment_status;
  } catch {
    return null;
  }
}

export default async function ServicesSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const paymentStatus = await getSessionStatus(session_id);

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        {paymentStatus === "paid" ? "Payment confirmed" : "Checkout complete"}
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
