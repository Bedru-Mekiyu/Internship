import { baseApi } from './baseApi';

export interface StudentDashboardResponse {
  totalCourses: number;
  averageProgress: number;
  completedCourses: number;
  certificatesEarned: number;
  learningStreak?: number;
  enrolledCourses: Array<{
    courseId: string;
    title: string;
    status: string;
    progress: number;
  }>;
  activityFeed: Array<{
    title: string;
    time: string;
    type: 'Completion' | 'Badge' | 'Enrollment' | 'Assignment';
  }>;
  badges: Array<{
    name: string;
    description: string;
    color: string;
    awardedAt: string;
  }>;
  momentumData: Array<{
    label: string;
    value: number;
  }>;
  recommendedCourses: Array<{
    courseId: string;
    title: string;
    meta: string;
    tag: string;
    enrollmentCount: number;
  }>;
}

export interface InstructorDashboardResponse {
  totalCourses: number;
  totalStudents: number;
  averageCompletionRate: number;
  averageRating: number;
  courses: Array<{
    _id: string;
    title: string;
    enrollmentCount: number;
    rating?: { average: number };
    revenue?: number;
  }>;
  recentEnrollments: Array<{
    enrollmentId: string;
    student: string;
    studentAvatar?: string;
    studentInitials: string;
    course: string;
    date: string;
    status: string;
  }>;
  engagementMetrics: Array<{
    label: string;
    value: number;
  }>;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalContent: number;
  pendingApprovals: number;
  revenueData: Array<{
    month: string;
    revenue: number;
  }>;
  courseDistribution: Array<{
    label: string;
    count: number;
    pct: number;
    color: string;
  }>;
  recentEnrollments: Array<{
    enrollmentId: string;
    student: string;
    studentAvatar?: string;
    studentInitials: string;
    course: string;
    date: string;
    status: string;
    color: string;
  }>;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentDashboard: builder.query<StudentDashboardResponse, void>({
      query: () => ({
        url: '/api/dashboard/student',
      }),
      providesTags: ['StudentDashboard'],
    }),
    getInstructorDashboard: builder.query<InstructorDashboardResponse, void>({
      query: () => ({
        url: '/api/dashboard/instructor',
      }),
      providesTags: ['InstructorDashboard'],
    }),
    getAdminDashboard: builder.query<AdminDashboardResponse, void>({
      query: () => ({
        url: '/api/dashboard/admin',
      }),
      providesTags: ['AdminDashboard'],
    }),
  }),
});

export const {
  useGetStudentDashboardQuery,
  useGetInstructorDashboardQuery,
  useGetAdminDashboardQuery,
} = dashboardApi;
