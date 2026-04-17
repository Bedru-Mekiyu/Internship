import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { getCourses } from '../src/controllers/course.controller';

jest.mock('../src/models/Course.model', () => ({
  Course: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

const { Course } = jest.requireMock('../src/models/Course.model') as {
  Course: {
    find: jest.Mock;
    countDocuments: jest.MockedFunction<(...args: unknown[]) => Promise<number>>;
  };
};

const mockCourseFind = Course.find as jest.Mock;
const mockCountDocuments = Course.countDocuments;

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

describe('Course controller status filters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
