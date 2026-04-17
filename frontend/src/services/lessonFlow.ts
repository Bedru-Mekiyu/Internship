export interface QuizQuestionOptionSet {
  options?: string[];
}

export const buildCourseLearnPath = (courseId?: string) => {
  return courseId ? `/courses/${courseId}/learn` : '/courses/bootcamp-2025/learn';
};

export const buildLessonQuizPath = (courseId?: string, lessonId?: string) => {
  if (courseId && lessonId) {
    return `/courses/${courseId}/lessons/${lessonId}/quiz`;
  }

  return '/courses/bootcamp-2025/quiz';
};

export const buildQuizAttemptAnswers = (
  selectedAnswers: Record<string, number | null>,
  quizQuestions: QuizQuestionOptionSet[]
) => {
  return Object.entries(selectedAnswers)
    .filter(([, optionIndex]) => typeof optionIndex === 'number')
    .map(([questionId, optionIndex]) => {
      const questionIndex = Number(questionId.replace('q', '')) - 1;
      const answerIndex = Number(optionIndex);
      const answer = quizQuestions[questionIndex]?.options?.[answerIndex] ?? null;

      return {
        questionIndex,
        answer,
      };
    })
    .filter((entry) => entry.questionIndex >= 0);
};