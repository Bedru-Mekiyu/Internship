import { Request, Response } from 'express';
import {
  gradeAssignmentSubmission,
  getAssignmentAnalyticsByCourse,
  submitAssignment,
} from '../src/controllers/assignment.controller';

jest.mock('../src/models/Assignment.model', () => ({
  Assignment: {
    findById: jest.fn(),
    find: jest.fn(),
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
    countDocuments: jest.fn(),
  },
}));

jest.mock('../src/models/Submission.model', () => ({
  Submission: {
    findOne: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock('../src/models/Notification.model', () => ({
  Notification: {
    create: jest.fn(),
  },
}));

const { Assignment } = jest.requireMock('../src/models/Assignment.model') as {
  Assignment: { findById: jest.Mock; find: jest.Mock };
};
const { Course } = jest.requireMock('../src/models/Course.model') as {
  Course: { findById: jest.Mock };
};
const { Enrollment } = jest.requireMock('../src/models/Enrollment.model') as {
  Enrollment: { findOne: jest.Mock; countDocuments: jest.Mock };
};
const { Submission } = jest.requireMock('../src/models/Submission.model') as {
  Submission: { findOne: jest.Mock; find: jest.Mock };
};
const { Notification } = jest.requireMock('../src/models/Notification.model') as {
  Notification: { create: jest.Mock };
};

const createResponse = () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return response as unknown as Response;
};

describe('Assignment controller business rules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks submission when assignment deadline has passed', async () => {
    Assignment.findById.mockResolvedValue({
      _id: 'assignment-1',
      courseId: 'course-1',
      dueDate: new Date(Date.now() - 60_000),
    });

    const request = {
      params: { assignmentId: 'assignment-1' },
      body: { content: 'My submission' },
      user: { _id: 'student-1', role: 'student' },
    } as unknown as Request;

    const response = createResponse();

    await new Promise<void>((resolve) => {
      submitAssignment(request, response, (error: unknown) => {
        expect(error).toBeTruthy();
        expect((error as Error).message).toBe('Assignment deadline has passed');
        resolve();
      });
    });
  });

  it('blocks updates when an existing submission is already graded', async () => {
    Assignment.findById.mockResolvedValue({
      _id: 'assignment-1',
      courseId: 'course-1',
      dueDate: new Date(Date.now() + 60_000),
    });
    Enrollment.findOne.mockResolvedValue({ _id: 'enrollment-1' });
    Submission.findOne.mockResolvedValue({
      _id: 'submission-1',
      grade: 95,
      save: jest.fn(),
    });

    const request = {
      params: { assignmentId: 'assignment-1' },
      body: { content: 'Updated answer' },
      user: { _id: 'student-1', role: 'student' },
    } as unknown as Request;

    const response = createResponse();

    await new Promise<void>((resolve) => {
      submitAssignment(request, response, (error: unknown) => {
        expect(error).toBeTruthy();
        expect((error as Error).message).toBe('Cannot modify a graded submission');
        resolve();
      });
    });
  });

  it('returns assignment analytics with completion and average grade', async () => {
    Course.findById.mockResolvedValue({
      _id: 'course-1',
      instructor: { toString: () => 'instructor-1' },
    });
    Assignment.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        { _id: 'a1', title: 'Assignment 1' },
        { _id: 'a2', title: 'Assignment 2' },
      ]),
    });
    Enrollment.countDocuments.mockResolvedValue(2);
    Submission.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        { assignmentId: { toString: () => 'a1' }, grade: 80 },
        { assignmentId: { toString: () => 'a1' }, grade: 100 },
      ]),
    });

    const request = {
      params: { courseId: 'course-1' },
      user: { _id: { toString: () => 'instructor-1' }, role: 'instructor' },
    } as unknown as Request;

    const response = createResponse();

    await new Promise<void>((resolve) => {
      getAssignmentAnalyticsByCourse(request, response, (error: unknown) => {
        expect(error).toBeUndefined();
        resolve();
      });
      setImmediate(() => resolve());
    });

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        totalAssignments: 2,
        totalSubmissions: 2,
        gradedSubmissions: 2,
        averageGrade: 90,
        completionRate: 50,
      })
    );
  });

  it('notifies instructor when a student submits an assignment', async () => {
    Assignment.findById.mockResolvedValue({
      _id: 'assignment-1',
      courseId: 'course-1',
      title: 'Assignment 1',
      dueDate: new Date(Date.now() + 60_000),
    });
    Enrollment.findOne.mockResolvedValue({ _id: 'enrollment-1' });
    const saveSubmission = jest.fn().mockResolvedValue(undefined);
    Submission.findOne.mockResolvedValue({
      _id: 'submission-1',
      grade: undefined,
      save: saveSubmission,
    });
    Course.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'course-1',
        title: 'MERN Mastery',
        instructor: '507f191e810c19729de860ea',
      }),
    });

    const request = {
      params: { assignmentId: 'assignment-1' },
      body: { content: 'My answer' },
      user: { _id: '507f191e810c19729de860eb', role: 'student' },
    } as unknown as Request;

    const response = createResponse();

    await new Promise<void>((resolve) => {
      submitAssignment(request, response, (error: unknown) => {
        expect(error).toBeUndefined();
        resolve();
      });
      setImmediate(() => resolve());
    });

    expect(saveSubmission).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'assignment',
        title: 'New assignment submission',
      })
    );
  });

  it('creates a notification when instructor grades a submission', async () => {
    Assignment.findById.mockResolvedValue({
      _id: 'assignment-1',
      courseId: 'course-1',
      title: 'Assignment 1',
    });
    Course.findById.mockResolvedValue({
      _id: 'course-1',
      instructor: { toString: () => 'instructor-1' },
    });

    const savedSubmission = {
      _id: 'submission-1',
      userId: { _id: '507f191e810c19729de860ea', firstName: 'Student' },
      save: jest.fn().mockResolvedValue(undefined),
      grade: undefined,
      updatedAt: undefined,
    };

    Submission.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(savedSubmission),
    });

    const request = {
      params: { assignmentId: 'assignment-1', submissionId: 'submission-1' },
      body: { grade: 88 },
      user: { _id: { toString: () => 'instructor-1' }, role: 'instructor' },
    } as unknown as Request;

    const response = createResponse();

    await new Promise<void>((resolve) => {
      gradeAssignmentSubmission(request, response, (error: unknown) => {
        expect(error).toBeUndefined();
        resolve();
      });
      setImmediate(() => resolve());
    });

    expect(savedSubmission.save).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'assignment',
        title: 'Assignment graded',
        message: 'Your grade for Assignment 1 is 88.',
      })
    );
  });
});
