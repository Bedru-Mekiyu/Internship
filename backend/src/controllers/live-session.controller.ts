import { Request, Response } from 'express';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { LiveSession } from '../models/LiveSession.model';
import { Notification } from '../models/Notification.model';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';
import { routeParam } from '../utils/route-params';

const notifyEnrolledStudents = async (
  courseId: string,
  title: string,
  message: string
) => {
  const enrollments = await Enrollment.find({ courseId }).select('userId').lean();
  const uniqueUserIds = Array.from(new Set(
    enrollments
      .map((enrollment: any) => String(enrollment.userId || ''))
      .filter(Boolean)
  ));

  if (uniqueUserIds.length === 0) {
    return;
  }

  const docs = uniqueUserIds.map((userId) => ({
    userId,
    type: 'system' as const,
    title,
    message,
    isRead: false,
    createdAt: new Date(),
  }));

  await Notification.insertMany(docs, { ordered: false });
};

export const getLiveSessionsByCourse = asyncHandler(async (req: Request, res: Response) => {
  const courseId = routeParam(req.params.courseId);

  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (req.user?.role === 'student') {
    const enrollment = await Enrollment.findOne({ userId: req.user?._id, courseId });
    if (!enrollment) {
      throw new AppError('Only enrolled students can view live sessions', 403);
    }
  } else if (req.user?.role === 'instructor') {
    if (!course.instructor || course.instructor.toString() !== req.user?._id.toString()) {
      throw new AppError('Not authorized', 403);
    }
  } else if (req.user?.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  const sessions = await LiveSession.find({ courseId }).sort({ startsAt: 1 });
  return res.json(sessions);
});

export const createLiveSession = asyncHandler(async (req: Request, res: Response) => {
  const courseId = routeParam(req.params.courseId);
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (!course.instructor) {
    throw new AppError('Invalid course instructor', 400);
  }

  if (req.user?.role !== 'admin' && course.instructor.toString() !== req.user?._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  const startsAt = new Date(req.body.startsAt);
  const endsAt = req.body.endsAt ? new Date(req.body.endsAt) : undefined;
  if (endsAt && endsAt.getTime() < startsAt.getTime()) {
    throw new AppError('endsAt must be greater than or equal to startsAt', 400);
  }

  const session = new LiveSession({
    courseId,
    instructorId: req.user?._id,
    title: req.body.title,
    description: req.body.description,
    provider: req.body.provider,
    meetingUrl: req.body.meetingUrl,
    startsAt,
    endsAt,
    status: req.body.status || 'scheduled',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await session.save();

  await notifyEnrolledStudents(
    String(courseId),
    'New live session scheduled',
    `A new live session (${session.title}) has been scheduled for this course.`
  );

  return res.status(201).json(session);
});

export const updateLiveSessionStatus = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = routeParam(req.params.sessionId);
  const session = await LiveSession.findById(sessionId);
  if (!session) {
    throw new AppError('Live session not found', 404);
  }

  const course = await Course.findById(session.courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (!course.instructor) {
    throw new AppError('Invalid course instructor', 400);
  }

  if (req.user?.role !== 'admin' && course.instructor.toString() !== req.user?._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  session.status = req.body.status;
  session.updatedAt = new Date();
  await session.save();

  if (session.status === 'live' || session.status === 'cancelled' || session.status === 'completed') {
    const statusLabel = session.status.charAt(0).toUpperCase() + session.status.slice(1);
    await notifyEnrolledStudents(
      String(session.courseId),
      `Live session ${statusLabel.toLowerCase()}`,
      `Live session (${session.title}) status changed to ${statusLabel}.`
    );
  }

  return res.json(session);
});
