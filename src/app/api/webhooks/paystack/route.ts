import { NextRequest, NextResponse } from "next/server";
import { sendDiscordNotification } from "@/lib/discord";
import { createSubscription, isValidSignature } from "@/lib/paystack";
import { formatPrice, freeCareMonths } from "@/content/services";
import {
  checkWebhookRateLimit,
  forgetWebhookReference,
  getClientIp,
  isDuplicateWebhookReference,
} from "@/lib/rate-limit";

type ChargeSuccessData = {
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string;
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

  // From the payment, not this delivery: Paystack can deliver or retry late.
  const startDate = data.paid_at ? new Date(data.paid_at) : new Date();
  const day = startDate.getDate();
  startDate.setMonth(startDate.getMonth() + freeCareMonths);
  // setMonth overflows short months (31 Dec + 2 = 3 Mar); clamp to the last day.
  if (startDate.getDate() !== day) startDate.setDate(0);

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
  const ip = getClientIp(request.headers);
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

    try {
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
      });
    } catch (error) {
      // Un-mark the reference and answer 500 so Paystack retries the delivery.
      console.error("Discord notification failed", {
        reference: data.reference,
        error,
      });
      await forgetWebhookReference(data.reference);
      return NextResponse.json({ error: "Notification failed" }, { status: 500 });
    }

    // Only after the alert succeeds: a retried delivery must not subscribe twice.
    if (isPackage && metadata.addCare) {
      const careStatus = await startFreeCare(data);
      await sendDiscordNotification({
        title: "Care plan",
        fields: [
          { name: "Status", value: careStatus },
          { name: "Reference", value: data.reference },
        ],
      }).catch((error) => {
        console.error("Care plan notification failed", {
          reference: data.reference,
          error,
        });
      });
    }
  }

  return NextResponse.json({ received: true });
}
