import { baseApi } from './baseApi';

export interface QuizQuestion {
  question: string;
  options?: string[];
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  _id: string;
  score: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

export interface SubmitQuizAttemptPayload {
  quizId: string;
  answers: Array<{
    questionIndex: number;
    answer: unknown;
  }>;
}

export const quizApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLessonQuizzes: builder.query<Quiz[], string>({
      query: (lessonId) => ({
        url: `/api/quizzes/lesson/${lessonId}`,
      }),
      providesTags: (_result, _error, lessonId) => [{ type: 'Quiz', id: `lesson-${lessonId}` }],
    }),
    getQuizAttemptsMe: builder.query<QuizAttempt[], string>({
      query: (quizId) => ({
        url: `/api/quizzes/${quizId}/attempts/me`,
      }),
      providesTags: (_result, _error, quizId) => [{ type: 'Quiz', id: `attempts-${quizId}` }],
    }),
    submitQuizAttempt: builder.mutation<QuizAttempt, SubmitQuizAttemptPayload>({
      query: ({ quizId, answers }) => ({
        url: `/api/quizzes/${quizId}/attempts`,
        method: 'POST',
        body: {
          answers,
        },
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Quiz', id: `attempts-${arg.quizId}` }],
    }),
  }),
});

export const {
  useGetLessonQuizzesQuery,
  useGetQuizAttemptsMeQuery,
  useSubmitQuizAttemptMutation,
} = quizApi;
