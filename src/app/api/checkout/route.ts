import { NextRequest, NextResponse } from "next/server";
import { initializeTransaction } from "@/lib/paystack";
import { getPackageById, currency } from "@/content/services";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
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
