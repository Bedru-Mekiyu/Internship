import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AutoGraph,
  CheckCircleOutlined,
  DragIndicator,
  Groups,
  Payments,
  PhoneIphone,
  PlayCircleOutlined,
  StarRounded,
  WorkspacePremium,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { api } from '../../services/api';
import { useGetCoursesQuery } from '../../store/api/courseApi';
import heroImage from '../../assets/hero-laptop-open.png';
import { CoursePreviewArtwork } from '../../components/ui/CoursePreviewArtwork';

type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
};

type TrustPartner = string;

type HomepageFeature = {
  title: string;
  description: string;
  color?: string;
};

const FEATURE_ICONS = [DragIndicator, AutoGraph, Groups, PhoneIphone, WorkspacePremium, Payments];

const FALLBACK_FEATURES: HomepageFeature[] = [
  { title: 'Drag & Drop Builder', description: 'Create engaging courses with an intuitive editor and reusable blocks.' },
  { title: 'Advanced Analytics', description: 'Track learner progress, completion rates, and revenue in real time.' },
  { title: 'Community Hub', description: 'Build discussion spaces and direct engagement for your learners.' },
  { title: 'Mobile Ready', description: 'Deliver seamless learning experiences across every screen size.' },
  { title: 'Certificates', description: 'Automatically issue branded certificates for milestones and completion.' },
  { title: 'Seamless Payments', description: 'Accept one-time and subscription payments with built-in checkout.' },
];

const FALLBACK_TRUST_PARTNERS: TrustPartner[] = ['ACME Corp', 'GlobalEdu', 'Technicum', 'FutureLearn', 'UniScale'];

const FALLBACK_PRICING: PricingPlan[] = [
  { name: 'Basic', price: '$0', description: 'For trying out LearnSpace', features: ['3 active courses', '1 admin account', 'Basic analytics'], featured: false },
  { name: 'Pro', price: '$29', description: 'For scaling your academy', features: ['Unlimited courses', 'Custom certificates', 'Priority support'], featured: true },
  { name: 'Business', price: '$99', description: 'For large educator teams', features: ['SSO & advanced security', 'Enterprise support', 'Advanced reporting'], featured: false },
];

const FALLBACK_TESTIMONIALS = [
  { name: 'Ariela', role: 'Educator', quote: 'Their platform has completely transformed the way I build and launch online courses.' },
  { name: 'Riya Sharma', role: 'Course Creator', quote: 'The analytics and payment flow made our first launch smooth from day one.' },
  { name: 'Teshale A.', role: 'Program Lead', quote: 'Community features helped us keep learners active and accountable every week.' },
];

type PublicSettings = {
  trustPartners?: TrustPartner[];
  homepageFeatures?: HomepageFeature[];
  pricingPlans?: PricingPlan[];
};

function formatCurrency(amount: number): string {
  if (amount === 0) return 'Free';
  return `$${amount}`;
}

function CourseCard({
  title,
  instructor,
  rating,
  students,
  category,
  image,
  variant,
}: {
  title: string;
  instructor: string;
  rating: string;
  students: number;
  category: string;
  image: string;
  variant: number;
}) {
  return (
    <Card sx={{ height: '100%', overflow: 'hidden', bgcolor: 'background.paper', borderColor: 'divider' }}>
      {image ? (
        <Box
          sx={{
            height: 120,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'action.hover',
            backgroundImage: image ? `url(${image})` : 'none',
          }}
        />
      ) : (
        <CoursePreviewArtwork variant={variant} />
      )}
      <CardContent sx={{ p: 1.05 }}>
        <Stack spacing={0.75}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.58rem' }}>
            {category}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: '0.72rem', minHeight: 34 }}>
            {title}
          </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.45, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.light', display: 'grid', placeItems: 'center', fontSize: '0.45rem', color: 'primary.dark', fontWeight: 700 }}>
                {instructor.charAt(0).toUpperCase()}
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.56rem' }}>
                {instructor}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: '#64748B' }}>
              <StarRounded sx={{ fontSize: '0.68rem', color: 'warning.main' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.54rem' }}>
                {rating} / {Math.max(students, 120)}+
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function MarketingHomepagePage() {
  const { data: apiCourses = [], isLoading: coursesLoading } = useGetCoursesQuery();
  const [publicSettings, setPublicSettings] = useState<PublicSettings | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await api.get<{ settings: PublicSettings }>('/api/settings/public');
        if (active) {
          setPublicSettings(response.data.settings);
          setSettingsError(null);
        }
      } catch (err) {
        if (active) {
          console.error('Failed to fetch public settings:', err);
          setSettingsError('Failed to load settings');
          setPublicSettings(null);
        }
      }
    })();
    return () => { active = false; };
  }, []);

  const trustPartners = useMemo(() => {
    if (publicSettings?.trustPartners?.length) {
      return publicSettings.trustPartners.slice(0, 5);
    }
    return FALLBACK_TRUST_PARTNERS;
  }, [publicSettings]);

  const features = useMemo(() => {
    if (publicSettings?.homepageFeatures?.length) {
      return publicSettings.homepageFeatures.slice(0, 6);
    }
    return FALLBACK_FEATURES;
  }, [publicSettings]);

  const pricing = useMemo(() => {
    if (publicSettings?.pricingPlans?.length) {
      return publicSettings.pricingPlans.slice(0, 3);
    }
    return FALLBACK_PRICING;
  }, [publicSettings]);

  const courses = useMemo(() => {
    return apiCourses.slice(0, 3).map((course, index) => {
      const instructor = typeof course.instructor === 'object' && course.instructor
        ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() || course.instructor.email
        : 'LearnSpace Instructor';
      const amount = typeof course.pricing?.amount === 'number' ? course.pricing.amount : 0;
      return {
        id: course._id,
        title: course.title,
        instructor,
        rating: Number(course.rating?.average || 0).toFixed(1),
        students: Number(course.enrollmentCount || 0),
        price: formatCurrency(amount),
        category: course.category || 'General',
        image: course.thumbnail || '',
        variant: index,
      };
    });
  }, [apiCourses]);

  const displayCourses = courses.length > 0 ? courses : null;

  return (
    <Box id="top" sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      {settingsError ? (
        <Alert severity="error" sx={{ borderRadius: 0 }}>
          {settingsError}
        </Alert>
      ) : null}

      {/* Hero */}
      <Box sx={{ py: { xs: 4.2, md: 5.2 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 5 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={1.5}>

                <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: 0, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.05 }}>
                  Unlock Potential with Modern Learning
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 500, fontWeight: 500, lineHeight: 1.6, fontSize: { xs: '0.84rem', md: '0.82rem' } }}>
                  Create, manage, and scale your educational programs with the world's most intuitive LMS platform designed for growing teams.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.4 }}>
                  <Button component={RouterLink} to="/auth/signup" variant="contained" sx={{ px: 2, py: 0.7, borderRadius: 0.9, fontSize: '0.78rem', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                    Start Free Trial
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/courses/explore"
                    variant="outlined"
                    startIcon={<PlayCircleOutlined sx={{ fontSize: '0.95rem' }} />}
                    sx={{ px: 2, py: 0.7, fontSize: '0.78rem', color: 'text.primary', borderColor: 'divider', bgcolor: 'background.paper', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}
                  >
                    Watch Demo
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, pt: 0.3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {[{ color: 'warning.dark', text: 'A' }, { color: 'warning.main', text: 'B' }, { color: 'text.secondary', text: 'C' }].map((item, index) => (
                      <Box
                        key={item.text}
                        sx={{
                          width: 23, height: 23, borderRadius: '50%', bgcolor: item.color, border: '2px solid', borderColor: 'background.paper',
                          color: 'warning.contrastText', display: 'grid', placeItems: 'center', fontSize: '0.55rem', fontWeight: 700,
                          ml: index === 0 ? 0 : -0.85,
                        }}
                      >
                        {item.text}
                      </Box>
                    ))}
                    <Box sx={{ width: 23, height: 23, borderRadius: '50%', bgcolor: 'secondary.light', border: '2px solid', borderColor: 'background.paper', color: 'text.secondary', display: 'grid', placeItems: 'center', fontSize: '0.5rem', fontWeight: 700, ml: -0.85 }}>
                      +2k
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary', fontWeight: 500 }}>
                    Trusted by 2,000+ organizations
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box
                component="img"
                src={heroImage}
                alt="LearnSpace dashboard preview"
                sx={{ width: { xs: '100%', md: '100%' }, height: 'auto', display: 'block', ml: 'auto', bgcolor: 'transparent' }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Partners */}
      <Box sx={{ py: 2.05, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontSize: '0.58rem', color: 'text.secondary', letterSpacing: 0, fontWeight: 700 }}>
            POWERING TOP EDUCATION TEAMS
          </Typography>
          <Box sx={{ mt: 1.1, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 1.5 }}>
            {trustPartners.map((partner) => (
              <Typography key={partner} sx={{ textAlign: 'center', fontSize: '0.7rem', color: 'text.secondary', fontWeight: 700 }}>
                {partner}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Box id="features" sx={{ py: { xs: 3.8, md: 4.8 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack spacing={2.1}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mt: 0, fontWeight: 700, letterSpacing: 0, fontSize: { xs: '1.35rem', md: '1.7rem' } }}>
                Everything you need to teach online
              </Typography>
              <Typography sx={{ mt: 0.7, color: 'text.secondary', fontSize: '0.68rem' }}>
                From content creation to learner engagement and analytics, all in one place.
              </Typography>
            </Box>
            {features.length > 0 ? (
              <Grid container spacing={1.2}>
                {features.map((feature, index) => {
                  const FeatureIcon = FEATURE_ICONS[index % FEATURE_ICONS.length];
                  return (
                    <Grid key={feature.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <Card sx={{ height: '100%', bgcolor: 'transparent', borderColor: 'transparent' }}>
                        <CardContent sx={{ p: 1.35 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.68 }}>
                            <Box sx={{ width: 22, height: 22, borderRadius: 1, bgcolor: alpha('primary.main', 0.1), display: 'grid', placeItems: 'center', color: 'primary.main' }}>
                              <FeatureIcon sx={{ fontSize: '0.8rem' }} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.74rem' }}>
                              {feature.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, fontSize: '0.62rem' }}>
                              {feature.description}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No feature highlights have been published yet.
              </Typography>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Courses */}
      <Box id="courses" sx={{ py: { xs: 3.8, md: 4.6 }, bgcolor: 'primary.light' }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h4" sx={{ mt: 0, fontWeight: 700, letterSpacing: 0, fontSize: { xs: '1.2rem', md: '1.45rem' } }}>
                  Popular Courses
                </Typography>
                <Typography sx={{ mt: 0.4, fontSize: '0.64rem', color: 'text.secondary' }}>
                  Discover high-impact courses from top instructors.
                </Typography>
              </Box>
                <Button component={RouterLink} to="/courses/explore" variant="outlined" aria-label="View all available courses" sx={{ px: 1.4, py: 0.45, borderColor: 'divider', color: 'text.secondary', bgcolor: 'background.paper', fontSize: '0.58rem' }}>
                View all courses
              </Button>
            </Box>
            <Grid container spacing={1.2}>
              {displayCourses ? (
                displayCourses.map((course, index) => (
                  <Grid key={course.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <CourseCard {...course} variant={index} />
                  </Grid>
                ))
              ) : coursesLoading ? null : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No published courses available yet.
                </Typography>
              )}
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box id="testimonials" sx={{ py: { xs: 3.8, md: 4.8 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack spacing={1.7}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mt: 0, fontWeight: 700, letterSpacing: 0, fontSize: { xs: '1.2rem', md: '1.45rem' } }}>
                Loved by students and teachers
              </Typography>
            </Box>
            <Grid container spacing={1.2}>
              {FALLBACK_TESTIMONIALS.map((item) => (
                <Grid key={item.name} size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: '100%', bgcolor: 'background.paper', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 1.1 }}>
                      <Stack spacing={0.85}>
                        <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, color: 'primary.light' }}>
                          <path fill="currentColor" d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.866 0-3.522-1.194-3.854-2.268zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.866 0-3.522-1.194-3.854-2.268z" />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6, fontSize: '0.63rem', minHeight: 58 }}>
                          {item.quote}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'primary.light', display: 'grid', placeItems: 'center', fontSize: '0.5rem', color: 'primary.dark', fontWeight: 700 }}>
                            {item.name.charAt(0).toUpperCase()}
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.64rem' }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.58rem' }}>
                              {item.role}
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* Pricing */}
      <Box id="pricing" sx={{ py: { xs: 4, md: 5 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Stack spacing={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mt: 0, fontWeight: 700, letterSpacing: 0, fontSize: { xs: '1.25rem', md: '1.55rem' } }}>
                Simple, transparent pricing
              </Typography>
              <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.62rem' }}>
                Choose the plan that best fits your growth.
              </Typography>
            </Box>
            {pricing.length > 0 ? (
              <Grid container spacing={1.2}>
                {pricing.map((plan) => (
                  <Grid key={plan.name} size={{ xs: 12, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        borderColor: plan.featured ? 'primary.light' : 'divider',
                        borderWidth: plan.featured ? 2 : 1,
                        bgcolor: 'background.paper',
                        position: 'relative',
                      }}
                    >
                      <CardContent sx={{ p: 1.25 }}>
                        <Stack spacing={1}>
                          {plan.featured ? (
                            <Box sx={{ alignSelf: 'center', borderRadius: 999, bgcolor: alpha('primary.main', 0.12), color: 'primary.main', px: 1, py: 0.2, fontSize: '0.55rem', fontWeight: 700 }}>
                              Most popular
                            </Box>
                          ) : null}
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '0.76rem' }}>
                              {plan.name}
                            </Typography>
                            <Typography sx={{ mt: 0.4, color: 'text.light', fontSize: '0.55rem' }}>
                              {plan.description}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1, fontSize: '1.65rem' }}>
                              {plan.price}
                              <Typography component="span" variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.64rem' }}>
                                /mo
                              </Typography>
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gap: 1 }}>
                            {plan.features.map((feature) => (
                              <Typography key={feature} variant="body2" sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', gap: 0.7, fontSize: '0.58rem' }}>
                                <CheckCircleOutlined sx={{ fontSize: '0.7rem', color: 'primary.main' }} />
                                {feature}
                              </Typography>
                            ))}
                          </Box>
                          <Button
                            component={RouterLink}
                            to="/auth/signup"
                            variant={plan.featured ? 'contained' : 'outlined'}
                            fullWidth
                            sx={{ py: 0.55, fontSize: '0.58rem' }}
                          >
                            {plan.featured ? 'Start for free' : 'Get started'}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No pricing plans are configured yet.
              </Typography>
            )}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
