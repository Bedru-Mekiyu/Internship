import { Request, Response } from 'express';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { Lesson } from '../models/Lesson.model';
import { Module } from '../models/Module.model';
import { Quiz } from '../models/Quiz.model';
import { QuizAttempt } from '../models/QuizAttempt.model';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';
import { routeParam } from '../utils/route-params';

type QuizAnswerPayload = {
  questionIndex: number;
  answer: unknown;
};

const normalizeAnswer = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return [...value].map((item) => String(item).trim()).sort();
  }

  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return value;
  }

  return value;
};

export const createQuiz = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = routeParam(req.params.lessonId);
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  const moduleModel = await Module.findById(lesson.moduleId);
  if (!moduleModel) {
    throw new AppError('Module not found', 404);
  }

  const course = await Course.findById(moduleModel.courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (!course.instructor) {
    throw new AppError('Invalid course instructor', 400);
  }

  if (req.user?.role !== 'admin' && course.instructor.toString() !== req.user?._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  const quiz = new Quiz({
    courseId: course._id,
    lessonId,
    title: req.body.title,
    description: req.body.description,
    questions: req.body.questions,
    timeLimit: req.body.timeLimit,
    attempts: req.body.attempts,
    passingScore: req.body.passingScore,
    isPublished: req.body.isPublished ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await quiz.save();
  return res.status(201).json(quiz);
});

export const getQuizzesByLesson = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = routeParam(req.params.lessonId);
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  const moduleModel = await Module.findById(lesson.moduleId);
  if (!moduleModel) {
    throw new AppError('Module not found', 404);
  }

  const course = await Course.findById(moduleModel.courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (req.user?.role === 'student') {
    const enrollment = await Enrollment.findOne({ userId: req.user?._id, courseId: course._id });
    if (!enrollment) {
      throw new AppError('Only enrolled students can access quizzes', 403);
    }
  } else if (req.user?.role === 'instructor') {
    if (!course.instructor || course.instructor.toString() !== req.user?._id.toString()) {
      throw new AppError('Not authorized', 403);
    }
  } else if (req.user?.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  const filter: Record<string, unknown> = { lessonId };
  if (req.user?.role === 'student') {
    filter.isPublished = true;
  }

  const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
  return res.json(quizzes);
});

export const submitQuizAttempt = asyncHandler(async (req: Request, res: Response) => {
  const quizId = routeParam(req.params.quizId);
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new AppError('Quiz not found', 404);
  }

  const enrollment = await Enrollment.findOne({ userId: req.user?._id, courseId: quiz.courseId });
  if (!enrollment) {
    throw new AppError('Only enrolled students can submit quiz attempts', 403);
  }

  const existingAttempts = await QuizAttempt.countDocuments({ quizId, userId: req.user?._id });
  if (existingAttempts >= Number(quiz.attempts || 1)) {
    throw new AppError('Maximum quiz attempts reached', 400);
  }

  const answerPayload = (req.body.answers || []) as QuizAnswerPayload[];
  const answers = answerPayload.map((entry) => {
    const question = (quiz.questions || [])[entry.questionIndex] as any;
    if (!question) {
      return {
        questionIndex: entry.questionIndex,
        answer: entry.answer,
        isCorrect: false,
        pointsAwarded: 0,
      };
    }

    const shouldAutoGrade = question.type === 'multiple-choice' || question.type === 'true-false';

    if (!shouldAutoGrade) {
      return {
        questionIndex: entry.questionIndex,
        answer: entry.answer,
        isCorrect: undefined,
        pointsAwarded: 0,
      };
    }

    const given = normalizeAnswer(entry.answer);
    const expected = normalizeAnswer(question.correctAnswer);
    const isCorrect = JSON.stringify(given) === JSON.stringify(expected);

    return {
      questionIndex: entry.questionIndex,
      answer: entry.answer,
      isCorrect,
      pointsAwarded: isCorrect ? Number(question.points || 1) : 0,
    };
  });

  const totalPoints = (quiz.questions || []).reduce((sum: number, item: any) => sum + Number(item.points || 1), 0);
  const score = answers.reduce((sum, item) => sum + Number(item.pointsAwarded || 0), 0);
  const percentage = totalPoints > 0 ? Number(((score / totalPoints) * 100).toFixed(2)) : 0;

  const attempt = new QuizAttempt({
    quizId,
    userId: req.user?._id,
    answers,
    score,
    percentage,
    passed: percentage >= Number(quiz.passingScore || 70),
    submittedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await attempt.save();

  return res.status(201).json(attempt);
});

export const getMyQuizAttempts = asyncHandler(async (req: Request, res: Response) => {
  const quizId = routeParam(req.params.quizId);
  const attempts = await QuizAttempt.find({ quizId, userId: req.user?._id }).sort({ submittedAt: -1 });
  return res.json(attempts);
});

export const getQuizAttemptsForInstructor = asyncHandler(async (req: Request, res: Response) => {
  const quizId = routeParam(req.params.quizId);
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new AppError('Quiz not found', 404);
  }

  const course = await Course.findById(quiz.courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (!course.instructor) {
    throw new AppError('Invalid course instructor', 400);
  }

  if (req.user?.role !== 'admin' && course.instructor.toString() !== req.user?._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  const attempts = await QuizAttempt.find({ quizId })
    .populate('userId', 'firstName lastName email')
    .sort({ submittedAt: -1 });

  return res.json(attempts);
});
