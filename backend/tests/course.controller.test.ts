import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { getCourses, getCourseById, getCourseModules } from '../src/controllers/course.controller';

jest.mock('../src/models/Course.model', () => ({
  Course: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../src/models/Enrollment.model', () => ({
  Enrollment: {
    exists: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../src/models/Module.model', () => ({
  Module: {
    find: jest.fn(),
  },
}));

const { Course } = jest.requireMock('../src/models/Course.model') as {
  Course: {
    find: jest.Mock;
    countDocuments: jest.MockedFunction<(...args: unknown[]) => Promise<number>>;
    findById: jest.Mock;
    findOne: jest.Mock;
  };
};

const { Enrollment } = jest.requireMock('../src/models/Enrollment.model') as {
  Enrollment: {
    exists: jest.Mock;
    findOne: jest.Mock;
  };
};

const { Module } = jest.requireMock('../src/models/Module.model') as {
  Module: {
    find: jest.Mock;
  };
};

const mockCourseFind = Course.find as jest.Mock;
const mockCountDocuments = Course.countDocuments;
const mockCourseFindById = Course.findById as jest.Mock;
const mockCourseFindOne = Course.findOne as jest.Mock;
const mockEnrollmentExists = Enrollment.exists as unknown as jest.Mock;
const mockModuleFind = Module.find as unknown as jest.Mock;

const chainFindToPopulate = (payload: unknown[]) => ({
  sort: jest.fn().mockReturnValue({
    populate: jest.fn().mockImplementation(async () => payload),
  }),
});

const chainPaginated = (payload: unknown[]) => ({
  sort: jest.fn().mockReturnValue({
    skip: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        populate: jest.fn().mockImplementation(async () => payload),
      }),
    }),
  }),
});

const createResponse = () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return response as unknown as Response;
};

const createCourseDoc = (overrides: Record<string, unknown> = {}) => {
  const courseDoc = {
    _id: 'course-1',
    status: 'published',
    instructor: 'instructor-1',
    modules: [],
    populate: jest.fn(),
    toObject: jest.fn().mockReturnValue({
      _id: 'course-1',
      title: 'Published course',
      status: 'published',
      instructor: 'instructor-1',
      modules: [],
      ...overrides,
    }),
  };

  courseDoc.populate.mockImplementation(async () => courseDoc);
  return courseDoc;
};

const createModuleDoc = (overrides: Record<string, unknown> = {}) => ({
  _id: 'module-1',
  status: 'published',
  lessons: [],
  ...overrides,
  toObject: jest.fn().mockReturnValue({
    _id: 'module-1',
    title: 'Module 1',
    status: 'published',
    lessons: [],
    ...overrides,
  }),
});

describe('Course controller status filters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnrollmentExists.mockImplementation(async () => true);
  });

  it('blocks unauthenticated draft course filter requests', async () => {
    const request = {
      query: { status: 'draft' },
    } as unknown as Request;

    const response = createResponse();
    const next = jest.fn();

    getCourses(request, response, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Authentication is required for this course status filter' }),
    );
    expect(mockCourseFind).not.toHaveBeenCalled();
  });

  it('allows instructor draft filter and scopes to own courses by default', async () => {
    const payload = [{ _id: 'course-1', title: 'Draft by me' }];
    mockCourseFind.mockReturnValue(chainFindToPopulate(payload));

    const request = {
      query: { status: 'draft' },
      user: { _id: 'instructor-1', role: 'instructor' },
    } as unknown as Request;

    const response = createResponse();
    const next = jest.fn();

    getCourses(request, response, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(mockCourseFind).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'draft',
        instructor: 'instructor-1',
      }),
    );
    expect(response.json).toHaveBeenCalledWith(payload);
  });

  it('allows admin draft filter and supports explicit instructor filter', async () => {
    const payload = [{ _id: 'course-2', title: 'Draft by instructor-2' }];
    mockCourseFind.mockReturnValue(chainFindToPopulate(payload));

    const request = {
      query: { status: 'draft', instructor: 'instructor-2' },
      user: { _id: 'admin-1', role: 'admin' },
    } as unknown as Request;

    const response = createResponse();
    const next = jest.fn();

    getCourses(request, response, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(mockCourseFind).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'draft',
        instructor: 'instructor-2',
      }),
    );
    expect(response.json).toHaveBeenCalledWith(payload);
  });

  it('rejects student draft filter requests', async () => {
    const request = {
      query: { status: 'draft' },
      user: { _id: 'student-1', role: 'student' },
    } as unknown as Request;

    const response = createResponse();
    const next = jest.fn();

    getCourses(request, response, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Access denied' }));
    expect(mockCourseFind).not.toHaveBeenCalled();
  });

  it('returns paginated payload when paginated=true', async () => {
    const payload = [{ _id: 'course-p1' }];
    mockCountDocuments.mockResolvedValue(55);
    mockCourseFind.mockReturnValue(chainPaginated(payload));

    const request = {
      query: { paginated: 'true', page: '2', limit: '10' },
    } as unknown as Request;

    const response = createResponse();
    const next = jest.fn();

    getCourses(request, response, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(mockCountDocuments).toHaveBeenCalled();
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        items: payload,
        meta: expect.objectContaining({ page: 2, limit: 10, total: 55, hasMore: true }),
      }),
    );
  });
});

describe('Course controller nested visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnrollmentExists.mockImplementation(async () => true);
  });

  it('hides unpublished modules and lessons from enrolled students on published courses', async () => {
    const courseDoc = createCourseDoc({
      modules: [
        {
          _id: 'module-1',
          title: 'Published module',
          status: 'published',
          lessons: [
            { _id: 'lesson-1', title: 'Published lesson', status: 'published', order: 0, createdAt: '2024-01-01T00:00:00.000Z' },
            { _id: 'lesson-2', title: 'Draft lesson', status: 'draft', order: 1, createdAt: '2024-01-02T00:00:00.000Z' },
          ],
        },
        {
          _id: 'module-2',
          title: 'Draft module',
          status: 'draft',
          lessons: [
            { _id: 'lesson-3', title: 'Hidden lesson', status: 'published', order: 0, createdAt: '2024-01-03T00:00:00.000Z' },
          ],
        },
      ],
    });

    mockCourseFindById.mockReturnValue(courseDoc as never);

    const request = {
      params: { id: '507f191e810c19729de860ea' },
      user: { _id: 'student-1', role: 'student' },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn();

    getCourseById(request, response, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        modules: [
          expect.objectContaining({
            title: 'Published module',
            lessons: [
              expect.objectContaining({ title: 'Published lesson', status: 'published' }),
            ],
          }),
        ],
      }),
    );
  });

  it('hides unpublished modules and lessons from the modules endpoint', async () => {
    mockCourseFindById.mockReturnValue(
      createCourseDoc({
        status: 'published',
        title: 'Published course',
      }) as never,
    );

    mockModuleFind.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        populate: jest.fn().mockImplementation(async () => [
          createModuleDoc({
            title: 'Published module',
            lessons: [
              { _id: 'lesson-1', title: 'Published lesson', status: 'published', order: 0, createdAt: '2024-01-01T00:00:00.000Z' },
              { _id: 'lesson-2', title: 'Draft lesson', status: 'draft', order: 1, createdAt: '2024-01-02T00:00:00.000Z' },
            ],
          }),
          createModuleDoc({
            _id: 'module-2',
            title: 'Draft module',
            status: 'draft',
            lessons: [
              { _id: 'lesson-3', title: 'Hidden lesson', status: 'published', order: 0, createdAt: '2024-01-03T00:00:00.000Z' },
            ],
          }),
        ]),
      }),
    });

    const request = {
      params: { id: '507f191e810c19729de860ea' },
      user: { _id: 'student-1', role: 'student' },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn();

    getCourseModules(request, response, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(response.json).toHaveBeenCalledWith([
      expect.objectContaining({
        title: 'Published module',
        lessons: [
          expect.objectContaining({ title: 'Published lesson', status: 'published' }),
        ],
      }),
    ]);
  });
});
