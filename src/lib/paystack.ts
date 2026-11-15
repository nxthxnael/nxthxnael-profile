const PAYSTACK_API = "https://api.paystack.co";

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
  /** Paystack plan code; subscribes the customer and overrides the amount. */
  plan?: string;
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
      plan: params.plan,
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

export type CreateSubscriptionParams = {
  /** Customer code or email. */
  customer: string;
  plan: string;
  authorization: string;
  startDate: Date;
};

/** Subscribes a customer using a card they already paid with, from a later date. */
export async function createSubscription(params: CreateSubscriptionParams) {
  const response = await fetch(`${PAYSTACK_API}/subscription`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer: params.customer,
      plan: params.plan,
      authorization: params.authorization,
      start_date: params.startDate.toISOString(),
    }),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok || !json.status) {
    throw new Error(json.message ?? "Failed to create Paystack subscription");
  }
}
