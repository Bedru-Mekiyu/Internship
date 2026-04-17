import { Request, Response } from 'express';
import { getQuizzesByLesson, submitQuizAttempt } from '../src/controllers/quiz.controller';

jest.mock('../src/models/Lesson.model', () => ({
  Lesson: {
    findById: jest.fn(),
  },
}));

jest.mock('../src/models/Module.model', () => ({
  Module: {
    findById: jest.fn(),
  },
}));

jest.mock('../src/models/Course.model', () => ({
  Course: {
    findById: jest.fn(),
  },
}));

jest.mock('../src/models/Enrollment.model', () => ({
  Enrollment: {
    findOne: jest.fn(),
  },
}));

jest.mock('../src/models/Quiz.model', () => ({
  Quiz: {
    findById: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock('../src/models/QuizAttempt.model', () => ({
  QuizAttempt: {
    countDocuments: jest.fn(),
  },
}));

const { Lesson } = jest.requireMock('../src/models/Lesson.model') as { Lesson: { findById: jest.Mock } };
const { Module } = jest.requireMock('../src/models/Module.model') as { Module: { findById: jest.Mock } };
const { Course } = jest.requireMock('../src/models/Course.model') as { Course: { findById: jest.Mock } };
const { Enrollment } = jest.requireMock('../src/models/Enrollment.model') as { Enrollment: { findOne: jest.Mock } };
const { Quiz } = jest.requireMock('../src/models/Quiz.model') as { Quiz: { findById: jest.Mock; find: jest.Mock } };
const { QuizAttempt } = jest.requireMock('../src/models/QuizAttempt.model') as {
  QuizAttempt: { countDocuments: jest.Mock };
};

const createResponse = () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return response as unknown as Response;
};

describe('Quiz controller business rules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks student quiz access when not enrolled in the course', async () => {
    Lesson.findById.mockResolvedValue({ _id: 'lesson-1', moduleId: 'module-1' });
    Module.findById.mockResolvedValue({ _id: 'module-1', courseId: 'course-1' });
    Course.findById.mockResolvedValue({ _id: 'course-1' });
    Enrollment.findOne.mockResolvedValue(null);

    const request = {
      params: { lessonId: 'lesson-1' },
      user: { _id: 'student-1', role: 'student' },
    } as unknown as Request;

    const response = createResponse();

    await new Promise<void>((resolve) => {
      getQuizzesByLesson(request, response, (error: unknown) => {
        expect(error).toBeTruthy();
        expect((error as Error).message).toBe('Only enrolled students can access quizzes');
        resolve();
      });
    });
  });

  it('blocks quiz submission when max attempt count is reached', async () => {
    Quiz.findById.mockResolvedValue({
      _id: 'quiz-1',
      courseId: 'course-1',
      attempts: 1,
      questions: [{ points: 1, type: 'true-false', correctAnswer: true }],
      passingScore: 70,
    });
    Enrollment.findOne.mockResolvedValue({ _id: 'enrollment-1' });
    QuizAttempt.countDocuments.mockResolvedValue(1);

    const request = {
      params: { quizId: 'quiz-1' },
      body: { answers: [{ questionIndex: 0, answer: true }] },
      user: { _id: 'student-1', role: 'student' },
    } as unknown as Request;

    const response = createResponse();

    await new Promise<void>((resolve) => {
      submitQuizAttempt(request, response, (error: unknown) => {
        expect(error).toBeTruthy();
        expect((error as Error).message).toBe('Maximum quiz attempts reached');
        resolve();
      });
    });
  });
});
