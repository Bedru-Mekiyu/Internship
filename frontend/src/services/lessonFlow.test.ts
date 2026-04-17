import { describe, expect, it } from 'vitest';
import {
  buildCourseLearnPath,
  buildLessonQuizPath,
  buildQuizAttemptAnswers,
} from './lessonFlow';

describe('lessonFlow helpers', () => {
  it('builds course learn path for known and fallback course ids', () => {
    expect(buildCourseLearnPath('course-123')).toBe('/courses/course-123/learn');
    expect(buildCourseLearnPath()).toBe('/courses/bootcamp-2025/learn');
  });

  it('builds lesson quiz path for known and fallback lesson paths', () => {
    expect(buildLessonQuizPath('course-123', 'lesson-7')).toBe('/courses/course-123/lessons/lesson-7/quiz');
    expect(buildLessonQuizPath()).toBe('/courses/bootcamp-2025/quiz');
  });

  it('maps selected answer indexes into backend quiz attempt payload', () => {
    const answers = buildQuizAttemptAnswers(
      {
        q1: 1,
        q2: null,
        q3: 0,
      },
      [
        { options: ['A', 'B'] },
        { options: ['C', 'D'] },
        { options: ['E', 'F'] },
      ]
    );

    expect(answers).toEqual([
      { questionIndex: 0, answer: 'B' },
      { questionIndex: 2, answer: 'E' },
    ]);
  });
});
