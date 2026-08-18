import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Assignment } from '../models/Assignment.model';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { Notification } from '../models/Notification.model';
import { Submission } from '../models/Submission.model';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';
import { routeParam } from '../utils/route-params';

export const getAssignmentsByCourse = asyncHandler(async (req: Request, res: Response) => {
  const courseId = routeParam(req.params.courseId);
  const course = await Course.findById(courseId).select('instructor');
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (req.user?.role === 'student') {
    const enrollment = await Enrollment.findOne({ userId: req.user?._id, courseId });
    if (!enrollment) {
      throw new AppError('Only enrolled students can view assignments', 403);
    }
  } else if (req.user?.role === 'instructor') {
    if (!course.instructor || course.instructor.toString() !== req.user?._id.toString()) {
      throw new AppError('Not authorized', 403);
    }
  } else if (req.user?.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  const assignments = await Assignment.find({ courseId }).sort({ createdAt: -1 });
  return res.json(assignments);
});

export const createAssignment = asyncHandler(async (req: Request, res: Response) => {
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

  const assignment = new Assignment({
    courseId,
    moduleId: req.body.moduleId,
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await assignment.save();
  return res.status(201).json(assignment);
});

export const submitAssignment = asyncHandler(async (req: Request, res: Response) => {
  const assignmentId = routeParam(req.params.assignmentId);
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  if (assignment.dueDate && new Date(assignment.dueDate).getTime() < Date.now()) {
    throw new AppError('Assignment deadline has passed', 400);
  }

  const enrollment = await Enrollment.findOne({
    userId: req.user?._id,
    courseId: assignment.courseId,
  });

  if (!enrollment) {
    throw new AppError('Only enrolled students can submit assignments', 403);
  }

  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  if (!content) {
    throw new AppError('content is required', 400);
  }

  let submission = await Submission.findOne({
    assignmentId,
    userId: req.user?._id,
  });

  if (submission) {
    if (typeof submission.grade === 'number') {
      throw new AppError('Cannot modify a graded submission', 400);
    }

    submission.content = content;
    submission.submittedAt = new Date();
    submission.updatedAt = new Date();
    await submission.save();
  } else {
    submission = new Submission({
      assignmentId,
      userId: req.user?._id,
      content,
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await submission.save();
  }

  const courseForNotify = await Course.findById(assignment.courseId).select('instructor title');
  if (courseForNotify?.instructor && courseForNotify.instructor.toString() !== req.user?._id.toString()) {
    await Notification.create({
      userId: courseForNotify.instructor,
      type: 'assignment',
      title: 'New assignment submission',
      message: `A student submitted work for ${assignment.title || 'your assignment'} in ${courseForNotify.title || 'your course'}.`,
      isRead: false,
      createdAt: new Date(),
    });
  }

  return res.status(201).json(submission);
});

export const getMySubmissionsByCourse = asyncHandler(async (req: Request, res: Response) => {
  const courseId = routeParam(req.params.courseId);
  const assignments = await Assignment.find({ courseId }).select('_id');
  const assignmentIds = assignments.map((assignment) => assignment._id);

  const submissions = await Submission.find({
    userId: req.user?._id,
    assignmentId: { $in: assignmentIds },
  }).sort({ submittedAt: -1 });

  return res.json(submissions);
});

export const getAssignmentAnalyticsByCourse = asyncHandler(async (req: Request, res: Response) => {
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

  const assignments = await Assignment.find({ courseId }).select('_id title');
  const assignmentIds = assignments.map((assignment) => assignment._id);

  const [enrollmentCount, submissions] = await Promise.all([
    Enrollment.countDocuments({ courseId }),
    Submission.find({ assignmentId: { $in: assignmentIds } }).select('assignmentId grade'),
  ]);

  const totalAssignments = assignments.length;
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter((submission) => typeof submission.grade === 'number');
  const averageGrade = gradedSubmissions.length
    ? Number(
      (
        gradedSubmissions.reduce((sum, submission) => sum + Number(submission.grade || 0), 0)
        / gradedSubmissions.length
      ).toFixed(2)
    )
    : 0;

  const completionRate = enrollmentCount > 0 && totalAssignments > 0
    ? Number(((totalSubmissions / (enrollmentCount * totalAssignments)) * 100).toFixed(2))
    : 0;

  const submissionCounts = new Map<string, number>();
  for (const submission of submissions) {
    const key = submission.assignmentId.toString();
    submissionCounts.set(key, (submissionCounts.get(key) || 0) + 1);
  }

  const submissionsByAssignment = assignments.map((assignment) => {
    const total = submissionCounts.get(assignment._id.toString()) || 0;

    return {
      assignmentId: assignment._id,
      title: assignment.title,
      submissions: total,
    };
  });

  return res.json({
    totalAssignments,
    totalSubmissions,
    gradedSubmissions: gradedSubmissions.length,
    averageGrade,
    completionRate,
    submissionsByAssignment,
  });
});

export const getAssignmentSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const assignmentId = routeParam(req.params.assignmentId);
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  const course = await Course.findById(assignment.courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (!course.instructor) {
    throw new AppError('Invalid course instructor', 400);
  }

  if (req.user?.role !== 'admin' && course.instructor.toString() !== req.user?._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  const submissions = await Submission.find({ assignmentId })
    .populate('userId', 'firstName lastName email')
    .sort({ submittedAt: -1 });

  return res.json(submissions);
});

export const gradeAssignmentSubmission = asyncHandler(async (req: Request, res: Response) => {
  const assignmentId = routeParam(req.params.assignmentId);
  const submissionId = routeParam(req.params.submissionId);
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  const course = await Course.findById(assignment.courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (!course.instructor) {
    throw new AppError('Invalid course instructor', 400);
  }

  if (req.user?.role !== 'admin' && course.instructor.toString() !== req.user?._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  const submission = await Submission.findOne({
    _id: submissionId,
    assignmentId,
  }).populate('userId', 'firstName lastName email');

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  submission.grade = Number(req.body.grade);
  submission.updatedAt = new Date();
  await submission.save();

  const submissionUserValue = submission.userId as unknown;
  const submissionUserId =
    typeof submissionUserValue === 'string'
      ? submissionUserValue
      : (submissionUserValue as { _id?: unknown })?._id;

  if (submissionUserId) {
    const normalizedUserId = mongoose.Types.ObjectId.isValid(String(submissionUserId))
      ? new mongoose.Types.ObjectId(String(submissionUserId))
      : null;

    if (!normalizedUserId) {
      return res.json(submission);
    }

    const assignmentTitle = assignment.title || 'your assignment';
    await Notification.create({
      userId: normalizedUserId,
      type: 'assignment',
      title: 'Assignment graded',
      message: `Your grade for ${assignmentTitle} is ${submission.grade}.`,
      isRead: false,
      createdAt: new Date(),
    });
  }

  return res.json(submission);
});
