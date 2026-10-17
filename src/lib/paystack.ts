import { createHmac, timingSafeEqual } from "node:crypto";

const PAYSTACK_API = "https://api.paystack.co";

// Paystack allows only letters, digits, "-", "." and "=" in references; \w also
// lets "_" through, which is harmless. Used to skip the verify call for junk.
export const REFERENCE_PATTERN = /^[\w.=-]{8,64}$/;

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set. Add it to .env.local to enable checkout.",
    );
  }

  return key;
}

export type InitializeTransactionParams = {
  email: string;
  amountInKobo: number;
  currency: string;
  callbackUrl: string;
  cancelUrl: string;
  reference?: string;
  metadata?: Record<string, unknown>;
};

export type InitializeTransactionResult = {
  authorizationUrl: string;
  reference: string;
};

export async function initializeTransaction(
  params: InitializeTransactionParams,
): Promise<InitializeTransactionResult> {
  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountInKobo,
      currency: params.currency,
      callback_url: params.callbackUrl,
      reference: params.reference,
      metadata: {
        cancel_action: params.cancelUrl,
        ...params.metadata,
      },
    }),
  });

  // An HTML error page from a gateway or proxy isn't JSON; fall back to the status check.
  const json = await response.json().catch(() => ({}));

  if (!response.ok || !json.status) {
    throw new Error(json.message ?? "Failed to initialize Paystack transaction");
  }

  return {
    authorizationUrl: json.data.authorization_url,
    reference: json.data.reference,
  };
}

export type VerifyTransactionResult = {
  status: string;
  amount: number;
  currency: string;
};

export async function verifyTransaction(
  reference: string,
): Promise<VerifyTransactionResult> {
  const response = await fetch(
    `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${getSecretKey()}` },
    },
  );

  // An HTML error page from a gateway or proxy isn't JSON; fall back to the status check.
  const json = await response.json().catch(() => ({}));

  if (!response.ok || !json.status) {
    throw new Error(json.message ?? "Failed to verify Paystack transaction");
  }

  return {
    status: json.data.status,
    amount: json.data.amount,
    currency: json.data.currency,
  };
}

/** Checks the x-paystack-signature header (HMAC-SHA512 of the raw body). */
export function isValidSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;

  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== signatureBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}
