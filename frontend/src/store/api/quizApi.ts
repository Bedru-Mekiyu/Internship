import { baseApi } from './baseApi';

export interface QuizQuestion {
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  options?: string[];
  correctAnswer?: unknown;
  points?: number;
  explanation?: string;
}

export interface CreateQuizPayload {
  lessonId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  attempts?: number;
  passingScore?: number;
  isPublished?: boolean;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  attempts?: number;
  passingScore?: number;
  totalPoints?: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  _id: string;
  score: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  attemptNumber?: number;
  attemptsRemaining?: number;
  totalAttemptsAllowed?: number;
  quiz?: {
    _id: string;
    title: string;
    totalPoints?: number;
    questionCount?: number;
    course?: {
      _id: string;
      title: string;
      slug?: string;
    };
  };
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
      providesTags: (...args) => [{ type: 'Quiz', id: `lesson-${args[2]}` }],
    }),
    getAllQuizAttempts: builder.query<QuizAttempt[], void>({
      query: () => ({
        url: `/api/quizzes/all-attempts/me`,
      }),
      providesTags: () => [{ type: 'Quiz', id: 'all-attempts' }],
    }),
    getQuizAttemptsMe: builder.query<QuizAttempt[], string>({
      query: (quizId) => ({
        url: `/api/quizzes/${quizId}/attempts/me`,
      }),
      providesTags: (...args) => [{ type: 'Quiz', id: `attempts-${args[2]}` }],
    }),
    createQuiz: builder.mutation<Quiz, CreateQuizPayload>({
      query: (payload) => ({
        url: `/api/quizzes/lesson/${payload.lessonId}`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (...args) => [{ type: 'Quiz', id: `lesson-${args[2].lessonId}` }],
    }),
    submitQuizAttempt: builder.mutation<QuizAttempt, SubmitQuizAttemptPayload>({
      query: ({ quizId, answers }) => ({
        url: `/api/quizzes/${quizId}/attempts`,
        method: 'POST',
        body: {
          answers,
        },
      }),
      invalidatesTags: (...args) => [{ type: 'Quiz', id: `attempts-${args[2].quizId}` }],
    }),
  }),
});

export const {
  useGetLessonQuizzesQuery,
  useGetAllQuizAttemptsQuery,
  useGetQuizAttemptsMeQuery,
  useCreateQuizMutation,
  useSubmitQuizAttemptMutation,
} = quizApi;
