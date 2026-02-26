import { billingConfig } from '@/config/billing';

const PAYPAL_BASE_URL: Record<'sandbox' | 'live', string> = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  live: 'https://api-m.paypal.com'
};

type PayPalLink = {
  href: string;
  rel: string;
  method?: string;
};

type PayPalErrorResponse = {
  name?: string;
  message?: string;
  details?: Array<{ issue?: string; description?: string }>;
};

type PayPalAccessTokenResponse = {
  access_token: string;
};

export type PayPalSubscription = {
  id: string;
  plan_id?: string;
  status?: string;
  start_time?: string;
  billing_info?: {
    next_billing_time?: string;
  };
  subscriber?: {
    payer_id?: string;
    email_address?: string;
  };
  links?: PayPalLink[];
};

type CreatePayPalSubscriptionParams = {
  planId: string;
  returnUrl: string;
  cancelUrl: string;
  customId?: string;
  startTime?: string;
};

type VerifyWebhookParams = {
  webhookEvent: unknown;
  transmissionId: string;
  transmissionTime: string;
  transmissionSig: string;
  certUrl: string;
  authAlgo: string;
};

function getPayPalBaseUrl(): string {
  return PAYPAL_BASE_URL[billingConfig.paypal.env];
}

async function readPayPalJson<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  const fallbackError = `PayPal request failed with status ${response.status}`;
  const bodyText = await response.text();
  if (!bodyText) {
    throw new Error(fallbackError);
  }

  try {
    const parsed = JSON.parse(bodyText) as PayPalErrorResponse;
    const details =
      parsed.details
        ?.map((item) => item.description || item.issue)
        .filter(Boolean)
        .join(', ') ?? '';
    throw new Error(parsed.message || details || fallbackError);
  } catch {
    throw new Error(fallbackError);
  }
}

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = billingConfig.paypal.clientId();
  const clientSecret = billingConfig.paypal.clientSecret();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  );

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const payload = await readPayPalJson<PayPalAccessTokenResponse>(response);
  if (!payload.access_token) {
    throw new Error('PayPal access token not found in response.');
  }

  return payload.access_token;
}

export async function createPayPalSubscription(
  input: CreatePayPalSubscriptionParams
): Promise<{ subscription: PayPalSubscription; approveUrl: string | null }> {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/billing/subscriptions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        plan_id: input.planId,
        custom_id: input.customId,
        start_time: input.startTime,
        application_context: {
          user_action: 'SUBSCRIBE_NOW',
          return_url: input.returnUrl,
          cancel_url: input.cancelUrl
        }
      })
    }
  );

  const subscription = await readPayPalJson<PayPalSubscription>(response);
  const approveUrl =
    subscription.links?.find((link) => link.rel === 'approve')?.href ?? null;

  return { subscription, approveUrl };
}

export async function getPayPalSubscription(
  subscriptionId: string
): Promise<PayPalSubscription> {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    }
  );

  return readPayPalJson<PayPalSubscription>(response);
}

export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason = 'Cancelled by garage owner'
): Promise<void> {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ reason })
    }
  );

  if (!response.ok) {
    await readPayPalJson<unknown>(response);
  }
}

export async function verifyPayPalWebhookSignature(
  input: VerifyWebhookParams
): Promise<boolean> {
  const accessToken = await getPayPalAccessToken();
  const webhookId = billingConfig.paypal.webhookId();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        transmission_id: input.transmissionId,
        transmission_time: input.transmissionTime,
        cert_url: input.certUrl,
        auth_algo: input.authAlgo,
        transmission_sig: input.transmissionSig,
        webhook_id: webhookId,
        webhook_event: input.webhookEvent
      })
    }
  );

  const payload = await readPayPalJson<{ verification_status?: string }>(
    response
  );

  return payload.verification_status === 'SUCCESS';
}
