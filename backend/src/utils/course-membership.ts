import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';

/** Minimal user shape for access checks (Mongoose user doc or plain object). */
export type CourseAccessUser = {
  _id: string | { toString(): string };
  role: string;
};

/**
 * Whether the user may participate in course-scoped realtime (discussions) and equivalent HTTP APIs.
 * Mirrors discussion access: admin, course instructor, or enrolled learner.
 */
export async function userHasCourseDiscussionAccess(
  user: CourseAccessUser | undefined | null,
  courseId: string,
): Promise<boolean> {
  if (!user?._id || typeof courseId !== 'string' || !courseId.trim()) {
    return false;
  }

  const cid = courseId.trim();
  const userId = user._id.toString();

  if (user.role === 'admin') {
    return true;
  }

  const course = await Course.findById(cid).select('instructor');
  if (!course) {
    return false;
  }

  if (user.role === 'instructor' && course.instructor?.toString() === userId) {
    return true;
  }

  const enrollment = await Enrollment.findOne({ userId, courseId: cid });
  return Boolean(enrollment);
}
