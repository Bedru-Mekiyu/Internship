import type { Course, CourseModule, CourseProgress, CourseReviewPayload } from '../../types';
import { baseApi } from './baseApi';

export interface CreateCoursePayload {
  title: string;
  subtitle?: string;
  visibility?: 'Draft' | 'Published';
}

export const courseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<Course[], void>({
      query: () => ({
        url: '/api/courses',
      }),
      providesTags: ['Course'],
    }),
    getCourseById: builder.query<Course, string>({
      query: (courseId) => ({
        url: `/api/courses/${courseId}`,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Course', id }],
    }),
    getCourseModules: builder.query<CourseModule[], string>({
      query: (courseId) => ({
        url: `/api/courses/${courseId}/modules`,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Course', id }],
    }),
    getCourseProgress: builder.query<CourseProgress, string>({
      query: (courseId) => ({
        url: `/api/courses/${courseId}/progress`,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Course', id }],
    }),
    enrollInCourse: builder.mutation<{ message: string }, string>({
      query: (courseId) => ({
        url: `/api/courses/${courseId}/enroll`,
        method: 'POST',
      }),
      invalidatesTags: ['Course'],
    }),
    createCourse: builder.mutation<Course, CreateCoursePayload>({
      query: (payload) => ({
        url: '/api/courses',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Course'],
    }),
    createCourseReview: builder.mutation<{ message: string }, { courseId: string; payload: CourseReviewPayload }>({
      query: ({ courseId, payload }) => ({
        url: `/api/courses/${courseId}/review`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Course', id: arg.courseId }],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetCourseModulesQuery,
  useGetCourseProgressQuery,
  useEnrollInCourseMutation,
  useCreateCourseMutation,
  useCreateCourseReviewMutation,
} = courseApi;
