import type { Assignment, Submission } from '../../types';
import { baseApi } from './baseApi';

export interface AssignmentAnalytics {
  totalAssignments: number;
  totalSubmissions: number;
  gradedSubmissions: number;
  averageGrade: number;
  completionRate: number;
  submissionsByAssignment: Array<{
    assignmentId: string;
    title: string;
    submissions: number;
  }>;
}

export const assignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssignmentsByCourse: builder.query<Assignment[], string>({
      query: (courseId) => ({
        url: `/api/assignments/course/${courseId}`,
      }),
      providesTags: (_result, _error, courseId) => [
        { type: 'Course', id: courseId },
      ],
    }),
    createAssignment: builder.mutation<
      Assignment,
      { courseId: string; body: Partial<Assignment> }
    >({
      query: ({ courseId, body }) => ({
        url: `/api/assignments/course/${courseId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: 'Course', id: courseId },
      ],
    }),
    getMySubmissionsByCourse: builder.query<Submission[], string>({
      query: (courseId) => ({
        url: `/api/assignments/course/${courseId}/submissions/me`,
      }),
      providesTags: ['Course'],
    }),
    submitAssignment: builder.mutation<
      Submission,
      { assignmentId: string; content: string }
    >({
      query: ({ assignmentId, content }) => ({
        url: `/api/assignments/${assignmentId}/submissions`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: ['Course'],
    }),
    getAssignmentSubmissions: builder.query<
      Submission[],
      string
    >({
      query: (assignmentId) => ({
        url: `/api/assignments/${assignmentId}/submissions`,
      }),
      providesTags: ['Course'],
    }),
    gradeSubmission: builder.mutation<
      Submission,
      { assignmentId: string; submissionId: string; grade: number }
    >({
      query: ({ assignmentId, submissionId, grade }) => ({
        url: `/api/assignments/${assignmentId}/submissions/${submissionId}/grade`,
        method: 'PATCH',
        body: { grade },
      }),
      invalidatesTags: ['Course'],
    }),
    getAssignmentAnalytics: builder.query<AssignmentAnalytics, string>({
      query: (courseId) => ({
        url: `/api/assignments/course/${courseId}/analytics`,
      }),
      providesTags: ['Course'],
    }),
  }),
});

export const {
  useGetAssignmentsByCourseQuery,
  useCreateAssignmentMutation,
  useGetMySubmissionsByCourseQuery,
  useSubmitAssignmentMutation,
  useGetAssignmentSubmissionsQuery,
  useGradeSubmissionMutation,
  useGetAssignmentAnalyticsQuery,
} = assignmentApi;
