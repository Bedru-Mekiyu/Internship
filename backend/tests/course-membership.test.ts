import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../src/models/Course.model', () => ({
  Course: { findById: jest.fn() },
}));

jest.mock('../src/models/Enrollment.model', () => ({
  Enrollment: { findOne: jest.fn() },
}));

import { Course } from '../src/models/Course.model';
import { Enrollment } from '../src/models/Enrollment.model';
import { userHasCourseDiscussionAccess } from '../src/utils/course-membership';

describe('userHasCourseDiscussionAccess', () => {
  const userId = { toString: () => 'user-1' };
  const learner = { _id: userId, role: 'student' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns false for invalid inputs', async () => {
    await expect(userHasCourseDiscussionAccess(null, 'course-1')).resolves.toBe(false);
    await expect(userHasCourseDiscussionAccess(learner, '  ')).resolves.toBe(false);
    expect((Course.findById as jest.Mock)).not.toHaveBeenCalled();
    expect((Enrollment.findOne as jest.Mock)).not.toHaveBeenCalled();
  });

  it('returns true for admin without querying course or enrollment', async () => {
    const admin = { _id: userId, role: 'admin' };
    await expect(userHasCourseDiscussionAccess(admin, 'course-1')).resolves.toBe(true);
    expect((Course.findById as jest.Mock)).not.toHaveBeenCalled();
    expect((Enrollment.findOne as jest.Mock)).not.toHaveBeenCalled();
  });

  it('returns false when course cannot be found', async () => {
    (Course.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockImplementation(async () => null),
    });

    await expect(userHasCourseDiscussionAccess(learner, 'course-1')).resolves.toBe(false);
    expect((Enrollment.findOne as jest.Mock)).not.toHaveBeenCalled();
  });

  it('returns true for the course instructor', async () => {
    (Course.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockImplementation(async () => ({ instructor: { toString: () => 'user-1' } })),
    });

    const instructor = { _id: userId, role: 'instructor' };
    await expect(userHasCourseDiscussionAccess(instructor, 'course-1')).resolves.toBe(true);
    expect((Enrollment.findOne as jest.Mock)).not.toHaveBeenCalled();
  });

  it('checks enrollment for non-admin and non-instructor users', async () => {
    (Course.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockImplementation(async () => ({ instructor: { toString: () => 'teacher-1' } })),
    });
    (Enrollment.findOne as jest.Mock).mockImplementation(async () => ({ _id: 'enrollment-1' }));

    await expect(userHasCourseDiscussionAccess(learner, '  course-1  ')).resolves.toBe(true);
    expect(Enrollment.findOne).toHaveBeenCalledWith({ userId, courseId: 'course-1' });
  });

  it('returns false when enrollment is missing', async () => {
    (Course.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockImplementation(async () => ({ instructor: { toString: () => 'teacher-1' } })),
    });
    (Enrollment.findOne as jest.Mock).mockImplementation(async () => null);

    await expect(userHasCourseDiscussionAccess(learner, 'course-1')).resolves.toBe(false);
  });
});
