import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getPackageById } from "@/content/services";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const formData = await request.formData();
  const kind = formData.get("kind");

  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

  if (kind === "package") {
    const pkg = getPackageById(String(formData.get("packageId") ?? ""));
    if (!pkg) {
      return NextResponse.redirect(
        `${origin}/services/cancel?error=unknown_package`,
        { status: 303 },
      );
    }

    lineItems = [
      {
        price_data: {
          currency: pkg.currency,
          product_data: {
            name: pkg.name,
            description: pkg.description,
          },
          unit_amount: pkg.priceInCents,
        },
        quantity: 1,
      },
    ];
  } else if (kind === "tip") {
    const amount = Number(formData.get("amount"));
    if (!Number.isFinite(amount) || amount < 1 || amount > 10000) {
      return NextResponse.redirect(
        `${origin}/services/cancel?error=invalid_amount`,
        { status: 303 },
      );
    }

    lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Tip / support" },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ];
  } else {
    return NextResponse.redirect(
      `${origin}/services/cancel?error=invalid_request`,
      { status: 303 },
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/services/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/services/cancel`,
    });

    if (!session.url) {
      return NextResponse.redirect(
        `${origin}/services/cancel?error=stripe_error`,
        { status: 303 },
      );
    }

    return NextResponse.redirect(session.url, { status: 303 });
  } catch {
    return NextResponse.redirect(
      `${origin}/services/cancel?error=not_configured`,
      { status: 303 },
    );
  }
}
