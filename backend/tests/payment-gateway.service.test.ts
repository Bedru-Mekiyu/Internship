import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  confirmGatewayPayment,
  createCheckoutSession,
  normalizeWebhookState,
} from '../src/services/payment-gateway.service';

const makeJsonResponse = (payload: unknown, ok = true): Response =>
  ({
    ok,
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  }) as unknown as Response;

describe('payment-gateway.service', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.PAYPAL_CLIENT_ID;
    delete process.env.PAYPAL_CLIENT_SECRET;
    delete process.env.PAYPAL_CAPTURE_ON_CONFIRM;
    delete process.env.BANK_TRANSFER_AUTO_COMPLETE;
    jest.restoreAllMocks();
  });

  it('normalizes webhook statuses into internal payment states', () => {
    expect(normalizeWebhookState(' paid ')).toBe('completed');
    expect(normalizeWebhookState('DECLINED')).toBe('failed');
    expect(normalizeWebhookState('processing')).toBe('pending');
    expect(normalizeWebhookState('unknown_status')).toBe('pending');
  });

  it('creates a deterministic bank transfer checkout session', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
    jest.spyOn(Math, 'random').mockReturnValue(0.12345);

    const result = await createCheckoutSession({
      provider: 'bank_transfer',
      amount: 10,
      currency: 'USD',
      reference: 'COURSE-1',
    });

    expect(result).toEqual({
      provider: 'bank_transfer',
      state: 'pending',
      externalPaymentId: 'bank_1700000000000_12345',
    });
  });

  it('throws when stripe configuration is missing', async () => {
    await expect(
      createCheckoutSession({
        provider: 'stripe',
        amount: 15,
        currency: 'USD',
        reference: 'COURSE-2',
      }),
    ).rejects.toThrow('Missing payment provider configuration: STRIPE_SECRET_KEY');
  });

  it('creates stripe checkout session and maps successful payment state', async () => {
    process.env.STRIPE_SECRET_KEY = 'stripe-secret';
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(
      makeJsonResponse({ id: 'cs_test_1', url: 'https://stripe.test/checkout', payment_status: 'paid' }),
    );
    global.fetch = fetchMock;

    const result = await createCheckoutSession({
      provider: 'stripe',
      amount: 12.345,
      currency: 'USD',
      reference: 'COURSE-3',
    });

    expect(result).toEqual({
      provider: 'stripe',
      state: 'completed',
      externalPaymentId: 'cs_test_1',
      checkoutUrl: 'https://stripe.test/checkout',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.stripe.com/v1/checkout/sessions');
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    const body = request.body as URLSearchParams;
    expect(body.get('line_items[0][price_data][currency]')).toBe('usd');
    expect(body.get('line_items[0][price_data][unit_amount]')).toBe('1235');
  });

  it('creates paypal checkout session and returns approve link', async () => {
    process.env.PAYPAL_CLIENT_ID = 'paypal-client-id';
    process.env.PAYPAL_CLIENT_SECRET = 'paypal-client-secret';
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeJsonResponse({ access_token: 'paypal-access-token' }))
      .mockResolvedValueOnce(
        makeJsonResponse({
          id: 'order_1',
          links: [{ rel: 'approve', href: 'https://paypal.test/approve' }],
        }),
      );
    global.fetch = fetchMock;

    const result = await createCheckoutSession({
      provider: 'paypal',
      amount: 22.4,
      currency: 'USD',
      reference: 'COURSE-4',
    });

    expect(result).toEqual({
      provider: 'paypal',
      state: 'pending',
      externalPaymentId: 'order_1',
      checkoutUrl: 'https://paypal.test/approve',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api-m.sandbox.paypal.com/v1/oauth2/token');
    expect(fetchMock.mock.calls[1][0]).toBe('https://api-m.sandbox.paypal.com/v2/checkout/orders');
  });

  it('confirms stripe payment and maps expired session to failed', async () => {
    process.env.STRIPE_SECRET_KEY = 'stripe-secret';
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValue(makeJsonResponse({ id: 'cs_expired', status: 'expired', payment_intent: 'pi_1' }));
    global.fetch = fetchMock;

    const result = await confirmGatewayPayment({ provider: 'stripe', externalPaymentId: 'session/1' });

    expect(result).toEqual({ state: 'failed', transactionId: 'pi_1' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.stripe.com/v1/checkout/sessions/session%2F1');
  });

  it('confirms paypal payment and captures when approved by default', async () => {
    process.env.PAYPAL_CLIENT_ID = 'paypal-client-id';
    process.env.PAYPAL_CLIENT_SECRET = 'paypal-client-secret';
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeJsonResponse({ access_token: 'paypal-access-token' }))
      .mockResolvedValueOnce(makeJsonResponse({ id: 'order_2', status: 'APPROVED' }))
      .mockResolvedValueOnce(
        makeJsonResponse({
          id: 'capture_batch',
          status: 'COMPLETED',
          purchase_units: [{ payments: { captures: [{ id: 'capture_1' }] } }],
        }),
      );
    global.fetch = fetchMock;

    const result = await confirmGatewayPayment({ provider: 'paypal', externalPaymentId: 'order_2' });

    expect(result).toEqual({ state: 'completed', transactionId: 'capture_1' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][0]).toBe('https://api-m.sandbox.paypal.com/v2/checkout/orders/order_2/capture');
  });

  it('confirms paypal payment without capture when capture-on-confirm is disabled', async () => {
    process.env.PAYPAL_CLIENT_ID = 'paypal-client-id';
    process.env.PAYPAL_CLIENT_SECRET = 'paypal-client-secret';
    process.env.PAYPAL_CAPTURE_ON_CONFIRM = 'false';
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeJsonResponse({ access_token: 'paypal-access-token' }))
      .mockResolvedValueOnce(makeJsonResponse({ id: 'order_3', status: 'APPROVED' }));
    global.fetch = fetchMock;

    const result = await confirmGatewayPayment({ provider: 'paypal', externalPaymentId: 'order_3' });

    expect(result).toEqual({ state: 'pending', transactionId: 'order_3' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('confirms bank transfer payment and auto-completes when configured', async () => {
    process.env.BANK_TRANSFER_AUTO_COMPLETE = 'true';
    const result = await confirmGatewayPayment({ provider: 'bank_transfer', externalPaymentId: 'bt_1' });

    expect(result).toEqual({ state: 'completed', transactionId: 'txn_bt_bt_1' });
  });
});
