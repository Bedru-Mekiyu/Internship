import { Request, Response } from 'express';
import { enrollCourse, updateCourseProgress } from '../src/controllers/course.controller';

jest.mock('../src/models/Course.model', () => ({
  Course: {
    findById: jest.fn(),
  },
}));

jest.mock('../src/models/Enrollment.model', () => ({
  Enrollment: jest.fn().mockImplementation((payload) => ({
    ...payload,
    _id: 'enrollment-1',
    completedLessons: [],
    status: 'enrolled',
    progress: 0,
    enrolledAt: new Date('2026-01-01T00:00:00Z'),
    save: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../src/models/Module.model', () => ({
  Module: {
    find: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock('../src/models/Lesson.model', () => ({
  Lesson: {
    findById: jest.fn(),
  },
}));

jest.mock('../src/models/Notification.model', () => ({
  Notification: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../src/models/Payment.model', () => ({
  Payment: {
    findOne: jest.fn(),
  },
}));

const { Course } = jest.requireMock('../src/models/Course.model') as {
  Course: { findById: jest.Mock };
};
const { Enrollment } = jest.requireMock('../src/models/Enrollment.model') as {
  Enrollment: jest.Mock & { findOne: jest.Mock };
};
const { Notification } = jest.requireMock('../src/models/Notification.model') as {
  Notification: { create: jest.Mock; findOne: jest.Mock };
};

const createResponse = () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return response as unknown as Response;
};

describe('Course controller notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates enrollment notification for newly enrolled user', async () => {
    const courseSave = jest.fn().mockResolvedValue(undefined);
    Course.findById.mockResolvedValue({
      _id: 'course-1',
      title: 'MERN Mastery',
      status: 'published',
      pricing: { amount: 0, type: 'free' },
      enrollmentCount: 0,
      save: courseSave,
    });

    Enrollment.findOne = jest.fn().mockResolvedValue(null);

    const request = {
      params: { id: 'course-1' },
      user: { _id: '507f191e810c19729de860ea', role: 'student' },
    } as unknown as Request;

    const response = createResponse();
    const next = jest.fn();

    enrollCourse(request, response, next);
    await new Promise<void>((r) => setImmediate(r));

    expect(next).not.toHaveBeenCalled();
    expect(courseSave).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Enrollment successful',
        type: 'enrollment',
      })
    );
  });

  it('creates completion notification when progress reaches 100', async () => {
    const enrollmentSave = jest.fn().mockResolvedValue(undefined);
    Course.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'course-1',
        title: 'MERN Mastery',
      }),
    });

    Enrollment.findOne = jest.fn().mockResolvedValue({
      _id: 'enrollment-1',
      courseId: 'course-1',
      status: 'enrolled',
      progress: 90,
      enrolledAt: new Date('2026-01-01T00:00:00Z'),
      completedLessons: [],
      save: enrollmentSave,
    });

    Notification.findOne.mockResolvedValue(null);

    const request = {
      params: { id: 'course-1' },
      body: { progress: 100 },
      user: { _id: '507f191e810c19729de860ea', role: 'student' },
    } as unknown as Request;

    const response = createResponse();
    const next = jest.fn();

    updateCourseProgress(request, response, next);
    await new Promise<void>((r) => setImmediate(r));

    expect(next).not.toHaveBeenCalled();
    expect(enrollmentSave).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Course completed',
        type: 'enrollment',
      })
    );
  });

  it('rejects invalid progress values outside 0-100', async () => {
    Course.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'course-1', title: 'MERN Mastery' }),
    });

    Enrollment.findOne = jest.fn().mockResolvedValue({
      _id: 'enrollment-1',
      courseId: 'course-1',
      status: 'enrolled',
      progress: 20,
      enrolledAt: new Date('2026-01-01T00:00:00Z'),
      completedLessons: [],
      save: jest.fn().mockResolvedValue(undefined),
    });

    const request = {
      params: { id: 'course-1' },
      body: { progress: 120 },
      user: { _id: '507f191e810c19729de860ea', role: 'student' },
    } as unknown as Request;

    const response = createResponse();

    await new Promise<void>((resolve) => {
      updateCourseProgress(request, response, (error: unknown) => {
        expect(error).toBeTruthy();
        expect((error as Error).message).toBe('progress must be a number between 0 and 100');
        resolve();
      });
    });
  });
});
