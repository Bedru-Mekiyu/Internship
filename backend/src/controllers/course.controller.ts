import { Request, Response } from 'express';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';

export const getCourses = asyncHandler(async (_req: Request, res: Response) => {
  const courses = await Course.find({ status: 'published' }).populate('instructor');
  return res.json(courses);
});

export const getCourseById = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.id).populate('instructor modules');
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  return res.json(course);
});

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = new Course({ ...req.body, instructor: req.user?._id });
  await course.save();
  return res.status(201).json(course);
});

export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (!course.instructor) {
    throw new AppError('Invalid course instructor', 400);
  }

  if (req.user?.role !== 'admin' && course.instructor.toString() !== req.user?._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  return res.json(updated);
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (!course.instructor) {
    throw new AppError('Invalid course instructor', 400);
  }

  if (req.user?.role !== 'admin' && course.instructor.toString() !== req.user?._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  await Course.findByIdAndDelete(req.params.id);
  return res.json({ message: 'Deleted' });
});

export const enrollCourse = asyncHandler(async (req: Request, res: Response) => {
  const enrollment = new Enrollment({ userId: req.user?._id, courseId: req.params.id });
  await enrollment.save();
  return res.json({ message: 'Enrolled' });
});

export const getCourseProgress = asyncHandler(async (req: Request, res: Response) => {
  const enrollment = await Enrollment.findOne({ userId: req.user?._id, courseId: req.params.id });
  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  return res.json({
    courseId: enrollment.courseId,
    progress: enrollment.progress,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
  });
});

export const createCourseReview = asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const enrollment = await Enrollment.findOne({ userId: req.user?._id, courseId: req.params.id });
  if (!enrollment) {
    throw new AppError('Only enrolled students can review this course', 403);
  }

  const reviews = Array.isArray((course as any).reviews) ? (course as any).reviews : [];
  const userIdString = req.user?._id?.toString();
  const existingReview = reviews.find((item: any) => item.user?.toString() === userIdString);

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment || '';
    existingReview.updatedAt = new Date();
  } else {
    reviews.push({
      user: req.user?._id,
      rating,
      comment: comment || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const totalRatings = reviews.reduce((sum: number, item: any) => sum + Number(item.rating || 0), 0);
  course.set('reviews', reviews);
  course.set('rating', {
    average: reviews.length ? Number((totalRatings / reviews.length).toFixed(2)) : 0,
    count: reviews.length,
  });
  course.set('updatedAt', new Date());
  await course.save();

  return res.status(201).json({
    message: existingReview ? 'Review updated' : 'Review submitted',
    rating: course.get('rating'),
  });
});