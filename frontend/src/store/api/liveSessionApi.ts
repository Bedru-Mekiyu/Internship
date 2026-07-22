import type { LiveSession } from '../../types';
import { baseApi } from './baseApi';

export const liveSessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLiveSessionsByCourse: builder.query<LiveSession[], string>({
      query: (courseId) => ({
        url: `/api/live-sessions/course/${courseId}`,
      }),
      providesTags: (_result, _error, courseId) => [
        { type: 'Course', id: courseId },
      ],
    }),
  }),
});

export const { useGetLiveSessionsByCourseQuery } = liveSessionApi;
