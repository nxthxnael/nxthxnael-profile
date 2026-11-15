import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ipAddress } from "@vercel/functions";
import { sendDiscordNotification } from "@/lib/discord";
import { formatPrice, freeCareMonths } from "@/content/services";
import { createSubscription } from "@/lib/paystack";
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
  customer?: { email?: string; customer_code?: string };
  authorization?: { authorization_code?: string; reusable?: boolean };
  plan?: { name?: string } | null;
  metadata?: {
    kind?: string;
    packageName?: string;
    addCare?: boolean;
  } | null;
};

/** Subscribes the build's card to Care, first charge after the free months. */
async function startFreeCare(data: ChargeSuccessData): Promise<string> {
  const plan = process.env.PAYSTACK_PLAN_CARE;
  const customer = data.customer?.customer_code ?? data.customer?.email;
  const authorization = data.authorization?.authorization_code;

  if (!plan) return "Set up manually: PAYSTACK_PLAN_CARE is not set";
  // M-Pesa and bank payments can't be charged again later; only cards can.
  if (!customer || !authorization || !data.authorization?.reusable) {
    return "Set up manually: payment method can't be charged again";
  }

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() + freeCareMonths);

  try {
    await createSubscription({ customer, plan, authorization, startDate });
    return `Subscribed, first charge ${startDate.toDateString()}`;
  } catch (error) {
    console.error("Failed to start free Care subscription", {
      reference: data.reference,
      error,
    });
    return "Set up manually: Paystack rejected the subscription";
  }
}

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
    // Subscription renewals carry the plan but not our checkout metadata.
    const planName = data.plan?.name;
    const packageName = metadata.packageName ?? planName;
    const careStatus =
      isPackage && metadata.addCare ? await startFreeCare(data) : null;

    await sendDiscordNotification({
      title: isPackage
        ? "New booking"
        : planName
          ? "Subscription renewed"
          : "New tip received",
      fields: [
        ...((isPackage || planName) && packageName
          ? [{ name: "Package", value: packageName, inline: true }]
          : []),
        ...(careStatus ? [{ name: "Care plan", value: careStatus }] : []),
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
