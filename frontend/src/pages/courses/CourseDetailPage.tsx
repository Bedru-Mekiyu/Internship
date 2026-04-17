import { useMemo, useState, type ReactNode } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
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
  AccessTimeOutlined,
  CheckCircleOutlined,
  ExpandMore,
  LanguageOutlined,
  PlayCircleOutlined,
  PeopleOutlined,
  Star,
  VerifiedOutlined,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useCourses } from '../../hooks/useCourses';
import { normalizeApiError } from '../../services/api';
import { theme } from '../../theme';

type LessonSection = {
  title: string;
  lessons: number;
  duration: string;
  items: string[];
};

const courseLessons: LessonSection[] = [
  {
    title: 'Introduction to Web Design',
    lessons: 5,
    duration: '1h 15m',
    items: ['Course overview', 'Design fundamentals', 'Career roadmap', 'Tools setup', 'Project walkthrough'],
  },
  {
    title: 'UX Research and Strategy',
    lessons: 8,
    duration: '2h 40m',
    items: ['User research methods', 'Personas and journeys', 'Information architecture', 'Wireframing', 'Usability testing'],
  },
  {
    title: 'Figma Mastery',
    lessons: 7,
    duration: '2h 05m',
    items: ['Interface basics', 'Auto layout', 'Components', 'Prototyping', 'Design systems'],
  },
  {
    title: 'HTML, CSS and Responsive Layouts',
    lessons: 10,
    duration: '3h 10m',
    items: ['Semantic HTML', 'Modern CSS', 'Flexbox', 'Grid', 'Responsive workflows'],
  },
];

const learnItems = [
  'Build responsive website layouts from scratch',
  'Create polished UI designs in Figma',
  'Apply UX research and product thinking',
  'Understand HTML, CSS, and modern design systems',
  'Ship real-world portfolio projects',
  'Present work professionally to clients and employers',
];

const requirements = [
  'No prior design experience required',
  'A laptop with internet access',
  'Basic curiosity about digital products',
  'Free Figma account recommended',
];

const reviews = [
  {
    name: 'Olivia Brown',
    avatar: 'OB',
    rating: 5,
    date: '2 weeks ago',
    text: 'The structure is excellent. I went from basic mockups to building a complete product portfolio. The explanations are practical and easy to follow.',
  },
  {
    name: 'Darren Lee',
    avatar: 'DL',
    rating: 5,
    date: '1 month ago',
    text: 'Clear lessons, great pacing, and strong project guidance. The Figma and CSS modules were especially valuable for me.',
  },
];

const includes = [
  '30+ hours on-demand video',
  '12 articles',
  '8 downloadable resources',
  'Full lifetime access',
  'Access on mobile and TV',
  'Certificate of completion',
];

function TopNav() {
  const links = [
    { label: 'Features', href: '/home#features' },
    { label: 'Courses', href: '/home#courses' },
    { label: 'Pricing', href: '/home#pricing' },
    { label: 'About Us', href: '/home#testimonials' },
  ];

  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E2E8F0' }}>
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
                boxShadow: '0 10px 20px rgba(0,102,255,0.18)',
              }}
            >
              <PlayCircleOutlined />
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

function CourseMetaChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Chip
      icon={<Box sx={{ display: 'inherit', color: 'inherit' }}>{icon}</Box>}
      label={label}
      sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 700 }}
    />
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

function LaptopMockup() {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 4,
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 18px 40px rgba(15,23,42,0.10)',
      }}
    >
      <Box
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          background: 'linear-gradient(135deg, rgba(0,102,255,0.06), rgba(15,23,42,0.04))',
        }}
      >
        <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#EF4444' }} />
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
        </Box>
        <Box sx={{ p: 3, minHeight: 220, background: 'linear-gradient(160deg, #FFFFFF 0%, #EEF5FF 100%)' }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  UX Design Bootcamp
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Live course dashboard
                </Typography>
              </Box>
              <Chip label="Masterclass" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700 }} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 2 }}>
              <Box sx={{ borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', p: 2.25 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  Progress
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                  86%
                </Typography>
                <Box sx={{ mt: 1.5, height: 10, borderRadius: 99, bgcolor: '#E2E8F0', overflow: 'hidden' }}>
                  <Box sx={{ width: '86%', height: '100%', bgcolor: 'primary.main' }} />
                </Box>
              </Box>
              <Box sx={{ borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', p: 2.25 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  Next lesson
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, mt: 0.5 }}>
                  Responsive grids
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>
                  12 min · Instructor guided
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default function CourseDetailPage() {
  const navigate = useNavigate();
  const { courseSlug } = useParams();
  const [expanded, setExpanded] = useState<string | false>('panel-0');
  const [actionError, setActionError] = useState<string | null>(null);
  const { courses, isLoading, error, enroll } = useCourses();
  const normalizedSlug = courseSlug || 'bootcamp-2025';

  const activeCourse = useMemo(() => {
    if (!courses.length) {
      return null;
    }

    return courses.find((course) => course.slug === normalizedSlug) ?? courses[0];
  }, [courses, normalizedSlug]);

  const instructorName = useMemo(() => {
    if (!activeCourse?.instructor) {
      return 'Marcus Johnson';
    }

    if (typeof activeCourse.instructor === 'string') {
      return activeCourse.instructor;
    }

    return `${activeCourse.instructor.firstName} ${activeCourse.instructor.lastName}`.trim() || 'Marcus Johnson';
  }, [activeCourse]);

  const activeCourseId = activeCourse?._id;

  const handleStartLearning = async () => {
    setActionError(null);

    if (!activeCourseId) {
      navigate(`/courses/${normalizedSlug}/learn`);
      return;
    }

    try {
      await enroll(activeCourseId);
      navigate(`/courses/${activeCourseId}/learn`);
    } catch (requestError) {
      const normalized = normalizeApiError(requestError);
      setActionError(normalized.message || 'Unable to start this course right now.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopNav />

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        {actionError ? (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: 'error.main', fontWeight: 700 }}>{actionError}</Typography>
          </Box>
        ) : null}

        {error ? (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: 'error.main', fontWeight: 700 }}>
              {normalizeApiError(error).message || 'Unable to load course details.'}
            </Typography>
          </Box>
        ) : null}

        {isLoading ? (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>Loading course details...</Typography>
          </Box>
        ) : null}

        <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3.5}>
              <Box>
                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 800 }}>
                  Design &gt; UX Design Bootcamps
                </Typography>
                <Typography variant="h3" component="h1" sx={{ mt: 1.5, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.06 }}>
                  {activeCourse?.title || 'Complete Web Design Bootcamp 2025: From Zero to Mastery'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1.75, color: 'text.secondary', maxWidth: 760, lineHeight: 1.8 }}>
                  {activeCourse?.shortDescription || activeCourse?.description || 'Learn UX/UI, design, Figma, HTML, CSS, and modern web design principles. Build real-world projects and start your career.'}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mt: 2.5 }}>
                  <CourseMetaChip icon={<Star fontSize="small" />} label="4.8 (238 reviews)" />
                  <CourseMetaChip icon={<PeopleOutlined fontSize="small" />} label={`${Number(activeCourse?.enrollmentCount || 12984).toLocaleString()} students`} />
                  <CourseMetaChip icon={<AccessTimeOutlined fontSize="small" />} label="32 hours" />
                  <CourseMetaChip icon={<PlayCircleOutlined fontSize="small" />} label="202 lessons" />
                  <CourseMetaChip icon={<LanguageOutlined fontSize="small" />} label={activeCourse?.language || 'English'} />
                  <CourseMetaChip icon={<VerifiedOutlined fontSize="small" />} label="Last updated Oct 2024" />
                </Box>
              </Box>

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

              <Card>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                    Course Content
                  </Typography>
                  <Stack spacing={1.25}>
                    {courseLessons.map((section, index) => (
                      <Accordion
                        key={section.title}
                        expanded={expanded === `panel-${index}`}
                        onChange={(_, isExpanded) => setExpanded(isExpanded ? `panel-${index}` : false)}
                        sx={{
                          border: '1px solid #E2E8F0',
                          borderRadius: '14px !important',
                          boxShadow: 'none',
                          '&:before': { display: 'none' },
                          overflow: 'hidden',
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2.25, py: 0.75 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                {section.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                                {section.lessons} lessons · {section.duration}
                              </Typography>
                            </Box>
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
                </CardContent>
              </Card>

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

              <Card>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Detailed Description
                  </Typography>
                  <Stack spacing={2} sx={{ color: 'text.secondary', lineHeight: 1.85 }}>
                    <Typography variant="body1">
                      This bootcamp is built for aspiring designers who want a structured, career-ready path through UX, UI, and front-end fundamentals. You will learn how to plan experiences, create interfaces, and turn concepts into polished portfolio work.
                    </Typography>
                    <Typography variant="body1">
                      Every module is focused on practical outcomes. By the end of the course, you will have designed complete web experiences, built responsive landing pages, and developed the confidence to communicate your design decisions professionally.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                    Instructor
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <Avatar
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80"
                      alt="Marcus Johnson"
                      sx={{ width: 84, height: 84 }}
                    >
                      MJ
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 240 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {instructorName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, lineHeight: 1.75 }}>
                        Product designer and front-end educator with 10+ years of experience leading digital product teams.
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1.25, mt: 2, flexWrap: 'wrap' }}>
                        <Chip label="24 courses" sx={{ bgcolor: '#F8FAFC', fontWeight: 700 }} />
                        <Chip label="88K students" sx={{ bgcolor: '#F8FAFC', fontWeight: 700 }} />
                        <Chip label="4.9 instructor rating" sx={{ bgcolor: '#F8FAFC', fontWeight: 700 }} />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box id="reviews" />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Reviews
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mt: 1, flexWrap: 'wrap' }}>
                        <Rating value={4.8} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          4.8 course rating
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          (238 reviews)
                        </Typography>
                      </Box>
                    </Box>
                    <Button component="a" href="#reviews" variant="text" sx={{ color: 'primary.main' }}>
                      View all reviews
                    </Button>
                  </Box>

                  <Stack spacing={2.5} sx={{ mt: 3 }}>
                    {reviews.map((review) => (
                      <Box key={review.name} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
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
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ position: { lg: 'sticky' }, top: 100 }}>
              <Card sx={{ overflow: 'visible' }}>
                <CardContent sx={{ p: 3 }}>
                  <LaptopMockup />

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
                      $14.99
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                        $21.99
                      </Typography>
                      <Chip label="32% off" sx={{ bgcolor: alpha(theme.palette.success.main, 0.12), color: 'success.main', fontWeight: 700 }} />
                    </Box>
                  </Box>

                  <Stack spacing={1.25} sx={{ mt: 2.5 }}>
                    <Button variant="contained" fullWidth sx={{ py: 1.4 }} onClick={() => void handleStartLearning()}>
                      Start Learning
                    </Button>
                    <Button variant="outlined" onClick={() => navigate('/checkout')} fullWidth sx={{ py: 1.4 }}>
                      Add to Cart
                    </Button>
                  </Stack>

                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5, textAlign: 'center' }}>
                    30-Day Money-Back Guarantee
                  </Typography>

                  <Divider sx={{ my: 2.5 }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
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

                  <Divider sx={{ my: 2.5 }} />

                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    This course is part of the{' '}
                    <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      LearnSpace UX Bundle
                    </Box>
                    .
                  </Typography>

                  <Box sx={{ mt: 2.5, p: 2, borderRadius: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Taking 5 or more people?
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      Scale team learning with admin controls, analytics, and guided rollouts.
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate('/contact')} fullWidth sx={{ mt: 2 }}>
                      LearnSpace for Business
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
