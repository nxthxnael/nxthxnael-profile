import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ipAddress } from "@vercel/functions";
import { sendDiscordNotification } from "@/lib/discord";
import { formatPrice } from "@/content/services";
import {
  checkWebhookRateLimit,
  isDuplicateWebhookReference,
} from "@/lib/rate-limit";

function isValidSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;

  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== signatureBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

type ChargeSuccessData = {
  reference: string;
  amount: number;
  currency: string;
  customer?: { email?: string };
  metadata?: {
    kind?: string;
    packageName?: string;
  } | null;
};

export async function POST(request: NextRequest) {
  const ip = ipAddress(request) ?? "unknown";
  const withinLimit = await checkWebhookRateLimit(ip);
  if (!withinLimit) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!isValidSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    data: ChargeSuccessData;
  };

  if (event.event === "charge.success") {
    const { data } = event;

    const isDuplicate = await isDuplicateWebhookReference(data.reference);
    if (isDuplicate) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const metadata = data.metadata ?? {};
    const isPackage = metadata.kind === "package";

    await sendDiscordNotification({
      title: isPackage ? "New booking" : "New tip received",
      fields: [
        ...(isPackage && metadata.packageName
          ? [{ name: "Package", value: metadata.packageName, inline: true }]
          : []),
        {
          name: "Amount",
          value: formatPrice(data.amount, data.currency),
          inline: true,
        },
        {
          name: "From",
          value: data.customer?.email ?? "unknown",
          inline: true,
        },
        { name: "Reference", value: data.reference },
      ],
    }).catch(() => {
      // Notification failures shouldn't fail webhook acknowledgment.
    });
  }

  return NextResponse.json({ received: true });
}
