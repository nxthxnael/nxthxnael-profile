import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout canceled",
};

const errorMessages: Record<string, string> = {
  not_configured:
    "Payments aren't set up yet — add a Stripe secret key to enable checkout.",
  unknown_package: "That package couldn't be found.",
  invalid_amount: "Please enter a valid amount.",
  invalid_request: "That request wasn't valid.",
  stripe_error: "Something went wrong starting checkout. Please try again.",
};

export default async function ServicesCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message =
    (error && errorMessages[error]) ??
    "Checkout was canceled — no payment was made.";

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
      <p className="text-sm font-medium text-muted-foreground">Checkout</p>
      <h1 className="text-glow-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
        Not completed
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <Link
        href="/services"
        className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Back to services
      </Link>
    </section>
  );
}
