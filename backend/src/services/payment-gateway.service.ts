import { withRetry } from '../utils/with-retry';

export type PaymentProvider = 'stripe' | 'paypal' | 'bank_transfer';
export type PaymentState = 'pending' | 'completed' | 'failed';

export interface CreateCheckoutInput {
  provider: PaymentProvider;
  amount: number;
  currency: string;
  reference: string;
}

export interface CheckoutResult {
  provider: PaymentProvider;
  state: PaymentState;
  externalPaymentId: string;
  checkoutUrl?: string;
}

export interface ConfirmPaymentInput {
  provider: PaymentProvider;
  externalPaymentId: string;
}

export interface ConfirmResult {
  state: PaymentState;
  transactionId: string;
}

const makeExternalId = (prefix: string) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value.trim().toLowerCase() === 'true';
};

const toMinorUnitAmount = (amount: number) => Math.max(Math.round(amount * 100), 0);

const fetchWithRetry = (input: RequestInfo | URL, init?: RequestInit) =>
  withRetry(() => fetch(input, init), { retries: 3, baseDelayMs: 200, maxDelayMs: 4000 });

const ensureProviderConfig = (name: string, value: string | undefined) => {
  if (value && value.trim()) return value;
  throw new Error(`Missing payment provider configuration: ${name}`);
};

const getBaseUrl = () => process.env.BASE_URL || 'http://localhost:5000';

const getStripeConfig = () => {
  const secretKey = ensureProviderConfig('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY);
  const baseUrl = getBaseUrl();
  const successUrl = process.env.STRIPE_SUCCESS_URL || `${baseUrl}/payments/success?provider=stripe`;
  const cancelUrl = process.env.STRIPE_CANCEL_URL || `${baseUrl}/payments/cancel?provider=stripe`;

  return {
    secretKey,
    successUrl,
    cancelUrl,
  };
};

const getPaypalBaseUrl = () => {
  const env = (process.env.PAYPAL_ENV || 'sandbox').trim().toLowerCase();
  return env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
};

const getPaypalConfig = () => {
  const clientId = ensureProviderConfig('PAYPAL_CLIENT_ID', process.env.PAYPAL_CLIENT_ID);
  const clientSecret = ensureProviderConfig('PAYPAL_CLIENT_SECRET', process.env.PAYPAL_CLIENT_SECRET);
  const baseUrl = getBaseUrl();
  const returnUrl = process.env.PAYPAL_RETURN_URL || `${baseUrl}/payments/success?provider=paypal`;
  const cancelUrl = process.env.PAYPAL_CANCEL_URL || `${baseUrl}/payments/cancel?provider=paypal`;

  return {
    clientId,
    clientSecret,
    returnUrl,
    cancelUrl,
  };
};

const getPaypalAccessToken = async () => {
  const { clientId, clientSecret } = getPaypalConfig();

  const tokenResponse = await fetchWithRetry(`${getPaypalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenResponse.ok) {
    const details = await tokenResponse.text();
    throw new Error(`PayPal token request failed: ${details}`);
  }

  const payload = await tokenResponse.json() as { access_token?: string };
  if (!payload.access_token) {
    throw new Error('PayPal token request failed: missing access token');
  }

  return payload.access_token;
};

const mapPaypalStatusToState = (status: string | undefined): PaymentState => {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'completed') return 'completed';
  if (['voided', 'declined', 'failed', 'canceled', 'cancelled'].includes(normalized)) return 'failed';
  return 'pending';
};

const mapStripeStatusToState = (paymentStatus: string | undefined, sessionStatus: string | undefined): PaymentState => {
  if ((paymentStatus || '').toLowerCase() === 'paid') return 'completed';
  if ((sessionStatus || '').toLowerCase() === 'expired') return 'failed';
  return 'pending';
};

export const createCheckoutSession = async (input: CreateCheckoutInput): Promise<CheckoutResult> => {
  if (input.provider === 'bank_transfer') {
    return {
      provider: input.provider,
      state: 'pending',
      externalPaymentId: makeExternalId('bank'),
    };
  }

  if (input.provider === 'stripe') {
    const config = getStripeConfig();

    const formData = new URLSearchParams();
    formData.append('mode', 'payment');
    formData.append('success_url', config.successUrl);
    formData.append('cancel_url', config.cancelUrl);
    formData.append('line_items[0][quantity]', '1');
    formData.append('line_items[0][price_data][currency]', input.currency.toLowerCase());
    formData.append('line_items[0][price_data][unit_amount]', String(toMinorUnitAmount(input.amount)));
    formData.append('line_items[0][price_data][product_data][name]', `Course purchase ${input.reference}`);
    formData.append('metadata[reference]', input.reference);

    const response = await fetchWithRetry('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Stripe checkout session creation failed: ${details}`);
    }

    const payload = await response.json() as { id: string; url?: string; payment_status?: string; status?: string };

    return {
      provider: 'stripe',
      state: mapStripeStatusToState(payload.payment_status, payload.status),
      externalPaymentId: payload.id,
      checkoutUrl: payload.url,
    };
  }

  const paypalToken = await getPaypalAccessToken();

  const paypalConfig = getPaypalConfig();
  const orderResponse = await fetchWithRetry(`${getPaypalBaseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${paypalToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: input.reference,
          amount: {
            currency_code: input.currency,
            value: input.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: paypalConfig.returnUrl,
        cancel_url: paypalConfig.cancelUrl,
      },
    }),
  });

  if (!orderResponse.ok) {
    const details = await orderResponse.text();
    throw new Error(`PayPal order creation failed: ${details}`);
  }

  const orderPayload = await orderResponse.json() as {
    id: string;
    status?: string;
    links?: Array<{ rel: string; href: string }>;
  };
  const approvalLink = orderPayload.links?.find((link) => link.rel === 'approve')?.href;

  return {
    provider: 'paypal',
    state: 'pending',
    externalPaymentId: orderPayload.id,
    checkoutUrl: approvalLink,
  };
};

export const confirmGatewayPayment = async (input: ConfirmPaymentInput): Promise<ConfirmResult> => {
  if (input.provider === 'stripe') {
    const config = getStripeConfig();

    const response = await fetchWithRetry(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(input.externalPaymentId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
      },
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Stripe payment confirmation failed: ${details}`);
    }

    const payload = await response.json() as {
      id: string;
      status?: string;
      payment_status?: string;
      payment_intent?: string;
    };

    return {
      state: mapStripeStatusToState(payload.payment_status, payload.status),
      transactionId: payload.payment_intent || payload.id,
    };
  }

  if (input.provider === 'paypal') {
    const token = await getPaypalAccessToken();

    const captureOnConfirm = parseBoolean(process.env.PAYPAL_CAPTURE_ON_CONFIRM, true);
    let state: PaymentState = 'pending';
    let transactionId = input.externalPaymentId;

    const detailsResponse = await fetchWithRetry(`${getPaypalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(input.externalPaymentId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!detailsResponse.ok) {
      const details = await detailsResponse.text();
      throw new Error(`PayPal order lookup failed: ${details}`);
    }

    const detailsPayload = await detailsResponse.json() as {
      id: string;
      status?: string;
      purchase_units?: Array<{ payments?: { captures?: Array<{ id: string }> } }>;
    };

    state = mapPaypalStatusToState(detailsPayload.status);
    const existingCaptureId = detailsPayload.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    if (existingCaptureId) {
      transactionId = existingCaptureId;
    }

    if (state === 'pending' && (detailsPayload.status || '').toLowerCase() === 'approved' && captureOnConfirm) {
      const captureResponse = await fetchWithRetry(`${getPaypalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(input.externalPaymentId)}/capture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!captureResponse.ok) {
        const details = await captureResponse.text();
        throw new Error(`PayPal capture failed: ${details}`);
      }

      const capturePayload = await captureResponse.json() as {
        id: string;
        status?: string;
        purchase_units?: Array<{ payments?: { captures?: Array<{ id: string }> } }>;
      };

      state = mapPaypalStatusToState(capturePayload.status);
      transactionId = capturePayload.purchase_units?.[0]?.payments?.captures?.[0]?.id || capturePayload.id;
    }

    return {
      state,
      transactionId,
    };
  }

  const transactionPrefix = 'txn_bt';
  const bankTransferAutoComplete = parseBoolean(process.env.BANK_TRANSFER_AUTO_COMPLETE, false);
  const state: PaymentState = bankTransferAutoComplete ? 'completed' : 'pending';

  return {
    state,
    transactionId: `${transactionPrefix}_${input.externalPaymentId}`,
  };
};

export const normalizeWebhookState = (status: string): PaymentState => {
  const normalized = status.trim().toLowerCase();

  if (['completed', 'paid', 'succeeded', 'captured'].includes(normalized)) {
    return 'completed';
  }

  if (['failed', 'declined', 'denied', 'expired', 'voided', 'canceled', 'cancelled'].includes(normalized)) {
    return 'failed';
  }

  if (['pending', 'processing', 'requires_action', 'requires_payment_method', 'created', 'approved'].includes(normalized)) {
    return 'pending';
  }

  return 'pending';
};