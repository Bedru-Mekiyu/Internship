import { Request, Response } from 'express';
import { Enrollment } from '../models/Enrollment.model';
import { Course } from '../models/Course.model';
import { User } from '../models/User.model';
import { Content } from '../models/Content.model';
import { Certificate } from '../models/Certificate.model';
import { LiveSession } from '../models/LiveSession.model';
import { Notification } from '../models/Notification.model';
import { asyncHandler } from '../utils/async-handler';

const getActivityFeed = async (userId: string) => {
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return notifications.map((n: any) => ({
    title: n.message,
    time: formatTimeAgo(n.createdAt),
    type: mapNotificationTypeToActivityType(n.type),
  }));
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return 'Over a week ago';
};

const mapNotificationTypeToActivityType = (type: string): 'Completion' | 'Badge' | 'Enrollment' | 'Assignment' => {
  switch (type) {
    case 'completion':
      return 'Completion';
    case 'badge':
    case 'gamification':
      return 'Badge';
    case 'enrollment':
      return 'Enrollment';
    default:
      return 'Assignment';
  }
};

const getStudentBadges = async (userId: string) => {
  const user = await User.findById(userId).select('gamification').lean();
  const badges = user?.gamification?.badges || [];

  const badgeConfig: Record<string, { color: string; iconKey: string }> = {
    'Fast Starter': { color: '#F97316', iconKey: 'fire' },
    'Top Learner': { color: '#F59E0B', iconKey: 'trophy' },
    'Community Voice': { color: '#6366F1', iconKey: 'forum' },
    'Consistency Pro': { color: '#10B981', iconKey: 'star' },
  };

  return badges.map((badge: any) => ({
    name: badge.name,
    description: badge.description || 'Earned through learning',
    color: badgeConfig[badge.name]?.color || '#6366F1',
    awardedAt: badge.awardedAt,
  }));
};

const getMomentumData = async (userId: string) => {
  const enrollments = await Enrollment.find({ userId }).select('progress updatedAt').lean();

  const dailyActivity = new Map<string, number>();
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    dailyActivity.set(key, 0);
  }

  enrollments.forEach((enrollment: any) => {
    if (enrollment.updatedAt) {
      const dateKey = new Date(enrollment.updatedAt).toISOString().split('T')[0];
      if (dailyActivity.has(dateKey)) {
        dailyActivity.set(dateKey, (dailyActivity.get(dateKey) || 0) + 1);
      }
    }
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return Array.from(dailyActivity.entries()).map(([date, count]) => ({
    label: dayNames[new Date(date).getDay()],
    value: count,
  }));
};

const getRecommendedCourses = async (userId: string) => {
  const userEnrollments = await Enrollment.find({ userId }).distinct('courseId');

  const completedCourses = await Enrollment.find({ userId, status: 'completed' })
    .populate('courseId', 'category tags')
    .lean();

  const completedCategories = new Set(
    completedCourses
      .map((e: any) => e.courseId?.category)
      .filter(Boolean)
  );

  const filter: any = { status: 'published', _id: { $nin: userEnrollments } };
  if (completedCategories.size > 0) {
    filter.category = { $in: Array.from(completedCategories) };
  }

  const recommendations = await Course.find(filter)
    .sort({ enrollmentCount: -1, 'rating.average': -1 })
    .limit(4)
    .select('title category tags enrollmentCount rating')
    .lean();

  return recommendations.map((course: any) => ({
    courseId: course._id,
    title: course.title,
    meta: `${course.tags?.length || 0} modules · ${course.rating?.average || 0} rating`,
    tag: course.category || 'General',
    enrollmentCount: course.enrollmentCount || 0,
  }));
};

export const getStudentDashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id as unknown as string;
  const enrollments = await Enrollment.find({ userId }).populate('courseId', 'title status');

  const totalCourses = enrollments.length;
  const averageProgress = totalCourses
    ? Math.round(enrollments.reduce((sum, item) => sum + (item.progress || 0), 0) / totalCourses)
    : 0;

  const completedCourses = enrollments.filter((item) => Number(item.progress || 0) >= 100).length;
  const certificatesEarned = userId ? await Certificate.countDocuments({ userId }) : 0;

  const [activityFeed, badges, momentumData, recommendedCourses] = await Promise.all([
    getActivityFeed(userId),
    getStudentBadges(userId),
    getMomentumData(userId),
    getRecommendedCourses(userId),
  ]);

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
    activityFeed,
    badges,
    momentumData,
    recommendedCourses,
  });
});

const getInstructorRecentEnrollments = async (courseIds: string[]) => {
  const recentEnrollments = await Enrollment.find({ courseId: { $in: courseIds } })
    .sort({ enrolledAt: -1 })
    .limit(10)
    .populate('userId', 'firstName lastName email avatar')
    .populate('courseId', 'title')
    .lean();

  return recentEnrollments.map((enrollment: any) => ({
    enrollmentId: enrollment._id,
    student: enrollment.userId
      ? `${enrollment.userId.firstName || ''} ${enrollment.userId.lastName || ''}`.trim() || enrollment.userId.email
      : 'Unknown Student',
    studentAvatar: enrollment.userId?.avatar,
    studentInitials: enrollment.userId
      ? `${(enrollment.userId.firstName || 'U')[0]}${(enrollment.userId.lastName || 'S')[0]}`.toUpperCase()
      : 'US',
    course: enrollment.courseId?.title || 'Unknown Course',
    date: enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent',
    status: enrollment.status || 'Active',
  }));
};

const getInstructorEngagementMetrics = async (courseIds: string[]) => {
  const enrollments = await Enrollment.find({ courseId: { $in: courseIds } }).lean();

  const totalEnrollments = enrollments.length;
  const completedEnrollments = enrollments.filter((e: any) => e.status === 'completed').length;

  const discussions = await import('../models/Discussion.model').then((m) => m.Discussion.find({ courseId: { $in: courseIds } }).countDocuments());

  const messageAnswered = Math.min(100, Math.round((discussions / Math.max(1, courseIds.length)) * 10));
  const assignmentCompletion = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
  const [heldSessions, activeSessions] = await Promise.all([
    LiveSession.countDocuments({ courseId: { $in: courseIds }, status: 'completed' }),
    LiveSession.countDocuments({ courseId: { $in: courseIds }, status: { $in: ['live', 'scheduled', 'completed'] } }),
  ]);
  const liveSessionAttendance = activeSessions > 0 ? Math.round((heldSessions / activeSessions) * 100) : 0;

  return [
    { label: 'Messages answered', value: messageAnswered },
    { label: 'Assignment completion', value: assignmentCompletion },
    { label: 'Live session attendance', value: liveSessionAttendance },
  ];
};

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

  const courseIdsStrings = courseIds.map(id => id.toString());

  const [recentEnrollments, engagementMetrics] = await Promise.all([
    getInstructorRecentEnrollments(courseIdsStrings),
    getInstructorEngagementMetrics(courseIdsStrings),
  ]);

  return res.json({
    totalCourses: courses.length,
    totalStudents,
    averageCompletionRate,
    averageRating,
    courses: courses.map((c: any) => ({
      _id: c._id,
      title: c.title,
      enrollmentCount: c.enrollmentCount || 0,
      rating: c.rating,
    })),
    recentEnrollments,
    engagementMetrics,
  });
});

const getAdminRevenueData = async () => {
  const Payment = (await import('../models/Payment.model')).Payment;

  const completedPayments = await Payment.find({ status: 'completed' })
    .sort({ createdAt: -1 })
    .lean();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyRevenue = new Array(12).fill(0).map((_, i) => ({
    month: monthNames[i],
    revenue: 0,
  }));

  const currentYear = new Date().getFullYear();
  completedPayments.forEach((payment: any) => {
    const paymentDate = new Date(payment.createdAt);
    if (paymentDate.getFullYear() === currentYear) {
      const monthIndex = paymentDate.getMonth();
      monthlyRevenue[monthIndex].revenue += Number(payment.amount || 0) / 1000;
    }
  });

  return monthlyRevenue.map((item) => ({
    ...item,
    revenue: Math.round(item.revenue),
  }));
};

const getAdminCourseDistribution = async () => {
  const categories = await Course.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const total = categories.reduce((sum: number, cat: any) => sum + cat.count, 0);

  const categoryColors: Record<string, string> = {
    'Development': '#0066FF',
    'Design': '#6366F1',
    'Marketing': '#F59E0B',
    'Business': '#10B981',
    'Data Science': '#0EA5E9',
  };

  return categories.map((cat: any) => ({
    label: cat._id || 'Other',
    count: cat.count,
    pct: total > 0 ? Math.round((cat.count / total) * 100) : 0,
    color: categoryColors[cat._id] || '#6366F1',
  }));
};

const getAdminRecentEnrollments = async () => {
  const recentEnrollments = await Enrollment.find()
    .sort({ enrolledAt: -1 })
    .limit(10)
    .populate('userId', 'firstName lastName email avatar')
    .populate('courseId', 'title')
    .lean();

  const statusColors: Record<string, string> = {
    active: '#2DD4BF',
    enrolled: '#2DD4BF',
    completed: '#10B981',
    pending: '#F59E0B',
  };

  return recentEnrollments.map((enrollment: any) => ({
    enrollmentId: enrollment._id,
    student: enrollment.userId
      ? `${enrollment.userId.firstName || ''} ${enrollment.userId.lastName || ''}`.trim() || enrollment.userId.email
      : 'Unknown Student',
    studentAvatar: enrollment.userId?.avatar,
    studentInitials: enrollment.userId
      ? `${(enrollment.userId.firstName || 'U')[0]}${(enrollment.userId.lastName || 'S')[0]}`.toUpperCase()
      : 'US',
    course: enrollment.courseId?.title || 'Unknown Course',
    date: enrollment.enrolledAt
      ? new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      : 'Recent',
    status: enrollment.status || 'Active',
    color: statusColors[enrollment.status?.toLowerCase()] || '#2DD4BF',
  }));
};

export const getAdminDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalCourses, totalEnrollments, totalContent, pendingCourseApprovals, pendingContentApprovals] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Content.countDocuments(),
    Course.countDocuments({ status: 'draft' }),
    Content.countDocuments({ status: 'draft' }),
  ]);

  const [revenueData, courseDistribution, recentEnrollments] = await Promise.all([
    getAdminRevenueData(),
    getAdminCourseDistribution(),
    getAdminRecentEnrollments(),
  ]);

  return res.json({
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalContent,
    pendingApprovals: pendingCourseApprovals + pendingContentApprovals,
    revenueData,
    courseDistribution,
    recentEnrollments,
  });
});
