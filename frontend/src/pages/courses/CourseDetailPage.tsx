import { useMemo, useState, type ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import {
  AllInclusiveOutlined,
  ArticleOutlined,
  BoltOutlined,
  CalendarMonthOutlined,
  CardGiftcardOutlined,
  CheckOutlined,
  CloudDownloadOutlined,
  ExpandMore,
  LanguageOutlined,
  OndemandVideoOutlined,
  PlayCircleOutlined,
  ShareOutlined,
  StarRounded,
  WorkspacePremiumOutlined,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import heroLaptop from '../../assets/hero-laptop-open.png';
import { normalizeApiError } from '../../services/api';
import { useEnrollInCourseMutation, useGetCourseByIdQuery } from '../../store/api/courseApi';
import type { AuthUser, Course, CourseModule, CourseModuleLesson } from '../../types';
import { sanitizeHttpUrl } from '../../utils/safeUrl';

type CourseModuleWithSummary = CourseModule & {
  durationMinutes?: number;
  lectureCount?: number;
};

type CourseDetailExtras = Course & {
  includedVideoHours?: string;
  instructorHeadline?: string;
  offerEndsIn?: string;
  originalPrice?: number;
  subcategory?: string;
  modules?: CourseModuleWithSummary[];
};

type CourseSection = {
  id: string;
  title: string;
  lessonCount: number;
  durationMinutes: number;
  lessons: CourseModuleLesson[];
};

type DisplayReview = {
  id: string;
  name: string;
  avatar: string;
  comment: string;
  createdAt: string;
  rating: number;
};

const purple = '#4F46E5';
const textPrimary = '#0F172A';
const textMuted = '#64748B';
const borderColor = '#E5EAF2';
const pageMaxWidth = 820;

const demoModules: CourseModuleWithSummary[] = [
  {
    _id: 'demo-intro',
    title: 'Introduction to Web Design',
    lectureCount: 3,
    durationMinutes: 15,
    lessons: [
      { _id: 'demo-welcome', title: 'Welcome to the Course', duration: 5, type: 'video', order: 0 },
      { _id: 'demo-community', title: 'Join our Resources & Community', duration: 5, type: 'text', order: 1 },
      { _id: 'demo-most', title: 'How to Get the Most Out of This Course', duration: 5, type: 'video', order: 2 },
    ],
    order: 0,
  },
  { _id: 'demo-figma', title: 'Figma Fundamentals', lectureCount: 8, durationMinutes: 275, lessons: [], order: 1 },
  { _id: 'demo-visual', title: 'Visual Design Basics', lectureCount: 12, durationMinutes: 390, lessons: [], order: 2 },
  { _id: 'demo-typography', title: 'Typography Masterclass', lectureCount: 5, durationMinutes: 240, lessons: [], order: 3 },
  { _id: 'demo-color', title: 'Color, Layout, and Components', lectureCount: 22, durationMinutes: 315, lessons: [], order: 4 },
  { _id: 'demo-responsive', title: 'Responsive Web Design Systems', lectureCount: 31, durationMinutes: 420, lessons: [], order: 5 },
  { _id: 'demo-prototype', title: 'Prototyping and Portfolio Project', lectureCount: 36, durationMinutes: 540, lessons: [], order: 6 },
  { _id: 'demo-career', title: 'Career Launch and Freelance Workflow', lectureCount: 25, durationMinutes: 250, lessons: [], order: 7 },
];

const demoCourse: CourseDetailExtras = {
  _id: '507f191e810c19729de860ea',
  slug: 'complete-web-design-bootcamp-2025',
  title: 'Complete Web Design Bootcamp 2025: From Zero to Mastery',
  shortDescription: 'Learn UI/UX design, Figma, HTML, CSS, and modern web design principles. Build real-world projects and start your career.',
  description:
    'Are you ready to start your career as a Web Designer? This course is your one-stop-shop to learning everything you need to know to design and build professional websites.\n\nWe start from the very basics, understanding how the web works and the fundamental principles of design. Then, we dive deep into Figma, the industry-standard tool for UI/UX design.\n\nBy the end of this course, you will have a complete portfolio project that you can show to potential employers or clients.',
  thumbnail: '',
  category: 'Design',
  subcategory: 'User Experience',
  level: 'beginner',
  language: 'English',
  status: 'published',
  pricing: {
    type: 'paid',
    amount: 14.99,
    currency: 'USD',
    discount: { percentage: 83 },
  },
  originalPrice: 80,
  offerEndsIn: 'Offer ends in 5 hours',
  includedVideoHours: '23.5 hours',
  instructor: {
    _id: 'demo-marcus-johnson',
    email: 'marcus@learnspace.dev',
    firstName: 'Marcus',
    lastName: 'Johnson',
    role: 'instructor',
    bio:
      'With 10+ years as a product designer and more than 10 years of experience working with startups and Fortune 500 companies, Marcus is passionate about teaching and making design education accessible to everyone.',
  },
  instructorHeadline: 'Senior Product Designer @ TechFlow',
  modules: demoModules,
  prerequisites: [
    'No prior design or coding experience needed.',
    'A computer, Mac or PC, with internet access.',
    'Free Figma account, we will set this up together.',
    'Motivation to learn and build cool things.',
  ],
  learningOutcomes: [
    'Master Figma for UI/UX design from scratch',
    'Create professional design systems and style guides',
    'Learn to design for mobile, tablet, and desktop',
    'Build responsive websites with HTML5 & CSS3',
    'Understand color theory, typography, and layout',
    'Get hired as a junior web designer',
  ],
  reviews: [
    {
      user: 'Sarah M.',
      rating: 5,
      comment:
        'This course is amazing! Marcus explains everything so clearly. I went from knowing nothing about design to building my first portfolio site in just a few weeks.',
      createdAt: '2025-01-22T00:00:00.000Z',
    },
    {
      user: 'Raj P.',
      rating: 5,
      comment:
        'Great content on Figma. I wish there was a bit more on advanced prototyping, but overall a fantastic value for the price.',
      createdAt: '2025-01-16T00:00:00.000Z',
    },
  ],
  duration: 1445,
  enrollmentCount: 12390,
  rating: { average: 4.8, count: 2456 },
  createdAt: '2024-09-08T00:00:00.000Z',
  updatedAt: '2025-01-12T00:00:00.000Z',
};

const demoCourseIdentifiers = new Set([
  demoCourse._id,
  demoCourse.slug,
  'bootcamp-2025',
  'web-design-bootcamp',
].filter(Boolean));

const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatCompactDuration = (minutes: number) => {
  const rounded = Math.max(0, Math.round(minutes));
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;

  if (hours > 0 && rest > 0) return `${hours}h ${rest}m`;
  if (hours > 0) return `${hours}h`;
  return `${rest}m`;
};

const formatHoursDecimal = (minutes: number) => {
  const hours = Math.max(0, minutes / 60);
  return `${Number(hours.toFixed(hours % 1 === 0 ? 0 : 1))} hours`;
};

const formatUpdatedLabel = (value?: string) => {
  if (!value) {
    return 'Last updated recently';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Last updated recently';
  }

  return `Last updated ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
};

const languageLabel = (value?: string) => {
  const normalized = (value || '').trim().toLowerCase();
  if (!normalized) return 'English';
  if (normalized === 'en' || normalized === 'english') return 'English';
  if (normalized === 'es' || normalized === 'spanish') return 'Spanish';
  if (normalized === 'fr' || normalized === 'french') return 'French';
  return value || 'English';
};

const getInstructorName = (course: Course) => {
  const instructor = course.instructor;
  if (!instructor) return 'LearnSpace Instructor';
  if (typeof instructor === 'string') return instructor;
  return `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.email;
};

const getUserName = (user: string | AuthUser | undefined) => {
  if (!user) return 'Student';
  if (typeof user === 'string') {
    return user.length > 18 && /^[a-f0-9]{18,}$/i.test(user) ? 'Student' : user;
  }

  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Student';
};

const initialsFor = (name: string) =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'LS';

const sortLessons = (lessons: CourseModuleLesson[]) =>
  [...lessons].sort((left, right) => {
    const leftOrder = Number(left.order ?? 0);
    const rightOrder = Number(right.order ?? 0);
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return left.title.localeCompare(right.title);
  });

function BrandMark() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
      <BoltOutlined sx={{ color: purple, fontSize: 14 }} />
      <Typography sx={{ color: purple, fontWeight: 800, fontSize: '0.72rem', letterSpacing: 0 }}>
        LearnSpace
      </Typography>
    </Box>
  );
}

function TopNav() {
  const links = [
    { label: 'Features', to: '/#features' },
    { label: 'Courses', to: '/courses/explore' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'About Us', to: '/about' },
  ];

  return (
    <Box component="header" sx={{ bgcolor: '#FFFFFF', borderBottom: `1px solid ${borderColor}` }}>
      <Container maxWidth={false} sx={{ maxWidth: pageMaxWidth, mx: 'auto', px: { xs: 2, sm: 3 }, py: 0.8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <BrandMark />
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3.1 }}>
            {links.map((link) => (
              <Link
                key={link.label}
                component={RouterLink}
                to={link.to}
                underline="none"
                sx={{ color: '#475569', fontSize: '0.58rem', fontWeight: 600, '&:hover': { color: purple } }}
              >
                {link.label}
              </Link>
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Link component={RouterLink} to="/auth/login" underline="none" sx={{ color: '#334155', fontSize: '0.58rem', fontWeight: 600 }}>
              Log in
            </Link>
            <Button
              component={RouterLink}
              to="/auth/signup"
              variant="contained"
              sx={{
                minHeight: 24,
                borderRadius: 0.55,
                bgcolor: purple,
                px: 1.2,
                py: 0.35,
                fontSize: '0.55rem',
                '&:hover': { bgcolor: '#4338CA' },
              }}
            >
              Get Started
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function Footer() {
  const columns = [
    { title: 'Product', links: [{ label: 'Features', to: '/#features' }, { label: 'Pricing', to: '/pricing' }, { label: 'Integrations', to: '/docs' }] },
    { title: 'Resources', links: [{ label: 'Help Center', to: '/help-center' }, { label: 'Community', to: '/community' }, { label: 'Webinars', to: '/blog' }] },
  ];

  return (
    <Box component="footer" sx={{ mt: { xs: 6, md: 8 }, bgcolor: '#FFFFFF', borderTop: `1px solid ${borderColor}` }}>
      <Container maxWidth={false} sx={{ maxWidth: pageMaxWidth, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 4.2, md: 5.2 } }}>
        <Grid container spacing={{ xs: 3.5, md: 7 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <BrandMark />
            <Typography sx={{ color: textMuted, mt: 1.7, maxWidth: 230, lineHeight: 1.65, fontSize: '0.58rem' }}>
              Empowering educators to share knowledge and build sustainable businesses online.
            </Typography>
          </Grid>
          {columns.map((column) => (
            <Grid key={column.title} size={{ xs: 6, md: 3 }}>
              <Typography sx={{ color: textPrimary, fontWeight: 800, mb: 1.5, fontSize: '0.6rem' }}>
                {column.title}
              </Typography>
              <Stack spacing={0.9}>
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    component={RouterLink}
                    to={link.to}
                    underline="none"
                    sx={{ color: textMuted, fontSize: '0.58rem', '&:hover': { color: purple } }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Box sx={{ borderTop: '1px solid #EDF1F6' }}>
        <Container maxWidth={false} sx={{ maxWidth: pageMaxWidth, mx: 'auto', px: { xs: 2, sm: 3 }, py: 1.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.52rem' }}>
              (c) 2024 LearnSpace Inc. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Link component={RouterLink} to="/privacy" underline="none" sx={{ color: textMuted, fontSize: '0.52rem' }}>
                Privacy
              </Link>
              <Link component={RouterLink} to="/terms" underline="none" sx={{ color: textMuted, fontSize: '0.52rem' }}>
                Terms
              </Link>
              <Typography sx={{ color: textMuted, fontSize: '0.52rem', fontWeight: 800 }}>X</Typography>
              <Typography sx={{ color: textMuted, fontSize: '0.52rem', fontWeight: 800 }}>in</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography component="h2" sx={{ color: textPrimary, fontWeight: 900, fontSize: '0.82rem', lineHeight: 1.25, mb: 1.25 }}>
      {children}
    </Typography>
  );
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.7, minWidth: 0 }}>
      <CheckOutlined sx={{ color: textPrimary, fontSize: 13, mt: 0.15, flexShrink: 0 }} />
      <Typography sx={{ color: '#334155', fontSize: '0.58rem', lineHeight: 1.65 }}>
        {children}
      </Typography>
    </Box>
  );
}

function PriceFeature({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ width: 15, height: 15, color: '#475569', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        {icon}
      </Box>
      <Typography sx={{ color: '#334155', fontSize: '0.56rem', lineHeight: 1.35 }}>{label}</Typography>
    </Box>
  );
}

function StarRow({ value, size = 13 }: { value: number; size?: number }) {
  const rounded = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.1 }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <StarRounded
          key={index}
          sx={{
            color: index < rounded ? '#F59E0B' : '#CBD5E1',
            fontSize: size,
          }}
        />
      ))}
    </Box>
  );
}

export default function CourseDetailPage({ embedded = false }: { embedded?: boolean }) {
  const navigate = useNavigate();
  const { courseSlug } = useParams();
  const courseIdentifier = courseSlug || demoCourse.slug || demoCourse._id;
  const isDemoCourseRoute = demoCourseIdentifiers.has(courseIdentifier);
  const { data: fetchedCourse, isLoading, error } = useGetCourseByIdQuery(courseIdentifier, { skip: !courseIdentifier });
  const [enrollInCourse] = useEnrollInCourseMutation();
  const [actionError, setActionError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[] | null>(null);

  const course = (fetchedCourse || (isDemoCourseRoute ? demoCourse : undefined)) as CourseDetailExtras | undefined;
  const instructorName = course ? getInstructorName(course) : 'LearnSpace Instructor';
  const instructor = course?.instructor && typeof course.instructor !== 'string' ? course.instructor : undefined;
  const thumbnail = sanitizeHttpUrl(course?.thumbnail) || heroLaptop;
  const price = Number(course?.pricing?.amount || 0);
  const currency = course?.pricing?.currency || 'USD';
  const isFreeCourse = price <= 0;

  const sections = useMemo<CourseSection[]>(() => {
    const modules = [...((course?.modules || []) as CourseModuleWithSummary[])].sort((left, right) => {
      const leftOrder = Number(left.order ?? 0);
      const rightOrder = Number(right.order ?? 0);
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      return left.title.localeCompare(right.title);
    });

    return modules.map((moduleItem, index) => {
      const lessons = sortLessons(moduleItem.lessons || []);
      const durationMinutes =
        Number(moduleItem.durationMinutes || 0)
        || lessons.reduce((sum, lesson) => sum + Number(lesson.duration || 0), 0);

      return {
        id: moduleItem._id || `${moduleItem.title}-${index}`,
        title: moduleItem.title || `Section ${index + 1}`,
        lessonCount: Number(moduleItem.lectureCount || 0) || lessons.length,
        durationMinutes,
        lessons,
      };
    });
  }, [course?.modules]);

  const totalLessons = useMemo(() => sections.reduce((sum, section) => sum + section.lessonCount, 0), [sections]);
  const totalDurationMinutes = useMemo(
    () => Number(course?.duration || 0) || sections.reduce((sum, section) => sum + section.durationMinutes, 0),
    [course?.duration, sections],
  );
  const originalPrice = Number(course?.originalPrice || 0)
    || (price > 0 && Number(course?.pricing?.discount?.percentage || 0) > 0
      ? price / (1 - Number(course?.pricing?.discount?.percentage || 0) / 100)
      : 0);
  const discountPercent = originalPrice > price && price > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const displayReviews = useMemo<DisplayReview[]>(
    () =>
      (course?.reviews || []).slice(0, 2).map((review, index) => {
        const name = getUserName(review.user);
        return {
          id: `${name}-${review.createdAt || index}`,
          name,
          avatar: initialsFor(name),
          rating: Number(review.rating || 0),
          createdAt: review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
          comment: review.comment || '',
        };
      }),
    [course?.reviews],
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((current) => (
      (current ?? (sections[0] ? [sections[0].id] : [])).includes(sectionId)
        ? (current ?? (sections[0] ? [sections[0].id] : [])).filter((entry) => entry !== sectionId)
        : [...(current ?? (sections[0] ? [sections[0].id] : [])), sectionId]
    ));
  };

  const toggleAllSections = () => {
    const activeExpandedSections = expandedSections ?? (sections[0] ? [sections[0].id] : []);
    if (activeExpandedSections.length === sections.length) {
      setExpandedSections(sections[0] ? [sections[0].id] : []);
      return;
    }
    setExpandedSections(sections.map((section) => section.id));
  };

  const goToCheckout = () => {
    if (!course?._id) return;
    navigate(`/checkout?courseId=${encodeURIComponent(course._id)}`);
  };

  const handlePrimaryAction = async () => {
    setActionError(null);
    if (!course?._id) return;

    if (!isFreeCourse) {
      try {
        await api.post('/api/cart', { courseId: course._id });
        setActionError(null);
        navigate('/cart');
      } catch (requestError) {
        setActionError(normalizeApiError(requestError).message || 'Unable to add to cart.');
      }
      return;
    }

    try {
      await enrollInCourse(course._id).unwrap();
      navigate(`/courses/${course._id}/learn`);
    } catch (requestError) {
      setActionError(normalizeApiError(requestError).message || 'Unable to enroll in this course right now.');
    }
  };

  const handleShare = async () => {
    setShareMessage(null);
    try {
      const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
      if (!shareUrl) return;
      if (navigator.share) {
        await navigator.share({ title: course?.title, url: shareUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage('Course link copied.');
      }
    } catch (err) {
      if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('cancel'))) {
        return;
      }
      console.error('Share failed:', err);
      setShareMessage('Unable to share: Please try copying the link manually.');
    }
  };

  const showError = Boolean(error && !course);
  const showLoading = isLoading && !course;
  const showContentUnavailable = !showLoading && !course;
  const activeExpandedSections = expandedSections ?? (sections[0] ? [sections[0].id] : []);
  const learnItems = course?.learningOutcomes || [];
  const requirements = course?.prerequisites || [];
  const summaryDescription = course?.shortDescription || course?.description || '';
  const descriptionParagraphs = (course?.description || '').split(/\n+/).filter(Boolean);
  const contentSummary = `${sections.length} sections | ${totalLessons.toLocaleString()} lectures | ${formatCompactDuration(totalDurationMinutes)} total length`;
  const instructorAvatar = sanitizeHttpUrl(instructor?.avatar);
  const instructorHeadline = course?.instructorHeadline || instructor?.bio || 'Instructor at LearnSpace';
  const enrollmentCount = Number(course?.enrollmentCount || 0);
  const ratingAverage = Number(course?.rating?.average || 0);
  const ratingCount = Number(course?.rating?.count || displayReviews.length);
  const includedVideoHours = course?.includedVideoHours || formatHoursDecimal(totalDurationMinutes);

  return (
    <Box sx={{ minHeight: embedded ? 'auto' : '100vh', bgcolor: embedded ? 'transparent' : '#F5F7FB' }}>
      {embedded ? null : <TopNav />}

      <Container
        maxWidth={false}
        sx={{
          maxWidth: embedded ? 1020 : pageMaxWidth,
          mx: 'auto',
          px: embedded ? 0 : { xs: 2, sm: 3 },
          pt: embedded ? 0 : { xs: 2.6, md: 3.3 },
          pb: embedded ? 0 : { xs: 4, md: 5.8 },
        }}
      >
        {showError ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
            {normalizeApiError(error).message || 'Unable to load course details.'}
          </Alert>
        ) : null}

        {actionError ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
            {actionError}
          </Alert>
        ) : null}

        {shareMessage ? (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 1 }}>
            {shareMessage}
          </Alert>
        ) : null}

        {showLoading ? (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 1 }}>
            Loading course details...
          </Alert>
        ) : null}

        {showContentUnavailable ? (
          <Alert severity="warning" sx={{ borderRadius: 1 }}>
            Course details are unavailable.
          </Alert>
        ) : null}

        {course ? (
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={3.2}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, flexWrap: 'wrap', mb: 1.05 }}>
                    {['Home', course.category || 'Course', course.subcategory || course.level || 'Learning'].map((crumb, index) => (
                      <Box key={`${crumb}-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
                        <Link
                          component={RouterLink}
                          to={index === 0 ? '/' : '/courses/explore'}
                          underline="none"
                          sx={{ color: index === 0 ? purple : textMuted, fontSize: '0.5rem', fontWeight: 600 }}
                        >
                          {crumb}
                        </Link>
                        {index < 2 ? (
                          <Typography sx={{ color: '#94A3B8', fontSize: '0.5rem' }}>/</Typography>
                        ) : null}
                      </Box>
                    ))}
                  </Box>

                  <Typography
                    component="h1"
                    sx={{
                      color: textPrimary,
                      fontWeight: 900,
                      letterSpacing: 0,
                      fontSize: { xs: '1.5rem', md: '1.58rem' },
                      lineHeight: 1.12,
                      maxWidth: 560,
                    }}
                  >
                    {course.title}
                  </Typography>
                  <Typography sx={{ color: '#475569', mt: 1.05, maxWidth: 590, fontSize: '0.61rem', lineHeight: 1.7 }}>
                    {summaryDescription}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1.35 }}>
                    {course?.isBestseller && (
                      <Box sx={{ bgcolor: '#FACC15', color: '#713F12', px: 0.7, py: 0.25, borderRadius: 0.35, fontSize: '0.49rem', fontWeight: 900 }}>
                        BESTSELLER
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <Typography sx={{ color: '#B45309', fontSize: '0.55rem', fontWeight: 900 }}>
                        {ratingAverage.toFixed(1)}
                      </Typography>
                      <StarRow value={ratingAverage} size={11} />
                      <Typography sx={{ color: textMuted, fontSize: '0.54rem' }}>
                        ({ratingCount.toLocaleString()} ratings)
                      </Typography>
                    </Box>
                    <Typography sx={{ color: textMuted, fontSize: '0.54rem' }}>
                      {enrollmentCount.toLocaleString()} students
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.3, flexWrap: 'wrap', mt: 1.15 }}>
                    <Typography sx={{ color: textMuted, fontSize: '0.54rem' }}>
                      Created by{' '}
                      <Box component="span" sx={{ color: purple, fontWeight: 700 }}>
                        {instructorName}
                      </Box>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: textMuted }}>
                      <CalendarMonthOutlined sx={{ fontSize: 11 }} />
                      <Typography sx={{ fontSize: '0.54rem' }}>{formatUpdatedLabel(course.updatedAt)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: textMuted }}>
                      <LanguageOutlined sx={{ fontSize: 11 }} />
                      <Typography sx={{ fontSize: '0.54rem' }}>{languageLabel(course.language)}</Typography>
                    </Box>
                  </Box>
                </Box>

                {learnItems.length > 0 ? (
                  <Card sx={{ borderRadius: 1, borderColor, bgcolor: '#FFFFFF' }}>
                    <CardContent sx={{ p: 1.55, '&:last-child': { pb: 1.55 } }}>
                      <SectionTitle>What you&apos;ll learn</SectionTitle>
                      <Grid container spacing={{ xs: 1.15, md: 1.25 }}>
                        {learnItems.slice(0, 6).map((item) => (
                          <Grid key={item} size={{ xs: 12, md: 6 }}>
                            <CheckItem>{item}</CheckItem>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                ) : null}

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                    <Box>
                      <SectionTitle>Course Content</SectionTitle>
                      <Typography sx={{ color: textMuted, fontSize: '0.54rem' }}>
                        {contentSummary}
                      </Typography>
                    </Box>
                    {sections.length > 0 ? (
                      <Button
                        variant="text"
                        onClick={toggleAllSections}
                        sx={{ minWidth: 0, p: 0, color: purple, fontSize: '0.52rem', fontWeight: 800 }}
                      >
                        Expand all sections
                      </Button>
                    ) : null}
                  </Box>

                  {sections.length > 0 ? (
                    <Box sx={{ border: `1px solid ${borderColor}`, bgcolor: '#FFFFFF', borderRadius: 0.75, overflow: 'hidden' }}>
                      {sections.map((section, index) => {
                        const isExpanded = activeExpandedSections.includes(section.id);
                        return (
                          <Accordion
                            key={section.id}
                            expanded={isExpanded}
                            onChange={() => toggleSection(section.id)}
                            disableGutters
                            square
                            sx={{
                              boxShadow: 'none',
                              border: 0,
                              borderTop: index === 0 ? 0 : `1px solid ${borderColor}`,
                              '&:before': { display: 'none' },
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMore sx={{ color: '#475569', fontSize: 17 }} />}
                              sx={{
                                minHeight: 34,
                                bgcolor: '#F8FAFC',
                                px: 1.2,
                                py: 0,
                                '& .MuiAccordionSummary-content': { my: 0.65, alignItems: 'center', justifyContent: 'space-between', gap: 1 },
                              }}
                            >
                              <Typography sx={{ color: textPrimary, fontSize: '0.58rem', fontWeight: 800 }}>
                                {section.title}
                              </Typography>
                              <Typography sx={{ color: textMuted, fontSize: '0.52rem', whiteSpace: 'nowrap' }}>
                                {section.lessonCount} lectures | {formatCompactDuration(section.durationMinutes)}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                              {section.lessons.length > 0 ? (
                                <Stack>
                                  {section.lessons.map((lesson) => (
                                    <Box
                                      key={lesson._id || lesson.title}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 1,
                                        px: 1.25,
                                        py: 0.75,
                                        borderTop: `1px solid ${borderColor}`,
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                                        <PlayCircleOutlined sx={{ color: '#94A3B8', fontSize: 13, flexShrink: 0 }} />
                                        <Typography sx={{ color: '#334155', fontSize: '0.55rem', lineHeight: 1.4 }} noWrap>
                                          {lesson.title}
                                        </Typography>
                                      </Box>
                                      <Typography sx={{ color: textMuted, fontSize: '0.52rem', flexShrink: 0 }}>
                                        {formatCompactDuration(Number(lesson.duration || 0))}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Stack>
                              ) : (
                                <Box sx={{ px: 1.25, py: 0.9, borderTop: `1px solid ${borderColor}` }}>
                                  <Typography sx={{ color: textMuted, fontSize: '0.55rem' }}>
                                    Lesson titles will appear here as the instructor publishes them.
                                  </Typography>
                                </Box>
                              )}
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography sx={{ color: textMuted, fontSize: '0.58rem' }}>
                      No module content has been published for this course yet.
                    </Typography>
                  )}
                </Box>

                {requirements.length > 0 ? (
                  <Box>
                    <SectionTitle>Requirements</SectionTitle>
                    <Stack spacing={0.55}>
                      {requirements.map((item) => (
                        <Typography key={item} sx={{ color: '#334155', fontSize: '0.58rem', lineHeight: 1.6 }}>
                          {item}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                ) : null}

                {descriptionParagraphs.length > 0 ? (
                  <Box>
                    <SectionTitle>Description</SectionTitle>
                    <Stack spacing={1.05}>
                      {descriptionParagraphs.map((paragraph) => (
                        <Typography key={paragraph} sx={{ color: '#475569', fontSize: '0.58rem', lineHeight: 1.78 }}>
                          {paragraph}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                ) : null}

                <Box>
                  <SectionTitle>Instructor</SectionTitle>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                    <Avatar
                      src={instructorAvatar || undefined}
                      alt={instructorName}
                      sx={{ width: 44, height: 44, bgcolor: '#92400E', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 900 }}
                    >
                      {initialsFor(instructorName)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: textPrimary, fontWeight: 900, fontSize: '0.66rem' }}>
                        {instructorName}
                      </Typography>
                      <Typography sx={{ color: textMuted, fontSize: '0.54rem', mt: 0.15 }}>
                        {instructorHeadline}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap', mt: 0.65 }}>
                        <Typography sx={{ color: textMuted, fontSize: '0.52rem' }}>
                          {ratingAverage.toFixed(1)} Rating
                        </Typography>
                        <Typography sx={{ color: textMuted, fontSize: '0.52rem' }}>
                          {enrollmentCount.toLocaleString()} Students
                        </Typography>
                        <Typography sx={{ color: textMuted, fontSize: '0.52rem' }}>
                          {sections.length} Sections
                        </Typography>
                      </Box>
                      {instructor?.bio ? (
                        <Typography sx={{ color: '#475569', fontSize: '0.56rem', lineHeight: 1.7, mt: 0.8 }}>
                          {instructor.bio}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <SectionTitle>Reviews</SectionTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4, mb: 1.8 }}>
                    <Box>
                      <Typography sx={{ color: '#F59E0B', fontWeight: 900, fontSize: '1.45rem', lineHeight: 1 }}>
                        {ratingAverage.toFixed(1)}
                      </Typography>
                      <StarRow value={ratingAverage} size={13} />
                      <Typography sx={{ color: textMuted, fontSize: '0.52rem', mt: 0.25 }}>
                        Course Rating
                      </Typography>
                    </Box>
                  </Box>

                  {displayReviews.length > 0 ? (
                    <Stack spacing={1.75}>
                      {displayReviews.map((review) => (
                        <Box key={review.id} sx={{ borderTop: `1px solid ${borderColor}`, pt: 1.45 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: '#E2E8F0', color: textPrimary, fontSize: '0.55rem', fontWeight: 900 }}>
                              {review.avatar}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap' }}>
                                <Typography sx={{ color: textPrimary, fontWeight: 900, fontSize: '0.58rem' }}>
                                  {review.name}
                                </Typography>
                                <StarRow value={review.rating} size={10} />
                                <Typography sx={{ color: textMuted, fontSize: '0.5rem' }}>
                                  {review.createdAt}
                                </Typography>
                              </Box>
                              <Typography sx={{ color: '#475569', fontSize: '0.55rem', lineHeight: 1.72, mt: 0.55 }}>
                                {review.comment}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography sx={{ color: textMuted, fontSize: '0.58rem' }}>
                      No reviews yet.
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1.7} sx={{ position: { md: 'sticky' }, top: embedded ? 24 : 70 }}>
                <Card sx={{ borderRadius: 1, borderColor, bgcolor: '#FFFFFF', overflow: 'hidden' }}>
                  <Box sx={{ height: 137, bgcolor: '#F1F5F9', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src={thumbnail}
                      alt={course.title}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </Box>
                  <CardContent sx={{ p: 1.45, '&:last-child': { pb: 1.45 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, flexWrap: 'wrap' }}>
                      <Typography sx={{ color: textPrimary, fontSize: '1.04rem', fontWeight: 900 }}>
                        {isFreeCourse ? 'Free' : formatCurrency(price, currency)}
                      </Typography>
                      {!isFreeCourse && originalPrice > price ? (
                        <>
                          <Typography sx={{ color: '#94A3B8', fontSize: '0.58rem', textDecoration: 'line-through', fontWeight: 700 }}>
                            {formatCurrency(originalPrice, currency)}
                          </Typography>
                          <Typography sx={{ color: '#DC2626', fontSize: '0.55rem', fontWeight: 900 }}>
                            {discountPercent}% OFF
                          </Typography>
                        </>
                      ) : null}
                    </Box>
                    {!isFreeCourse && (course.offerEndsIn || (course.listPrice > course.currentPrice && course.discountActive)) ? (
                      <Typography sx={{ color: '#DC2626', fontSize: '0.52rem', fontWeight: 800, mt: 0.6 }}>
                        {course.offerEndsIn || 'Limited time offer'}
                      </Typography>
                    ) : null}

                    <Stack spacing={0.85} sx={{ mt: 1.15 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => void handlePrimaryAction()}
                        sx={{ bgcolor: purple, borderRadius: 0.55, minHeight: 31, fontSize: '0.58rem', '&:hover': { bgcolor: '#4338CA' } }}
                      >
                        {isFreeCourse ? 'Enroll Now' : 'Add to Cart'}
                      </Button>
                      <Button
                        variant="text"
                        fullWidth
                        onClick={goToCheckout}
                        sx={{ color: textPrimary, minHeight: 28, fontSize: '0.58rem', fontWeight: 800 }}
                      >
                        Buy Now
                      </Button>
                    </Stack>

                    <Typography sx={{ color: textMuted, textAlign: 'center', fontSize: '0.48rem', mt: 0.75 }}>
                      30-Day Money-Back Guarantee
                    </Typography>

                    <Box sx={{ mt: 1.4 }}>
                      <Typography sx={{ color: textPrimary, fontWeight: 900, fontSize: '0.58rem', mb: 0.8 }}>
                        This course includes:
                      </Typography>
                      <Stack spacing={0.7}>
                        <PriceFeature icon={<OndemandVideoOutlined sx={{ fontSize: 13 }} />} label={`${includedVideoHours} on-demand video`} />
                        <PriceFeature icon={<ArticleOutlined sx={{ fontSize: 13 }} />} label={`${course?.articleCount ?? 0} articles & ${course?.downloadCount ?? 0} downloads`} />
                        <PriceFeature icon={<CloudDownloadOutlined sx={{ fontSize: 13 }} />} label="Access on mobile and TV" />
                        <PriceFeature icon={<AllInclusiveOutlined sx={{ fontSize: 13 }} />} label="Full lifetime access" />
                        <PriceFeature icon={<WorkspacePremiumOutlined sx={{ fontSize: 13 }} />} label="Certificate of completion" />
                      </Stack>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1.35 }}>
                      <Button
                        variant="text"
                        startIcon={<ShareOutlined sx={{ fontSize: 12 }} />}
                        onClick={() => void handleShare()}
                        sx={{ color: textPrimary, minWidth: 0, p: 0, fontSize: '0.52rem', fontWeight: 800 }}
                      >
                        Share
                      </Button>
                      <Button
                        variant="text"
                        startIcon={<CardGiftcardOutlined sx={{ fontSize: 12 }} />}
                        onClick={goToCheckout}
                        sx={{ color: textPrimary, minWidth: 0, p: 0, fontSize: '0.52rem', fontWeight: 800 }}
                      >
                        Gift this course
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 1, borderColor, bgcolor: '#FFFFFF' }}>
                  <CardContent sx={{ p: 1.35, '&:last-child': { pb: 1.35 } }}>
                    <Typography sx={{ color: textPrimary, fontWeight: 900, fontSize: '0.58rem' }}>
                      Training 5 or more people?
                    </Typography>
                    <Typography sx={{ color: textMuted, fontSize: '0.52rem', lineHeight: 1.5, mt: 0.45 }}>
                      Get your team access to 6,500+ top courses, anytime, anywhere.
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/contact"
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 1.05, minHeight: 28, borderRadius: 0.55, borderColor, color: textPrimary, fontSize: '0.52rem' }}
                    >
                      LearnSpace Business
                    </Button>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        ) : null}
      </Container>

      {embedded ? null : <Footer />}
    </Box>
  );
}
