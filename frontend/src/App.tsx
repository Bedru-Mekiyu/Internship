import { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { createAuthenticatedSocket } from './services/realtimeSocket';
import MainLayout from './components/layout/MainLayout';
import LearnSpaceShell from './routes/LearnSpaceShell';
import ErrorBoundary from './components/common/ErrorBoundary';
import type { LearnSpaceRole } from './routes/learnSpaceNavigation';
import { getLandingRouteForRole } from './routes/learnSpaceNavigation';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import MarketingHomepagePage from './pages/main/MarketingHomepagePage';
import PublicAuthPage from './pages/auth/PublicAuthPage';
import PasswordResetPage from './pages/auth/PasswordResetPage';

const CourseDetailPage = lazy(() => import('./pages/courses/CourseDetailPage'));
const ExploreCourses = lazy(() => import('./pages/courses/ExploreCourses'));
const CreateCourse = lazy(() => import('./pages/courses/CreateCourse'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const AdminCourseManager = lazy(() => import('./pages/admin/CourseManager'));
const Messages = lazy(() => import('./pages/dashboard/Messages'));

const AnalyticsDashboard = lazy(() => import('./pages/dashboard/AnalyticsDashboard'));
const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard'));
const ContactUs = lazy(() => import('./pages/main/ContactUs'));
const AboutPage = lazy(() => import('./pages/main/AboutPage'));
const BlogLandingPage = lazy(() => import('./pages/main/BlogLandingPage'));
const CmsContentPage = lazy(() => import('./pages/main/CmsContentPage'));
const MyCourses = lazy(() => import('./pages/dashboard/MyCourses'));
const CoursePlayer = lazy(() => import('./pages/courses/CoursePlayer'));
const PricingPage = lazy(() => import('./pages/main/PricingPage'));
const HelpCenterPage = lazy(() => import('./pages/main/HelpCenterPage'));
const CareersPage = lazy(() => import('./pages/main/CareersPage'));
const InstructorDashboard = lazy(() => import('./pages/dashboard/InstructorDashboard'));
const CheckoutPage = lazy(() => import('./pages/courses/CheckoutPage'));
const SystemSettings = lazy(() => import('./pages/dashboard/SystemSettings'));
const ProfileSettings = lazy(() => import('./pages/dashboard/ProfileSettings'));
const NotFoundPage = lazy(() => import('./pages/main/NotFoundPage'));
const CommunityPage = lazy(() => import('./pages/main/CommunityPage'));
const StatusPage = lazy(() => import('./pages/main/StatusPage'));
const DocsPage = lazy(() => import('./pages/main/DocsPage'));
const ActivityPage = lazy(() => import('./pages/dashboard/ActivityPage'));
const SignupAuthPage = lazy(() => import('./pages/auth/SignupAuthPage'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));
const OrderSuccessPage = lazy(() => import('./pages/orders/OrderSuccessPage'));
const NotificationPreferencesPage = lazy(() => import('./pages/settings/NotificationPreferencesPage'));
const SearchResultsPage = lazy(() => import('./pages/search/SearchResultsPage'));
const MyQuizResultsPage = lazy(() => import('./pages/quizzes/MyQuizResultsPage'));
const UploadLesson = lazy(() => import('./pages/cms/UploadLesson'));
const QuizTaker = lazy(() => import('./pages/courses/QuizTaker'));
const CourseDiscussions = lazy(() => import('./pages/courses/CourseDiscussions'));
const AdminNotifications = lazy(() => import('./pages/dashboard/AdminNotifications'));
const MyCertificates = lazy(() => import('./pages/dashboard/MyCertificates'));
const MediaLibrary = lazy(() => import('./pages/cms/MediaLibrary'));
const ContentManager = lazy(() => import('./pages/cms/ContentManager'));
const BlogPostEditor = lazy(() => import('./pages/cms/BlogPostEditor'));
const QuizBuilder = lazy(() => import('./pages/courses/QuizBuilder'));
const UserManagement = lazy(() => import('./pages/dashboard/UserManagement'));
const AssignmentListPage = lazy(() => import('./pages/assignments/AssignmentListPage'));
const AssignmentSubmitPage = lazy(() => import('./pages/assignments/AssignmentSubmitPage'));
const AssignmentGradePage = lazy(() => import('./pages/assignments/AssignmentGradePage'));
const LiveSessionsPage = lazy(() => import('./pages/live-sessions/LiveSessionsPage'));
const ContactAdminPage = lazy(() => import('./pages/admin/contacts/ContactAdminPage'));
const ApiDocsPage = lazy(() => import('./pages/docs/ApiDocsPage'));

function RequireSession() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Getting you in..." />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}

function RequireRole({ allowedRoles }: { allowedRoles: LearnSpaceRole[] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingSpinner message="Verifying access..." />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    navigate(getLandingRouteForRole(user.role), { replace: true, state: { from: location.pathname, accessDenied: true } });
    return null;
  }

  return <Outlet />;
}

function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const accessDenied = (location.state as { accessDenied?: boolean })?.accessDenied;

  if (user?.role === 'admin') {
    return <AdminDashboard showAccessDenied={accessDenied} />;
  }

  if (user?.role === 'instructor') {
    return <InstructorDashboard showAccessDenied={accessDenied} />;
  }

  if (user?.role === 'content_manager') {
    return <Navigate to="/cms/content" replace />;
  }

  return <StudentDashboard showAccessDenied={accessDenied} />;
}

function NotificationSocketBridge() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const socket = createAuthenticatedSocket();

    const onNotification = () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] });
    };

    socket.on('notification:new', onNotification);
    socket.connect();

    return () => {
      socket.off('notification:new', onNotification);
      socket.disconnect();
    };
  }, [user, queryClient]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <NotificationSocketBridge />
    <Suspense
      fallback={
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F8FAFC' }}>
          <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Loading LearnSpace
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Preparing the requested page...
            </Typography>
          </Stack>
        </Box>
      }
    >
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<MarketingHomepagePage />} />
          <Route path="/home" element={<MarketingHomepagePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogLandingPage />} />
          <Route path="/blog/:slug" element={<CmsContentPage eyebrow="Blog" />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/help-center" element={<Navigate to="/help" replace />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/terms" element={<CmsContentPage slug="terms" eyebrow="Legal" />} />
          <Route path="/privacy" element={<CmsContentPage slug="privacy" eyebrow="Legal" />} />
          <Route path="/cookies" element={<CmsContentPage slug="cookies" eyebrow="Legal" />} />
          <Route path="/courses/explore" element={<ExploreCourses />} />
          <Route path="/courses/:courseSlug" element={<CourseDetailPage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/pricing" element={<PricingPage />} />

          <Route element={<RequireSession />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<OrderSuccessPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/auth/login" element={<PublicAuthPage />} />
        <Route path="/auth/signup" element={<SignupAuthPage />} />
        <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
        <Route path="/auth/reset-password" element={<PasswordResetPage />} />
        <Route path="/reset-password" element={<ResetPasswordRedirect />} />
        <Route path="/forgot-password" element={<ResetPasswordRedirect />} />

        <Route element={<RequireSession />}>
          <Route element={<LearnSpaceShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<MyCourses />} />
            <Route path="/my-courses" element={<Navigate to="/courses" replace />} />
            <Route path="/courses/:courseId/lessons/:lessonId/quiz" element={<QuizTaker />} />
            <Route path="/courses/:courseId/learn" element={<CoursePlayer />} />
            <Route path="/courses/browse" element={<ExploreCourses />} />
            <Route path="/courses/:courseSlug/details" element={<CourseDetailPage />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/discussions" element={<CourseDiscussions />} />
            <Route path="/discussions/:threadId" element={<CourseDiscussions />} />
            <Route path="/courses/:courseSlug/discussions/:threadId" element={<CourseDiscussions />} />
            <Route path="/courses/:courseSlug/lessons/:lessonSlug/discussions/:threadId" element={<CourseDiscussions />} />
            <Route path="/notifications" element={<AdminNotifications />} />
            <Route path="/certificates" element={<MyCertificates />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/quizzes" element={<MyQuizResultsPage />} />
            <Route path="/settings/notifications" element={<NotificationPreferencesPage />} />
            <Route path="/courses/:courseId/assignments" element={<AssignmentListPage />} />
            <Route path="/courses/:courseId/assignments/:assignmentId/submit" element={<AssignmentSubmitPage />} />
            <Route path="/courses/:courseId/assignments/:assignmentId/grade" element={<AssignmentGradePage />} />
            <Route path="/courses/:courseId/live-sessions" element={<LiveSessionsPage />} />
            <Route path="/api-docs" element={<ApiDocsPage />} />

            <Route element={<RequireRole allowedRoles={['admin', 'instructor']} />}>
              <Route path="/lessons/upload" element={<UploadLesson />} />
              <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
              <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
              <Route path="/courses/new" element={<CreateCourse />} />
              <Route path="/courses/:courseId/lessons/:lessonId/quiz/new" element={<QuizBuilder />} />
            </Route>

            <Route element={<RequireRole allowedRoles={['admin', 'instructor', 'content_manager']} />}>
              <Route path="/cms/media" element={<MediaLibrary />} />
              <Route path="/cms/content" element={<ContentManager />} />
              <Route path="/cms/pages" element={<BlogPostEditor />} />
            </Route>

            <Route element={<RequireRole allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<AdminCourseManager />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/contacts" element={<ContactAdminPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
    </>
  );
}

function ResetPasswordRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/auth/reset-password${search}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;