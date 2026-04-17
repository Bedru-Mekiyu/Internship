import {
  useGetLessonQuizzesQuery,
  useGetQuizAttemptsMeQuery,
  useSubmitQuizAttemptMutation,
} from '../store/api/quizApi';

export const useLessonQuiz = (lessonId: string) => {
  const query = useGetLessonQuizzesQuery(lessonId, {
    skip: !lessonId,
  });

  return {
    quizzes: query.data ?? [],
    quiz: query.data?.[0] ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
};

export const useQuizAttemptsMe = (quizId: string) => {
  const query = useGetQuizAttemptsMeQuery(quizId, {
    skip: !quizId,
  });

  return {
    attempts: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
};

export const useSubmitQuizAttempt = () => {
  const [submitQuizAttempt, state] = useSubmitQuizAttemptMutation();

  const submitAttempt = async (
    quizId: string,
    answers: Array<{ questionIndex: number; answer: unknown }>,
  ) => {
    return submitQuizAttempt({ quizId, answers }).unwrap();
  };

  return {
    submitAttempt,
    isSubmitting: state.isLoading,
    error: state.error,
  };
};
