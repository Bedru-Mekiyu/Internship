import { Request, Response } from 'express';
import { confirmPayment } from '../src/controllers/payment.controller';

jest.mock('../src/models/Payment.model', () => ({
  Payment: {
    findOne: jest.fn(),
  },
}));

jest.mock('../src/models/Course.model', () => ({
  Course: {
    findById: jest.fn(),
  },
}));

jest.mock('../src/models/Enrollment.model', () => ({
  Enrollment: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../src/models/Notification.model', () => ({
  Notification: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../src/services/payment-gateway.service', () => ({
  confirmGatewayPayment: jest.fn(),
  createCheckoutSession: jest.fn(),
  normalizeWebhookState: jest.fn((status: string) => status),
}));

const { Payment } = jest.requireMock('../src/models/Payment.model') as {
  Payment: { findOne: jest.Mock };
};
const { Course } = jest.requireMock('../src/models/Course.model') as {
  Course: { findById: jest.Mock };
};
const { Enrollment } = jest.requireMock('../src/models/Enrollment.model') as {
  Enrollment: { findOne: jest.Mock; create: jest.Mock };
};
const { Notification } = jest.requireMock('../src/models/Notification.model') as {
  Notification: { findOne: jest.Mock; create: jest.Mock };
};
const { confirmGatewayPayment } = jest.requireMock('../src/services/payment-gateway.service') as {
  confirmGatewayPayment: jest.Mock;
};

const createResponse = () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return response as unknown as Response;
};

describe('Payment controller notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a notification when payment confirmation succeeds', async () => {
    const paymentSave = jest.fn().mockResolvedValue(undefined);
    Payment.findOne.mockResolvedValue({
      _id: 'payment-1',
      userId: '507f191e810c19729de860ea',
      courseId: 'course-1',
      provider: 'stripe',
      externalPaymentId: 'ext-1',
      status: 'pending',
      save: paymentSave,
    });

    confirmGatewayPayment.mockResolvedValue({
      state: 'completed',
      transactionId: 'tx-1',
    });

    Course.findById.mockResolvedValue({ _id: 'course-1' });
    Enrollment.findOne.mockResolvedValue({ _id: 'enrollment-1' });
    Notification.findOne.mockResolvedValue(null);
    Notification.create.mockResolvedValue(undefined);

    const request = {
      params: { id: 'payment-1' },
      user: { _id: '507f191e810c19729de860ea', role: 'student' },
    } as unknown as Request;

    const response = createResponse();

    await new Promise<void>((resolve) => {
      confirmPayment(request, response, (error: unknown) => {
        expect(error).toBeUndefined();
        resolve();
      });
      setImmediate(() => resolve());
    });

    expect(paymentSave).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Payment confirmed',
        type: 'system',
      })
    );
  });
});
