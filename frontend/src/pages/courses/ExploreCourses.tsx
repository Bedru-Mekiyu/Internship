import { useMemo, useState, type ReactNode } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Rating,
  Select,
  Stack,
  TextField,
  InputAdornment,
  Typography,
} from '@mui/material';
import {
  SearchOutlined,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useEnrollInCourseMutation, useGetCoursesQuery } from '../../store/api/courseApi';
import { normalizeApiError } from '../../services/api';
import type { Course as ApiCourse } from '../../types';
import { sanitizeHttpUrl } from '../../utils/safeUrl';

type Category = 'Development' | 'Design' | 'Business' | 'Marketing' | 'Photography';
type Level = 'Beginner' | 'Intermediate' | 'Advanced';
type PriceType = 'Free' | 'Paid';
type SortValue = 'Most Popular' | 'Highest Rated' | 'Price: Low to High' | 'Price: High to Low';

type Course = {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  price: number | 'Free';
  category: Category;
  level: Level;
  priceType: PriceType;
  image: string;
  accent: string;
  description: string;
};

type ApiCourseWithPricing = ApiCourse & {
  pricing?: {
    amount?: number;
  };
};

const categories: Category[] = ['Development', 'Design', 'Business', 'Marketing', 'Photography'];
const levels: Level[] = ['Beginner', 'Intermediate', 'Advanced'];
const prices: PriceType[] = ['Free', 'Paid'];

const categoryMeta: Record<Category, { label: string }> = {
  Development: { label: 'Development' },
  Design: { label: 'Design' },
  Business: { label: 'Business' },
  Marketing: { label: 'Marketing' },
  Photography: { label: 'Photography' },
};

function TopNav() {
  const links = [
    { label: 'Features', href: '/home#features' },
    { label: 'Courses', href: '/courses/explore' },
    { label: 'Pricing', href: '/home#pricing' },
    { label: 'Enterprise', href: '/home#enterprise' },
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

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
            {links.map((link) => (
              <Button key={link.label} component={RouterLink} to={link.href} variant="text" sx={{ color: 'text.primary', px: 0, minWidth: 'auto' }}>
                {link.label}
              </Button>
            ))}
          </Box>

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

function Footer() {
  const columns = [
    { title: 'Product', links: ['Courses', 'Certificates', 'Analytics', 'Pricing'] },
    { title: 'Company', links: ['About Us', 'Careers', 'Enterprise', 'Contact'] },
    { title: 'Resources', links: ['Help Center', 'Blog', 'Community', 'Privacy'] },
  ];

  return (
    <Box sx={{ mt: 8, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: 'primary.main', color: '#FFFFFF', display: 'grid', placeItems: 'center' }}>
                LS
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                LearnSpace
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2, maxWidth: 320, lineHeight: 1.8 }}>
              LearnSpace helps learners discover in-demand skills through expert-led courses, structured learning paths, and practical projects.
            </Typography>
          </Grid>
          {columns.map((column) => (
            <Grid key={column.title} size={{ xs: 12, sm: 4, md: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                {column.title}
              </Typography>
              <Stack spacing={1.25}>
                {column.links.map((link) => (
                  <Button key={link} variant="text" sx={{ justifyContent: 'flex-start', color: 'text.secondary', px: 0, minWidth: 'auto' }}>
                    {link}
                  </Button>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function CourseCard({ course, onEnroll }: { course: Course; onEnroll: (courseId: string) => Promise<void> }) {
  const base = categoryMeta[course.category];
  const categoryLabel = base.label;

  return (
    <Card sx={{ height: '100%', overflow: 'hidden', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <CardMedia sx={{ height: 184, bgcolor: 'background.default' }} image={course.image || undefined} title={course.title}>
        {!course.image ? (
          <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {categoryLabel}
            </Typography>
          </Box>
        ) : null}
      </CardMedia>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25, minHeight: 54 }}>
          {course.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, lineHeight: 1.7 }}>
          {course.description}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {course.instructor || '—'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
            <Rating value={course.rating} readOnly precision={0.1} size="small" />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {course.rating} ({course.reviews.toLocaleString()})
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mt: 2.25 }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {course.level}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {course.price === 'Free' ? 'Free' : `$${course.price}`}
            </Typography>
          </Box>
          <Button variant="contained" sx={{ px: 2.25, py: 1.05, borderRadius: 1.5 }} onClick={() => void onEnroll(course.id)}>
            Enroll Now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function mapApiCourse(course: ApiCourse): Course {
  const rawCategory = typeof course.category === 'string' ? course.category : 'Development';
  const normalizedCategory = categories.includes(rawCategory as Category) ? (rawCategory as Category) : 'Development';

  const rawLevel = typeof course.level === 'string' ? course.level : 'beginner';
  const normalizedLevel = rawLevel.charAt(0).toUpperCase() + rawLevel.slice(1);
  const level = levels.includes(normalizedLevel as Level) ? (normalizedLevel as Level) : 'Beginner';

  const amount = Number((course as ApiCourseWithPricing).pricing?.amount ?? 0);
  const isFree = !amount || amount <= 0;

  const instructorName =
    typeof course.instructor === 'string'
      ? course.instructor
      : course.instructor?.firstName
        ? `${course.instructor.firstName} ${course.instructor.lastName || ''}`.trim()
        : course.instructor?.email || '';

  return {
    id: String(course._id),
    title: course.title,
    instructor: instructorName,
    rating: Number(course?.rating?.average ?? 0),
    reviews: Number(course?.rating?.count ?? 0),
    price: isFree ? 'Free' : amount,
    category: normalizedCategory,
    level,
    priceType: isFree ? 'Free' : 'Paid',
    image: sanitizeHttpUrl(course.thumbnail) || '',
    accent: '#0066FF',
    description: course.shortDescription || course.description || '',
  };
}

export default function ExploreCourses() {
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<Level[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<PriceType[]>([]);
  const [sortBy, setSortBy] = useState<SortValue>('Most Popular');
  const [visibleCount, setVisibleCount] = useState(6);
  const [allCategories, setAllCategories] = useState(true);

  const { data: apiCourses = [], isLoading, error } = useGetCoursesQuery();
  const [enrollInCourse] = useEnrollInCourseMutation();

  const courses = useMemo(() => apiCourses.map(mapApiCourse), [apiCourses]);

  const handleEnroll = async (courseId: string) => {
    setActionError(null);
    try {
      await enrollInCourse(courseId).unwrap();
    } catch (enrollError) {
      const normalized = normalizeApiError(enrollError);
      setActionError(normalized.message || 'Enrollment failed.');
    }
  };

  const filteredCourses = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    let nextCourses = courses.filter((course) => {
      const matchesSearch =
        !searchTerm ||
        course.title.toLowerCase().includes(searchTerm) ||
        course.instructor.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm);

      const matchesCategory = allCategories || selectedCategories.length === 0 || selectedCategories.includes(course.category);
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level);
      const matchesPrice = selectedPrices.length === 0 || selectedPrices.includes(course.priceType);

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });

    nextCourses = [...nextCourses].sort((left, right) => {
      if (sortBy === 'Highest Rated') return right.rating - left.rating;
      if (sortBy === 'Price: Low to High') {
        const leftPrice = left.price === 'Free' ? 0 : left.price;
        const rightPrice = right.price === 'Free' ? 0 : right.price;
        return leftPrice - rightPrice;
      }
      if (sortBy === 'Price: High to Low') {
        const leftPrice = left.price === 'Free' ? 0 : left.price;
        const rightPrice = right.price === 'Free' ? 0 : right.price;
        return rightPrice - leftPrice;
      }
      return right.reviews - left.reviews;
    });

    return nextCourses;
  }, [allCategories, courses, search, selectedCategories, selectedLevels, selectedPrices, sortBy]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);

  const toggleValue = <T extends string>(value: T, list: T[], setList: (next: T[]) => void) => {
    setAllCategories(false);
    setList(list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value]);
  };

  const clearCategory = () => {
    setAllCategories(true);
    setSelectedCategories([]);
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
              {normalizeApiError(error).message || 'Unable to load courses.'}
            </Typography>
          </Box>
        ) : null}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
            Explore Courses
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, maxWidth: 720 }}>
            Discover new skills with our expert-led video tutorials.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Box sx={{ width: { xs: '100%', md: 420 } }}>
            <TextField
              placeholder="Search for courses..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setVisibleCount(6);
              }}
              sx={{ width: '100%' }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, lg: 3 }}>
            <Box sx={{ position: { lg: 'sticky' }, top: 96 }}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <FilterSection title="Category">
                    <FormControlLabel
                      control={<Checkbox checked={allCategories} onChange={clearCategory} />}
                      label="All Categories"
                      sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}
                    />
                    <Stack spacing={0.25}>
                      {categories.map((category) => (
                        <FormControlLabel
                          key={category}
                          control={
                            <Checkbox
                              checked={selectedCategories.includes(category) && !allCategories}
                              onChange={() => toggleValue(category, selectedCategories, setSelectedCategories)}
                            />
                          }
                          label={category}
                        />
                      ))}
                    </Stack>
                  </FilterSection>

                  <FilterSection title="Level">
                    <Stack spacing={0.25}>
                      {levels.map((level) => (
                        <FormControlLabel
                          key={level}
                          control={<Checkbox checked={selectedLevels.includes(level)} onChange={() => toggleValue(level, selectedLevels, setSelectedLevels)} />}
                          label={level}
                        />
                      ))}
                    </Stack>
                  </FilterSection>

                  <FilterSection title="Price">
                    <Stack spacing={0.25}>
                      {prices.map((price) => (
                        <FormControlLabel
                          key={price}
                          control={<Checkbox checked={selectedPrices.includes(price)} onChange={() => toggleValue(price, selectedPrices, setSelectedPrices)} />}
                          label={price}
                        />
                      ))}
                    </Stack>
                  </FilterSection>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 9 }}>
            <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Showing {Math.min(visibleCourses.length, filteredCourses.length)} of {filteredCourses.length} courses
              </Typography>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortValue)}>
                  {(['Most Popular', 'Highest Rated', 'Price: Low to High', 'Price: High to Low'] as SortValue[]).map((option) => (
                    <MenuItem key={option} value={option}>
                      Sort by: {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Grid container spacing={3}>
              {visibleCourses.map((course) => (
                <Grid key={course.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <CourseCard course={course} onEnroll={handleEnroll} />
                </Grid>
              ))}
            </Grid>

            {isLoading ? (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ color: 'text.secondary' }}>Loading courses...</Typography>
              </Box>
            ) : null}

            {visibleCount < filteredCourses.length ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button variant="text" onClick={() => setVisibleCount((current) => current + 3)} sx={{ color: 'primary.main', fontWeight: 700 }}>
                  Load More Courses
                </Button>
              </Box>
            ) : null}
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}
