import { NextRequest, NextResponse } from "next/server";
import { initializeTransaction } from "@/lib/paystack";
import { getPackageById, currency } from "@/content/services";
import { checkCheckoutRateLimit, getClientIp } from "@/lib/rate-limit";

/** Recorded on each order as evidence of which terms the client accepted. */
const termsVersion = "2026-11-15";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Rejects cross-site form submissions to this endpoint. */
function isSameOrigin(request: NextRequest): boolean {
  const host = request.nextUrl.host;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  // Neither header present — allow (e.g. non-browser clients).
  return true;
}

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;

  if (!isSameOrigin(request)) {
    return NextResponse.redirect(
      `${origin}/services/cancel?error=invalid_request`,
      { status: 303 },
    );
  }

  const ip = getClientIp(request.headers);
  const withinLimit = await checkCheckoutRateLimit(ip);
  if (!withinLimit) {
    return NextResponse.redirect(
      `${origin}/services/cancel?error=rate_limited`,
      { status: 303 },
    );
  }

  const formData = await request.formData();
  const kind = formData.get("kind");
  const email = String(formData.get("email") ?? "");
  const cancelUrl = `${origin}/services/cancel`;
  const callbackUrl = `${origin}/services/success`;

  if (!isValidEmail(email)) {
    return NextResponse.redirect(
      `${origin}/services/cancel?error=invalid_email`,
      { status: 303 },
    );
  }

  let amountInKobo: number;
  let plan: string | undefined;
  let metadata: Record<string, unknown>;

  if (kind === "package") {
    const pkg = getPackageById(String(formData.get("packageId") ?? ""));
    // The browser enforces the checkbox too; this covers forged or scripted posts.
    if (formData.get("acceptTerms") !== "on") {
      return NextResponse.redirect(
        `${origin}/services/cancel?error=terms_required`,
        { status: 303 },
      );
    }
    if (!pkg || pkg.bookCall) {
      return NextResponse.redirect(
        `${origin}/services/cancel?error=unknown_package`,
        { status: 303 },
      );
    }
    if (pkg.billing === "monthly") {
      plan = pkg.planEnvKey ? process.env[pkg.planEnvKey] : undefined;
      // Without a plan code this would be a one-off charge, not a subscription.
      if (!plan) {
        console.error("Checkout has no Paystack plan code", { packageId: pkg.id });
        return NextResponse.redirect(
          `${origin}/services/cancel?error=not_configured`,
          { status: 303 },
        );
      }
    }
    amountInKobo = pkg.priceInKobo;
    metadata = {
      kind: "package",
      packageId: pkg.id,
      packageName: pkg.name,
      termsAccepted: termsVersion,
    };
    if (pkg.offersCare && formData.get("addCare") === "on") {
      metadata.addCare = true;
    }
  } else if (kind === "tip") {
    const amount = Number(formData.get("amount"));
    if (!Number.isFinite(amount) || amount < 1 || amount > 1_000_000) {
      return NextResponse.redirect(
        `${origin}/services/cancel?error=invalid_amount`,
        { status: 303 },
      );
    }
    amountInKobo = Math.round(amount * 100);
    metadata = { kind: "tip" };
  } else {
    return NextResponse.redirect(
      `${origin}/services/cancel?error=invalid_request`,
      { status: 303 },
    );
  }

  try {
    const { authorizationUrl } = await initializeTransaction({
      email,
      amountInKobo,
      currency,
      callbackUrl,
      cancelUrl,
      plan,
      metadata,
    });

    return NextResponse.redirect(authorizationUrl, { status: 303 });
  } catch (error) {
    // No email here: keep customer PII out of the logs.
    console.error("Checkout failed to initialize a Paystack transaction", {
      ...metadata,
      amountInKobo,
      currency,
      error,
    });
    const code = process.env.PAYSTACK_SECRET_KEY
      ? "checkout_failed"
      : "not_configured";
    return NextResponse.redirect(`${origin}/services/cancel?error=${code}`, {
      status: 303,
    });
  }
}
