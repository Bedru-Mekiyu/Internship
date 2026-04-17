import { Request, Response } from 'express';
import { Enrollment } from '../models/Enrollment.model';
import { Course } from '../models/Course.model';
import { User } from '../models/User.model';
import { Content } from '../models/Content.model';
import { Certificate } from '../models/Certificate.model';
import { asyncHandler } from '../utils/async-handler';

export const getStudentDashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const enrollments = await Enrollment.find({ userId }).populate('courseId', 'title status');

  const totalCourses = enrollments.length;
  const averageProgress = totalCourses
    ? Math.round(enrollments.reduce((sum, item) => sum + (item.progress || 0), 0) / totalCourses)
    : 0;

  const completedCourses = enrollments.filter((item) => Number(item.progress || 0) >= 100).length;
  const certificatesEarned = userId ? await Certificate.countDocuments({ userId }) : 0;

  return res.json({
    totalCourses,
    averageProgress,
    completedCourses,
    certificatesEarned,
    enrolledCourses: enrollments.map((item: any) => ({
      courseId: item.courseId?._id,
      title: item.courseId?.title,
      status: item.status,
      progress: item.progress,
    })),
  });
});

export const getInstructorDashboard = asyncHandler(async (req: Request, res: Response) => {
  const courses = await Course.find({ instructor: req.user?._id }).select('title status enrollmentCount rating');
  const courseIds = courses.map((course) => course._id);

  const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
  const totalStudents = enrollments.length;
  const averageCompletionRate = enrollments.length
    ? Math.round(enrollments.reduce((sum, item) => sum + (item.progress || 0), 0) / enrollments.length)
    : 0;

  const averageRating = courses.length
    ? Number((courses.reduce((sum, course: any) => sum + (course.rating?.average || 0), 0) / courses.length).toFixed(2))
    : 0;

  return res.json({
    totalCourses: courses.length,
    totalStudents,
    averageCompletionRate,
    averageRating,
    courses,
  });
});

export const getAdminDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalCourses, totalEnrollments, totalContent, pendingCourseApprovals, pendingContentApprovals] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Content.countDocuments(),
    Course.countDocuments({ status: 'draft' }),
    Content.countDocuments({ status: 'draft' }),
  ]);

  return res.json({
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalContent,
    pendingApprovals: pendingCourseApprovals + pendingContentApprovals,
  });
});
