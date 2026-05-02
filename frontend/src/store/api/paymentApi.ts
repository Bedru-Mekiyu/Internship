import { baseApi } from './baseApi';

export interface PaymentRecord {
  _id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  courseId: {
    _id: string;
    title: string;
  };
  instructorId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  paymentMethod?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentListResponse {
  payments: PaymentRecord[];
  total: number;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPayments: builder.query<PaymentListResponse, void>({
      query: () => ({
        url: '/api/payments/me',
      }),
      providesTags: ['Payment'],
    }),
  }),
});

export const { useGetMyPaymentsQuery } = paymentApi;
