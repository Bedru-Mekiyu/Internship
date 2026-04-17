import { Request, Response } from 'express';
import { Discussion } from '../models/Discussion.model';
import { Enrollment } from '../models/Enrollment.model';
import { Course } from '../models/Course.model';
import { Notification } from '../models/Notification.model';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/http-error';
import { emitToUser } from '../utils/socket-notify';

const formatDiscussion = (discussion: any) => ({
  _id: discussion._id,
  courseId: discussion.courseId,
  title: discussion.title,
  content: discussion.content,
  createdAt: discussion.createdAt,
  user: {
    _id: discussion.userId?._id || discussion.userId,
    firstName: discussion.userId?.firstName,
    lastName: discussion.userId?.lastName,
  },
});

const ensureDiscussionAccess = async (courseId: string, user: Request['user']) => {
  if (!user?._id) {
    throw new AppError('Unauthorized', 401);
  }

  if (user.role === 'admin') {
    return;
  }

  const course = await Course.findById(courseId).select('instructor');
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (user.role === 'instructor' && course.instructor?.toString() === user._id.toString()) {
    return;
  }

  const enrollment = await Enrollment.findOne({ userId: user._id, courseId });
  if (!enrollment) {
    throw new AppError('Access denied', 403);
  }
};

export const getCourseDiscussions = asyncHandler(async (req: Request, res: Response) => {
  const courseId = String(req.params.courseId || '');
  if (!courseId) {
    throw new AppError('courseId is required', 400);
  }

  await ensureDiscussionAccess(courseId, req.user);

  const query = (req.query || {}) as Record<string, unknown>;
  const paginated = String(query.paginated || 'false').toLowerCase() === 'true';
  const page = Math.max(1, Number.parseInt(String(query.page || '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(query.limit || '25'), 10) || 25));

  if (!paginated) {
    const discussions = await Discussion.find({ courseId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'firstName lastName');

    return res.json(discussions.map(formatDiscussion).reverse());
  }

  const skip = (page - 1) * limit;
  const [total, discussions] = await Promise.all([
    Discussion.countDocuments({ courseId }),
    Discussion.find({ courseId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName'),
  ]);

  const items = discussions.map(formatDiscussion).reverse();
  const hasMore = skip + discussions.length < total;

  return res.json({
    items,
    meta: {
      page,
      limit,
      total,
      hasMore,
    },
  });
});

export const createDiscussionMessage = asyncHandler(async (req: Request, res: Response) => {
  const courseId = String(req.params.courseId || '');
  const { content, title } = req.body;

  if (!courseId) {
    throw new AppError('courseId is required', 400);
  }

  if (typeof content !== 'string' || !content.trim()) {
    throw new AppError('content is required', 400);
  }

  await ensureDiscussionAccess(courseId, req.user);

  const discussion = new Discussion({
    courseId,
    userId: req.user._id,
    title: typeof title === 'string' && title.trim() ? title.trim() : 'Discussion',
    content: content.trim(),
    replies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await discussion.save();

  const populated = await Discussion.findById(discussion._id)
    .populate('userId', 'firstName lastName');

  if (!populated) {
    throw new AppError('Discussion message not found after save', 500);
  }

  const payload = formatDiscussion(populated);

  const io = req.app.get('io');
  if (io && typeof io.to === 'function') {
    io.to(`course:${courseId}`).emit('discussion:new', payload);
  }

  const course = await Course.findById(courseId).select('instructor title');
  if (course?.instructor && course.instructor.toString() !== req.user._id.toString()) {
    const instructorNotif = await Notification.create({
      userId: course.instructor,
      type: 'discussion',
      title: 'New discussion message',
      message: `A new message was posted in ${course.title || 'your course discussion'}.`,
      isRead: false,
      createdAt: new Date(),
    });
    emitToUser(req.app, String(course.instructor), 'notification:new', {
      _id: instructorNotif._id,
      type: instructorNotif.type,
      title: instructorNotif.title,
      message: instructorNotif.message,
      isRead: instructorNotif.isRead,
      createdAt: instructorNotif.createdAt,
    });
  }

  return res.status(201).json(payload);
});
