import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { getCourseDiscussions } from '../src/controllers/discussion.controller';

jest.mock('../src/models/Discussion.model', () => ({
  Discussion: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.mock('../src/models/Enrollment.model', () => ({
  Enrollment: {
    findOne: jest.fn(),
  },
}));

jest.mock('../src/models/Course.model', () => ({
  Course: {
    findById: jest.fn(),
  },
}));

const { Discussion } = jest.requireMock('../src/models/Discussion.model') as {
  Discussion: { find: jest.Mock; countDocuments: jest.Mock };
};

const { Enrollment } = jest.requireMock('../src/models/Enrollment.model') as {
  Enrollment: { findOne: jest.Mock };
};

const { Course } = jest.requireMock('../src/models/Course.model') as {
  Course: { findById: jest.Mock };
};

const mockDiscussionFind = Discussion.find as jest.Mock;
const mockDiscussionCountDocuments = Discussion.countDocuments as jest.Mock;
const mockEnrollmentFindOne = Enrollment.findOne as jest.Mock;
const mockCourseFindById = Course.findById as jest.Mock;

const createResponse = () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return response as unknown as Response;
};

describe('Discussion controller authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks student discussion access when not enrolled', async () => {
    mockCourseFindById.mockReturnValue({
      select: () => Promise.resolve({
        instructor: { toString: () => 'instructor-1' },
      }),
    });
    mockEnrollmentFindOne.mockReturnValue(Promise.resolve(null));

    const request = {
      params: { courseId: 'course-1' },
      user: { _id: 'student-1', role: 'student' },
    } as unknown as Request;

    const response = createResponse();

    await new Promise<void>((resolve, reject) => {
      getCourseDiscussions(request, response, (error: unknown) => {
        try {
          expect(error).toBeTruthy();
          expect((error as Error).message).toBe('Access denied');
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('returns discussions for enrolled student', async () => {
    mockCourseFindById.mockReturnValue({
      select: () => Promise.resolve({
        instructor: { toString: () => 'instructor-1' },
      }),
    });
    mockEnrollmentFindOne.mockReturnValue(Promise.resolve({ _id: 'enrollment-1' }));
    mockDiscussionFind.mockReturnValue({
      sort: () => ({
        limit: () => ({
          populate: () => Promise.resolve([
            {
              _id: 'discussion-1',
              courseId: 'course-1',
              title: 'Discussion',
              content: 'Welcome',
              createdAt: new Date('2026-01-01T10:00:00Z'),
              userId: { _id: 'student-1', firstName: 'Student', lastName: 'One' },
            },
          ]),
        }),
      }),
    });

    const request = {
      params: { courseId: 'course-1' },
      user: { _id: 'student-1', role: 'student' },
    } as unknown as Request;

    const response = createResponse();

    getCourseDiscussions(request, response, jest.fn());
    await new Promise((resolve) => setImmediate(resolve));

    expect(response.json).toHaveBeenCalledWith([
      expect.objectContaining({
        _id: 'discussion-1',
        courseId: 'course-1',
        content: 'Welcome',
      }),
    ]);
  });

  it('returns paginated discussions payload when paginated=true', async () => {
    mockCourseFindById.mockReturnValue({
      select: () => Promise.resolve({
        instructor: { toString: () => 'instructor-1' },
      }),
    });
    mockEnrollmentFindOne.mockReturnValue(Promise.resolve({ _id: 'enrollment-1' }));
    (mockDiscussionCountDocuments as jest.Mock).mockImplementation(() => Promise.resolve(35));

    const populate = jest.fn(() => Promise.resolve([
      {
        _id: 'discussion-2',
        courseId: 'course-1',
        title: 'Discussion',
        content: 'Second',
        createdAt: new Date('2026-01-01T10:05:00Z'),
        userId: { _id: 'student-1', firstName: 'Student', lastName: 'Two' },
      },
      {
        _id: 'discussion-1',
        courseId: 'course-1',
        title: 'Discussion',
        content: 'First',
        createdAt: new Date('2026-01-01T10:00:00Z'),
        userId: { _id: 'student-1', firstName: 'Student', lastName: 'One' },
      },
    ]));

    const limit = jest.fn((_limit: number) => ({ populate }));
    const skip = jest.fn((_skip: number) => ({ limit }));
    const sort = jest.fn(() => ({ skip }));
    mockDiscussionFind.mockReturnValue({ sort });

    const request = {
      params: { courseId: 'course-1' },
      query: { paginated: 'true', page: '2', limit: '10' },
      user: { _id: 'student-1', role: 'student' },
    } as unknown as Request;

    const response = createResponse();

    getCourseDiscussions(request, response, jest.fn());
    await new Promise((resolve) => setImmediate(resolve));

    expect(skip).toHaveBeenCalledWith(10);
    expect(limit).toHaveBeenCalledWith(10);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({ _id: 'discussion-1', content: 'First' }),
          expect.objectContaining({ _id: 'discussion-2', content: 'Second' }),
        ],
        meta: {
          page: 2,
          limit: 10,
          total: 35,
          hasMore: true,
        },
      })
    );
  });
});
