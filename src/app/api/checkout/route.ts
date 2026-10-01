import { NextRequest, NextResponse } from "next/server";
import { ipAddress } from "@vercel/functions";
import { initializeTransaction } from "@/lib/paystack";
import { getPackageById, currency } from "@/content/services";
import { checkCheckoutRateLimit } from "@/lib/rate-limit";

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

  const ip = ipAddress(request) ?? "unknown";
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
  let metadata: Record<string, unknown>;

  if (kind === "package") {
    const pkg = getPackageById(String(formData.get("packageId") ?? ""));
    if (!pkg) {
      return NextResponse.redirect(
        `${origin}/services/cancel?error=unknown_package`,
        { status: 303 },
      );
    }
    amountInKobo = pkg.priceInKobo;
    metadata = { kind: "package", packageId: pkg.id, packageName: pkg.name };
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
      metadata,
    });

    return NextResponse.redirect(authorizationUrl, { status: 303 });
  } catch {
    return NextResponse.redirect(
      `${origin}/services/cancel?error=not_configured`,
      { status: 303 },
    );
  }
}
