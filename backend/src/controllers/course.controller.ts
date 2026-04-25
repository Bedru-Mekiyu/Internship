import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { Module } from '../models/Module.model';
import { Lesson } from '../models/Lesson.model';
import { Notification } from '../models/Notification.model';
import { Payment } from '../models/Payment.model';
import { User } from '../models/User.model';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';
import {
  assertPublishedForPublicEnrollment,
  courseRequiresCompletedPayment,
} from '../utils/course-enrollment';
import { routeParam } from '../utils/route-params';
import { safeRegexFragment } from '../utils/safe-regex';
import {
  bumpCourseCatalogCacheVersion,
  getCachedCourseListJson,
  setCachedCourseListJson,
} from '../services/cache.service';

const publicInstructorSelect = 'firstName lastName avatar bio role';

const ensureCourseCompletionNotification = async (userId: string, courseTitle: string) => {
  const title = 'Course completed';
  const message = `Congratulations! You completed ${courseTitle}.`;

  const existing = await Notification.findOne({ userId, title, message });
  if (existing) {
    return;
  }

  await Notification.create({
    userId,
    type: 'enrollment',
    title,
    message,
    isRead: false,
    createdAt: new Date(),
  });
};

const ensureOwnedCourse = async (courseId: string, user: Request['user']) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (!course.instructor) {
    throw new AppError('Invalid course instructor', 400);
  }

  if (!user?._id) {
    throw new AppError('No token provided', 401);
  }

  if (user.role !== 'admin' && course.instructor.toString() !== user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  return course;
};

const ensureOwnedModule = async (moduleId: string, user: Request['user']) => {
  const moduleItem = await Module.findById(moduleId);
  if (!moduleItem) {
    throw new AppError('Module not found', 404);
  }

  const course = await ensureOwnedCourse(String(moduleItem.courseId), user);
  return { course, moduleItem };
};

const ensureOwnedLesson = async (moduleId: string, lessonId: string, user: Request['user']) => {
  const { course, moduleItem } = await ensureOwnedModule(moduleId, user);
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  if (lesson.moduleId.toString() !== moduleItem._id.toString()) {
    throw new AppError('Lesson does not belong to this module', 400);
  }

  return { course, moduleItem, lesson };
};

/** Published courses are public; draft/archived require admin, owning instructor, or enrollment. */
const ensureCourseDetailAccess = async (course: InstanceType<typeof Course>, user: Request['user'] | undefined) => {
  if (course.status === 'published') {
    return;
  }

  if (!user?._id) {
    throw new AppError('Course not found', 404);
  }

  if (user.role === 'admin') {
    return;
  }

  const instructorId = course.instructor ? course.instructor.toString() : '';
  if (user.role === 'instructor' && instructorId === user._id.toString()) {
    return;
  }

  const enrolled = await Enrollment.exists({ userId: user._id, courseId: course._id });
  if (enrolled) {
    return;
  }

  throw new AppError('Course not found', 404);
};

const ensureSameMembers = (expectedIds: string[], receivedIds: string[], label: string) => {
  if (expectedIds.length !== receivedIds.length) {
    throw new AppError(`${label} list must include every existing item exactly once`, 400);
  }

  const expectedSorted = [...expectedIds].sort();
  const receivedSorted = [...receivedIds].sort();

  if (expectedSorted.some((value, index) => value !== receivedSorted[index])) {
    throw new AppError(`${label} list contains invalid items`, 400);
  }
};

const reorderCourseModulesState = async (courseId: string, moduleIds: string[]) => {
  await Promise.all(
    moduleIds.map((id, index) =>
      Module.findByIdAndUpdate(id, {
        order: index,
        updatedAt: new Date(),
      }),
    ),
  );

  await Course.findByIdAndUpdate(courseId, {
    modules: moduleIds as any,
    updatedAt: new Date(),
  });
  void bumpCourseCatalogCacheVersion();
};

const reorderModuleLessonsState = async (moduleId: string, lessonIds: string[]) => {
  await Promise.all(
    lessonIds.map((id, index) =>
      Lesson.findByIdAndUpdate(id, {
        order: index,
        updatedAt: new Date(),
      }),
    ),
  );

  await Module.findByIdAndUpdate(moduleId, {
    lessons: lessonIds as any,
    updatedAt: new Date(),
  });
};

export const getCourses = asyncHandler(async (req: Request, res: Response) => {
  const {
    category,
    level,
    instructor,
    language,
    status,
    featured,
    q,
    minPrice,
    maxPrice,
  } = req.query as Record<string, string | undefined>;

  const requestedStatus = status?.trim().toLowerCase();
  const resolvedStatus = requestedStatus || 'published';

  if (resolvedStatus !== 'published') {
    if (!req.user) {
      throw new AppError('Authentication is required for this course status filter', 401);
    }

    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      throw new AppError('Access denied', 403);
    }
  }

  const filters: Record<string, unknown> = {
    status: resolvedStatus,
  };

  if (category) filters.category = category;
  if (level) filters.level = level;
  if (instructor) {
    filters.instructor = instructor;
  } else if (resolvedStatus !== 'published' && req.user?.role === 'instructor') {
    filters.instructor = req.user._id;
  }
  if (language) filters.language = language;

  if (featured !== undefined) {
    filters.featured = String(featured).toLowerCase() === 'true';
  }

  const searchFragment = safeRegexFragment(q);
  if (searchFragment) {
    filters.$or = [
      { title: { $regex: searchFragment, $options: 'i' } },
      { description: { $regex: searchFragment, $options: 'i' } },
      { tags: { $elemMatch: { $regex: searchFragment, $options: 'i' } } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceRange: Record<string, number> = {};
    if (minPrice !== undefined && !Number.isNaN(Number(minPrice))) {
      priceRange.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && !Number.isNaN(Number(maxPrice))) {
      priceRange.$lte = Number(maxPrice);
    }
    if (Object.keys(priceRange).length > 0) {
      filters['pricing.amount'] = priceRange;
    }
  }

  const paginated = String((req.query as Record<string, string | undefined>).paginated || '')
    .toLowerCase() === 'true';
  const page = Math.max(1, Number.parseInt(String((req.query as Record<string, string | undefined>).page || '1'), 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(String((req.query as Record<string, string | undefined>).limit || '50'), 10) || 50),
  );

  const cacheablePublished =
    resolvedStatus === 'published' && process.env.DISABLE_COURSE_LIST_CACHE !== 'true';
  if (cacheablePublished) {
    const cached = await getCachedCourseListJson({ filters, paginated, page, limit });
    if (cached) {
      return res.json(JSON.parse(cached));
    }
  }

  if (paginated) {
    const skip = (page - 1) * limit;
    const [total, courses] = await Promise.all([
      Course.countDocuments(filters),
      Course.find(filters)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: 'instructor', select: publicInstructorSelect }),
    ]);
    const body = {
      items: courses,
      meta: { page, limit, total, hasMore: skip + courses.length < total },
    };
    if (cacheablePublished) {
      void setCachedCourseListJson({ filters, paginated, page, limit }, JSON.stringify(body));
    }
    return res.json(body);
  }

  const courses = await Course.find(filters)
    .sort({ updatedAt: -1 })
    .populate({ path: 'instructor', select: publicInstructorSelect });
  if (cacheablePublished) {
    void setCachedCourseListJson({ filters, paginated, page, limit }, JSON.stringify(courses));
  }
  return res.json(courses);
});

export const getCourseById = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findById(routeParam(req.params.id));
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  await ensureCourseDetailAccess(course, req.user);
  await course.populate([
    { path: 'instructor', select: publicInstructorSelect },
    { path: 'modules' },
  ]);

  return res.json(course);
});

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = new Course({
    ...req.body,
    instructor: req.user?._id,
    updatedAt: new Date(),
  });
  await course.save();
  void bumpCourseCatalogCacheVersion();
  return res.status(201).json(course);
});

export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await ensureOwnedCourse(routeParam(req.params.id), req.user);

  Object.assign(course, req.body, {
    updatedAt: new Date(),
  });
  await course.save();
  void bumpCourseCatalogCacheVersion();

  return res.json(course);
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await ensureOwnedCourse(routeParam(req.params.id), req.user);
  const modules = await Module.find({ courseId: course._id }).select('_id');
  const moduleIds = modules.map((moduleItem) => moduleItem._id);

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    await Lesson.deleteMany({ moduleId: { $in: moduleIds } }, { session });
    await Module.deleteMany({ courseId: course._id }, { session });
    await Course.findByIdAndDelete(course._id, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  void bumpCourseCatalogCacheVersion();

  return res.json({ message: 'Deleted' });
});

export const enrollCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findById(routeParam(req.params.id));
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  assertPublishedForPublicEnrollment(course);

  if (courseRequiresCompletedPayment(course)) {
    const paid = await Payment.findOne({
      userId: req.user?._id,
      courseId: course._id,
      status: 'completed',
    });
    if (!paid) {
      throw new AppError('Complete payment before enrolling in this course', 403);
    }
  }

  const existingEnrollment = await Enrollment.findOne({ userId: req.user?._id, courseId: routeParam(req.params.id) });
  if (existingEnrollment) {
    return res.json({ message: 'Already enrolled' });
  }

  try {
    const enrollment = new Enrollment({ userId: req.user?._id, courseId: routeParam(req.params.id) });
    await enrollment.save();
  } catch (error: any) {
    if (error?.code !== 11000) {
      throw error;
    }

    return res.json({ message: 'Already enrolled' });
  }

  course.enrollmentCount = Number(course.enrollmentCount || 0) + 1;
  course.updatedAt = new Date();
  await course.save();

  await Notification.create({
    userId: req.user?._id,
    type: 'enrollment',
    title: 'Enrollment successful',
    message: `You are now enrolled in ${course.title}.`,
    isRead: false,
    createdAt: new Date(),
  });
  void bumpCourseCatalogCacheVersion();

  return res.json({ message: 'Enrolled' });
});

export const getCourseProgress = asyncHandler(async (req: Request, res: Response) => {
  const enrollment = await Enrollment.findOne({ userId: req.user?._id, courseId: routeParam(req.params.id) });
  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  const modules = await Module.find({ courseId: routeParam(req.params.id) }).select('_id lessons');
  const totalLessons = modules.reduce((sum, moduleItem: any) => sum + ((moduleItem.lessons || []).length), 0);
  const completedLessonIds = (enrollment.completedLessons || []).map((lessonId: any) => lessonId.toString());

  return res.json({
    courseId: enrollment.courseId,
    progress: enrollment.progress,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
    completedLessons: completedLessonIds,
    completedLessonsCount: completedLessonIds.length,
    totalLessons,
  });
});

export const createCourseReview = asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  const course = await Course.findById(routeParam(req.params.id));
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const enrollment = await Enrollment.findOne({ userId: req.user?._id, courseId: routeParam(req.params.id) });
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
  void bumpCourseCatalogCacheVersion();

  return res.status(201).json({
    message: existingReview ? 'Review updated' : 'Review submitted',
    rating: course.get('rating'),
  });
});

export const getCourseModules = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findById(routeParam(req.params.id));
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  await ensureCourseDetailAccess(course, req.user);

  const modules = await Module.find({ courseId: routeParam(req.params.id) })
    .sort({ order: 1, createdAt: 1 })
    .populate('lessons');

  const normalizedModules = modules.map((moduleItem: any) => {
    const lessonDocs = Array.isArray(moduleItem.lessons) ? [...moduleItem.lessons] : [];
    lessonDocs.sort((left: any, right: any) => {
      const leftOrder = Number(left.order || 0);
      const rightOrder = Number(right.order || 0);
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    });

    const moduleObject = moduleItem.toObject();
    moduleObject.lessons = lessonDocs;
    return moduleObject;
  });

  return res.json(normalizedModules);
});

export const addCourseModule = asyncHandler(async (req: Request, res: Response) => {
  const course = await ensureOwnedCourse(routeParam(req.params.id), req.user);
  const nextOrder = Number(course.modules?.length || 0);

  const moduleItem = new Module({
    courseId: routeParam(req.params.id),
    title: req.body.title,
    description: req.body.description || '',
    type: req.body.type || 'Core',
    order: nextOrder,
    status: req.body.status || 'draft',
    updatedAt: new Date(),
  });
  await moduleItem.save();

  course.modules = [...(course.modules || []), moduleItem._id as any];
  course.updatedAt = new Date();
  await course.save();
  void bumpCourseCatalogCacheVersion();

  return res.status(201).json(moduleItem);
});

export const updateCourseModule = asyncHandler(async (req: Request, res: Response) => {
  const { course, moduleItem } = await ensureOwnedModule(routeParam(req.params.moduleId), req.user);
  const requestedOrder = typeof req.body.order === 'number' ? req.body.order : undefined;

  Object.assign(moduleItem, req.body, {
    updatedAt: new Date(),
  });
  await moduleItem.save();

  if (requestedOrder !== undefined) {
    const siblingModules = await Module.find({ courseId: course._id }).sort({ order: 1, createdAt: 1 });
    const orderedIds = siblingModules.map((entry) => entry._id.toString()).filter((id) => id !== moduleItem._id.toString());
    const boundedOrder = Math.max(0, Math.min(requestedOrder, orderedIds.length));
    orderedIds.splice(boundedOrder, 0, moduleItem._id.toString());
    await reorderCourseModulesState(String(course._id), orderedIds);
  }

  return res.json(moduleItem);
});

export const deleteCourseModule = asyncHandler(async (req: Request, res: Response) => {
  const { course, moduleItem } = await ensureOwnedModule(routeParam(req.params.moduleId), req.user);

  await Lesson.deleteMany({ moduleId: moduleItem._id });
  await Module.findByIdAndDelete(moduleItem._id);

  const nextModuleIds = (course.modules || [])
    .map((entry: any) => entry.toString())
    .filter((entry: string) => entry !== moduleItem._id.toString());

  await reorderCourseModulesState(String(course._id), nextModuleIds);

  return res.json({ message: 'Module deleted' });
});

export const addModuleLesson = asyncHandler(async (req: Request, res: Response) => {
  const { moduleItem } = await ensureOwnedModule(routeParam(req.params.moduleId), req.user);
  const nextOrder = Number(moduleItem.lessons?.length || 0);

  const lesson = new Lesson({
    moduleId: routeParam(req.params.moduleId),
    title: req.body.title,
    content: req.body.content,
    type: req.body.type,
    duration: req.body.duration,
    notes: req.body.notes || '',
    order: nextOrder,
    updatedAt: new Date(),
  });
  await lesson.save();

  moduleItem.lessons = [...(moduleItem.lessons || []), lesson._id as any];
  moduleItem.updatedAt = new Date();
  await moduleItem.save();

  return res.status(201).json(lesson);
});

export const updateModuleLesson = asyncHandler(async (req: Request, res: Response) => {
  const { moduleItem, lesson } = await ensureOwnedLesson(routeParam(req.params.moduleId), routeParam(req.params.lessonId), req.user);
  const requestedOrder = typeof req.body.order === 'number' ? req.body.order : undefined;

  Object.assign(lesson, req.body, {
    updatedAt: new Date(),
  });
  await lesson.save();

  if (requestedOrder !== undefined) {
    const siblingLessons = await Lesson.find({ moduleId: moduleItem._id }).sort({ order: 1, createdAt: 1 });
    const orderedIds = siblingLessons.map((entry) => entry._id.toString()).filter((id) => id !== lesson._id.toString());
    const boundedOrder = Math.max(0, Math.min(requestedOrder, orderedIds.length));
    orderedIds.splice(boundedOrder, 0, lesson._id.toString());
    await reorderModuleLessonsState(String(moduleItem._id), orderedIds);
  }

  return res.json(lesson);
});

export const deleteModuleLesson = asyncHandler(async (req: Request, res: Response) => {
  const { moduleItem, lesson } = await ensureOwnedLesson(routeParam(req.params.moduleId), routeParam(req.params.lessonId), req.user);

  await Lesson.findByIdAndDelete(lesson._id);

  const nextLessonIds = (moduleItem.lessons || [])
    .map((entry: any) => entry.toString())
    .filter((entry: string) => entry !== lesson._id.toString());

  await reorderModuleLessonsState(String(moduleItem._id), nextLessonIds);

  return res.json({ message: 'Lesson deleted' });
});

export const updateCourseProgress = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findById(routeParam(req.params.id)).select('title');
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const enrollment = await Enrollment.findOne({ userId: req.user?._id, courseId: routeParam(req.params.id) });
  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  const previousStatus = enrollment.status;
  const progressValue = Number(req.body.progress);
  if (!Number.isFinite(progressValue) || progressValue < 0 || progressValue > 100) {
    throw new AppError('progress must be a number between 0 and 100', 400);
  }

  enrollment.progress = progressValue;
  enrollment.status = progressValue >= 100 ? 'completed' : 'enrolled';
  enrollment.completedAt = progressValue >= 100 ? new Date() : undefined;
  enrollment.updatedAt = new Date();
  await enrollment.save();

  if (enrollment.status === 'completed' && previousStatus !== 'completed') {
    await ensureCourseCompletionNotification(String(req.user?._id), String(course.title || 'your course'));
  }

  return res.json({
    courseId: enrollment.courseId,
    progress: enrollment.progress,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
    completedLessons: (enrollment.completedLessons || []).map((lessonId: any) => lessonId.toString()),
  });
});

export const completeCourseLesson = asyncHandler(async (req: Request, res: Response) => {
  const id = routeParam(req.params.id);
  const lessonId = routeParam(req.params.lessonId);

  const enrollment = await Enrollment.findOne({ userId: req.user?._id, courseId: id });
  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  const moduleItem = await Module.findById(lesson.moduleId);
  if (!moduleItem || moduleItem.courseId.toString() !== id) {
    throw new AppError('Lesson does not belong to this course', 400);
  }

  const course = await Course.findById(id).select('title');
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const previousStatus = enrollment.status;
  const existingCompleted = (enrollment.completedLessons || []).map((entry: any) => entry.toString());
  let pointsEarned = 0;
  if (!existingCompleted.includes(lessonId)) {
    enrollment.completedLessons = [...(enrollment.completedLessons || []), lesson._id as any];
    pointsEarned += 10;
  }

  const modules = await Module.find({ courseId: id }).select('lessons');
  const totalLessons = modules.reduce((sum, item: any) => sum + ((item.lessons || []).length), 0);
  const completedCount = (enrollment.completedLessons || []).length;
  const computedProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  enrollment.progress = computedProgress;
  enrollment.status = computedProgress >= 100 ? 'completed' : 'enrolled';
  enrollment.completedAt = computedProgress >= 100 ? new Date() : undefined;
  enrollment.updatedAt = new Date();
  await enrollment.save();

  let awardedBadge = null;
  if (enrollment.status === 'completed' && previousStatus !== 'completed') {
    await ensureCourseCompletionNotification(String(req.user?._id), String(course.title || 'your course'));
    pointsEarned += 100;
    awardedBadge = {
      name: `Completed: ${course.title}`,
      description: `Awarded for completing the course ${course.title}`,
      awardedAt: new Date(),
    };
  }

  if (pointsEarned > 0 && req.user?._id) {
    const user = await User.findById(req.user._id);
    if (user && user.gamification) {
      user.gamification.points = (user.gamification.points || 0) + pointsEarned;
      user.gamification.level = Math.floor(user.gamification.points / 500) + 1;

      if (awardedBadge) {
        user.gamification.badges.push(awardedBadge as any);
      }

      await user.save();
    }
  }

  return res.json({
    courseId: enrollment.courseId,
    progress: enrollment.progress,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
    completedLessons: (enrollment.completedLessons || []).map((entry: any) => entry.toString()),
    completedLessonsCount: completedCount,
    totalLessons,
  });
});

export const reorderModules = asyncHandler(async (req: Request, res: Response) => {
  const course = await ensureOwnedCourse(routeParam(req.params.id), req.user);
  const moduleIds = req.body.moduleIds as string[];
  const existingModuleIds = await Module.find({ courseId: course._id }).sort({ order: 1 }).distinct('_id');
  const normalizedExistingIds = existingModuleIds.map((value) => value.toString());
  const normalizedRequestedIds = moduleIds.map((value) => String(value));

  ensureSameMembers(normalizedExistingIds, normalizedRequestedIds, 'Module');
  await reorderCourseModulesState(String(course._id), normalizedRequestedIds);

  res.status(200).json({ message: 'Modules reordered successfully', modules: normalizedRequestedIds });
});

export const reorderLessons = asyncHandler(async (req: Request, res: Response) => {
  const { moduleItem } = await ensureOwnedModule(routeParam(req.params.moduleId), req.user);
  const lessonIds = req.body.lessonIds as string[];
  const existingLessonIds = await Lesson.find({ moduleId: moduleItem._id }).sort({ order: 1 }).distinct('_id');
  const normalizedExistingIds = existingLessonIds.map((value) => value.toString());
  const normalizedRequestedIds = lessonIds.map((value) => String(value));

  ensureSameMembers(normalizedExistingIds, normalizedRequestedIds, 'Lesson');
  await reorderModuleLessonsState(String(moduleItem._id), normalizedRequestedIds);

  res.status(200).json({ message: 'Lessons reordered successfully', lessons: normalizedRequestedIds });
});
