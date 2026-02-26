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

type PayPalMoney = {
  currency_code: string;
  value: string;
};

type PayPalName = {
  given_name?: string;
  surname?: string;
};

type PayPalSubscriberName = {
  full_name?: string;
};

type PayPalSubscriberAddress = {
  address_line_1?: string;
  address_line_2?: string;
  admin_area_2?: string;
  admin_area_1?: string;
  postal_code?: string;
  country_code?: string;
};

type PayPalSubscriberShippingAddress = {
  name?: PayPalSubscriberName;
  address?: PayPalSubscriberAddress;
};

type PayPalSubscriber = {
  email_address?: string;
  payer_id?: string;
  name?: PayPalName;
  tenant?: string;
  shipping_address?: PayPalSubscriberShippingAddress;
};

type PayPalCycleExecution = {
  tenure_type?: 'TRIAL' | 'REGULAR' | string;
  sequence?: number;
  cycles_completed?: number;
  cycles_remaining?: number;
  total_cycles?: number;
  current_pricing_scheme_version?: number;
};

type PayPalBillingInfo = {
  outstanding_balance?: PayPalMoney;
  cycle_executions?: PayPalCycleExecution[];
  current_cycle_sequence?: number;
  next_billing_time?: string;
  final_payment_time?: string;
  failed_payments_count?: number;
  last_payment?: {
    amount?: PayPalMoney;
    time?: string;
  };
};

export type PayPalSubscriptionStatus =
  | 'APPROVAL_PENDING'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'EXPIRED'
  | string;

type PayPalErrorResponse = {
  name?: string;
  message?: string;
  details?: Array<{ issue?: string; description?: string }>;
};

type PayPalAccessTokenResponse = {
  access_token: string;
};

export type PayPalSubscription = {
  status?: PayPalSubscriptionStatus;
  status_update_time?: string;
  status_change_note?: string;
  id: string;
  plan_id?: string;
  start_time?: string;
  quantity?: string;
  shipping_amount?: PayPalMoney;
  subscriber?: PayPalSubscriber;
  billing_info?: PayPalBillingInfo;
  create_time?: string;
  update_time?: string;
  custom_id?: string;
  plan_overridden?: boolean;
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
