import { useMemo, useState } from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  Stack,
  Typography,
} from '@mui/material';
import {
  CheckCircleOutlined,
  ExpandMore,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { normalizeApiError } from '../../services/api';
import { useEnrollInCourseMutation, useGetCourseByIdQuery, useGetCourseModulesQuery } from '../../store/api/courseApi';
import { theme } from '../../theme';

type LessonSection = {
  id: string;
  title: string;
  lessonCount: number;
  durationMinutes: number;
  items: string[];
};

function TopNav() {
  const links = [
    { label: 'Features', href: '/home#features' },
    { label: 'Courses', href: '/home#courses' },
    { label: 'Pricing', href: '/home#pricing' },
    { label: 'About Us', href: '/home#testimonials' },
  ];

  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                bgcolor: 'primary.main',
                color: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
              }}
            >
              LS
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              LearnSpace
            </Typography>
          </Box>

          <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {links.map((link) => (
              <Button key={link.label} component={RouterLink} to={link.href} variant="text" sx={{ color: 'text.primary', px: 0, minWidth: 'auto' }}>
                {link.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button component={RouterLink} to="/auth/login" variant="text" sx={{ color: 'primary.main' }}>
              Log in
            </Button>
            <Button component={RouterLink} to="/auth/signup" variant="contained">
              Get Started
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function CourseMetaItem({ label }: { label: string }) {
  return (
    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
      {label}
    </Typography>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <ListItem disableGutters sx={{ alignItems: 'flex-start', py: 0.75 }}>
      <ListItemIcon sx={{ minWidth: 32, mt: 0.25, color: 'success.main' }}>
        <CheckCircleOutlined />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, lineHeight: 1.7 }}>
            {text}
          </Typography>
        }
      />
    </ListItem>
  );
}

function formatDuration(totalMinutes: number) {
  const mins = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  if (hours > 0 && rest > 0) return `${hours}h ${rest}m`;
  if (hours > 0) return `${hours}h`;
  return `${rest}m`;
}

export default function CourseDetailPage({ embedded = false }: { embedded?: boolean }) {
  const navigate = useNavigate();
  const { courseSlug } = useParams();
  const [expanded, setExpanded] = useState<string | false>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: course, isLoading, error } = useGetCourseByIdQuery(courseSlug || '');
  const activeCourseId = course?._id;
  const [enrollInCourse] = useEnrollInCourseMutation();
  const { data: modulesData = [] } = useGetCourseModulesQuery(activeCourseId || '', { skip: !activeCourseId });

  const instructorName = useMemo(() => {
    if (!course?.instructor || typeof course.instructor === 'string') {
      return typeof course?.instructor === 'string' ? course.instructor : 'Unknown instructor';
    }
    return `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() || course.instructor.email;
  }, [course?.instructor]);

  const sections = useMemo<LessonSection[]>(
    () =>
      modulesData.map((moduleItem, index) => ({
        id: moduleItem._id || String(index),
        title: moduleItem.title || `Module ${index + 1}`,
        lessonCount: moduleItem.lessons?.length || 0,
        durationMinutes: (moduleItem.lessons || []).reduce((sum, lesson) => sum + Number(lesson.duration || 0), 0),
        items: (moduleItem.lessons || []).map((lesson) => lesson.title).filter(Boolean),
      })),
    [modulesData],
  );

  const totalLessons = useMemo(
    () => sections.reduce((sum, section) => sum + section.lessonCount, 0),
    [sections],
  );

  const totalDurationMinutes = useMemo(
    () =>
      Number(course?.duration || 0)
      || sections.reduce((sum, section) => sum + section.durationMinutes, 0),
    [course?.duration, sections],
  );

  const learnItems = useMemo(() => course?.learningOutcomes || [], [course?.learningOutcomes]);
  const requirements = useMemo(() => course?.prerequisites || [], [course?.prerequisites]);
  const reviews = useMemo(
    () =>
      (course?.reviews || []).map((review, index) => ({
        id: `${review.user || 'user'}-${review.createdAt || index}`,
        name: review.user ? String(review.user) : 'Reviewer',
        avatar: review.user ? String(review.user).slice(-2).toUpperCase() : 'R',
        rating: Number(review.rating || 0),
        date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently',
        text: review.comment || 'No written review',
      })),
    [course?.reviews],
  );
  const updatedLabel = useMemo(() => {
    const timestamp = course?.updatedAt || course?.createdAt;
    if (!timestamp) {
      return 'Updated recently';
    }

    return `Updated ${new Date(timestamp).toLocaleDateString()}`;
  }, [course?.createdAt, course?.updatedAt]);

  const includes = useMemo(() => {
    const items: string[] = [];
    if (totalDurationMinutes > 0) {
      items.push(`${formatDuration(totalDurationMinutes)} on-demand content`);
    }
    if (sections.length > 0) {
      items.push(`${sections.length} learning modules`);
    }
    if (totalLessons > 0) {
      items.push(`${totalLessons} lessons`);
    }
    if (course?.language) {
      items.push(`Language: ${course.language.toUpperCase()}`);
    }
    return items;
  }, [course?.language, sections.length, totalDurationMinutes, totalLessons]);

  const price = Number(course?.pricing?.amount || 0);

  const handleStartLearning = async () => {
    setActionError(null);
    if (!activeCourseId) {
      return;
    }

    try {
      await enrollInCourse(activeCourseId).unwrap();
      navigate(`/courses/${activeCourseId}/learn`);
    } catch (requestError) {
      setActionError(normalizeApiError(requestError).message || 'Unable to start this course right now.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {!embedded ? <TopNav /> : null}

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {normalizeApiError(error).message || 'Unable to load course details.'}
          </Alert>
        ) : null}
        {actionError ? <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert> : null}
        {isLoading ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Loading course details...
          </Alert>
        ) : null}

        {!isLoading && !course ? (
          <Alert severity="warning">Course details are unavailable.</Alert>
        ) : null}

        {course ? (
          <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={3.5}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 800 }}>
                    {course.category || 'Course'} {course.level ? `> ${course.level}` : ''}
                  </Typography>
                  <Typography variant="h3" component="h1" sx={{ mt: 1.5, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.06 }}>
                    {course.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1.75, color: 'text.secondary', maxWidth: 760, lineHeight: 1.8 }}>
                    {course.shortDescription || course.description}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mt: 2.5 }}>
                    <CourseMetaItem label={`${Number(course.rating?.average || 0).toFixed(1)} (${course.rating?.count || 0} reviews)`} />
                    <CourseMetaItem label={`${Number(course.enrollmentCount || 0).toLocaleString()} students`} />
                    <CourseMetaItem label={formatDuration(totalDurationMinutes)} />
                    <CourseMetaItem label={`${totalLessons} lessons`} />
                    <CourseMetaItem label={course.language || 'N/A'} />
                    <CourseMetaItem label={updatedLabel} />
                  </Box>
                </Box>

                {learnItems.length > 0 ? (
                  <Card>
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                        What you'll learn
                      </Typography>
                      <Grid container spacing={1.5}>
                        {learnItems.map((item) => (
                          <Grid key={item} size={{ xs: 12, md: 6 }}>
                            <CheckItem text={item} />
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                ) : null}

                <Card>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                      Course Content
                    </Typography>
                    {sections.length > 0 ? (
                      <Stack spacing={1.25}>
                        {sections.map((section) => (
                          <Accordion
                            key={section.id}
                            expanded={expanded === section.id}
                            onChange={(_, isExpanded) => setExpanded(isExpanded ? section.id : false)}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: '14px !important',
                              boxShadow: 'none',
                              '&:before': { display: 'none' },
                              overflow: 'hidden',
                            }}
                          >
                            <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2.25, py: 0.75 }}>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                  {section.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                                  {section.lessonCount} lessons · {formatDuration(section.durationMinutes)}
                                </Typography>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 0, pb: 2.25 }}>
                              <List dense>
                                {section.items.map((item) => (
                                  <ListItem key={item} disableGutters sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>
                                      <CheckCircleOutlined fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {item}
                                        </Typography>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No module content has been published for this course yet.
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {requirements.length > 0 ? (
                  <Card>
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                        Requirements
                      </Typography>
                      <List disablePadding>
                        {requirements.map((item) => (
                          <CheckItem key={item} text={item} />
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                ) : null}

                <Card>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                      Detailed Description
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.85 }}>
                      {course.description}
                    </Typography>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                      Instructor
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <Avatar
                        src={typeof course.instructor === 'object' ? course.instructor.avatar : undefined}
                        alt={instructorName}
                        sx={{ width: 84, height: 84 }}
                      >
                        {instructorName.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 240 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          {instructorName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, lineHeight: 1.75 }}>
                          {typeof course.instructor === 'object' ? course.instructor.bio || 'Instructor profile available.' : 'Instructor profile available.'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Reviews
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mt: 1, flexWrap: 'wrap' }}>
                      <Rating value={Number(course.rating?.average || 0)} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {Number(course.rating?.average || 0).toFixed(1)} course rating
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        ({course.rating?.count || 0} reviews)
                      </Typography>
                    </Box>

                    <Stack spacing={2.5} sx={{ mt: 3 }}>
                      {reviews.length > 0 ? (
                        reviews.map((review) => (
                          <Box key={review.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Avatar sx={{ width: 44, height: 44, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', fontWeight: 800 }}>
                              {review.avatar}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                  {review.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {review.date}
                                </Typography>
                              </Box>
                              <Rating value={review.rating} readOnly size="small" sx={{ mt: 0.5 }} />
                              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, lineHeight: 1.8 }}>
                                {review.text}
                              </Typography>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No reviews yet.
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Box sx={{ position: { lg: 'sticky' }, top: 100 }}>
                <Card sx={{ overflow: 'visible' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.default',
                      }}
                    >
                      <Box
                        sx={{
                          height: 200,
                          backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          bgcolor: course.thumbnail ? 'transparent' : 'background.default',
                        }}
                      />
                      <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                          {course.title}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
                        {price > 0 ? `$${price.toFixed(2)}` : 'Free'}
                      </Typography>
                    </Box>

                    <Stack spacing={1.25} sx={{ mt: 2.5 }}>
                      <Button variant="contained" fullWidth sx={{ py: 1.4 }} onClick={() => void handleStartLearning()} disabled={!activeCourseId}>
                        Start Learning
                      </Button>
                      {activeCourseId ? (
                        <Button component={RouterLink} to={`/courses/${activeCourseId}/learn`} variant="outlined" fullWidth sx={{ py: 1.4 }}>
                          Continue to Lessons
                        </Button>
                      ) : null}
                      <Button
                        variant="outlined"
                        onClick={() => navigate(activeCourseId ? `/checkout?courseId=${encodeURIComponent(activeCourseId)}` : '/checkout')}
                        fullWidth
                        sx={{ py: 1.4 }}
                      >
                        Add to Cart
                      </Button>
                    </Stack>

                    {includes.length > 0 ? (
                      <>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, mt: 2.5 }}>
                          This course includes
                        </Typography>
                        <Stack spacing={1.25}>
                          {includes.map((item) => (
                            <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                              <CheckCircleOutlined sx={{ color: 'success.main', mt: 0.15 }} fontSize="small" />
                              <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                                {item}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </>
                    ) : null}
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        ) : null}
      </Container>
    </Box>
  );
}
