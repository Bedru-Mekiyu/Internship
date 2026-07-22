import type { ContactMessage, ContactMessagesResponse } from '../../types';
import { baseApi } from './baseApi';

export interface UpdateStatusPayload {
  contactMessageId: string;
  status: 'new' | 'in_progress' | 'resolved';
  reviewNotes?: string;
}

export interface AssignPayload {
  contactMessageId: string;
  assignedTo?: string;
}

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContactMessages: builder.query<
      ContactMessagesResponse,
      { page?: number; limit?: number; status?: string; q?: string; mine?: string }
    >({
      query: (params) => ({
        url: '/api/contact',
        params,
      }),
      providesTags: ['ContactMessage'],
    }),
    updateContactMessageStatus: builder.mutation<ContactMessage, UpdateStatusPayload>({
      query: ({ contactMessageId, status, reviewNotes }) => ({
        url: `/api/contact/${contactMessageId}/status`,
        method: 'PATCH',
        body: { status, reviewNotes },
      }),
      invalidatesTags: ['ContactMessage'],
    }),
    assignContactMessage: builder.mutation<ContactMessage, AssignPayload>({
      query: ({ contactMessageId, assignedTo }) => ({
        url: `/api/contact/${contactMessageId}/assign`,
        method: 'PATCH',
        body: { assignedTo },
      }),
      invalidatesTags: ['ContactMessage'],
    }),
  }),
});

export const {
  useGetContactMessagesQuery,
  useUpdateContactMessageStatusMutation,
  useAssignContactMessageMutation,
} = contactApi;
