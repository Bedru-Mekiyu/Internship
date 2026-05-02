import { useMemo, useState, type ReactNode } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { BoltOutlined, FilterListOutlined, SearchOutlined, StarRounded, X as TwitterIcon } from '@mui/icons-material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { normalizeApiError } from '../../services/api';
import { useEnrollInCourseMutation, useGetCoursesQuery } from '../../store/api/courseApi';
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
  description: string;
  isDemo?: boolean;
};

type ApiCourseWithPricing = ApiCourse & {
  pricing?: {
    amount?: number;
  };
};

type ExploreCoursesProps = {
  embedded?: boolean;
};

const categories: Category[] = ['Development', 'Design', 'Business', 'Marketing', 'Photography'];
const levels: Level[] = ['Beginner', 'Intermediate', 'Advanced'];
const prices: PriceType[] = ['Free', 'Paid'];
const sortOptions: SortValue[] = ['Most Popular', 'Highest Rated', 'Price: Low to High', 'Price: High to Low'];

const fallbackCourses: Course[] = [
  {
    id: 'demo-full-stack',
    title: 'Full-Stack Web Bootcamp 2024',
    instructor: 'Alex Chen',
    rating: 4.9,
    reviews: 1200,
    price: 89,
    category: 'Development',
    level: 'Beginner',
    priceType: 'Paid',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=680&q=80',
    description: 'Build full-stack apps from foundations to deployment.',
    isDemo: true,
  },
  {
    id: 'demo-ui-ux',
    title: 'UI/UX Design Masterclass',
    instructor: 'Sarah Jones',
    rating: 4.8,
    reviews: 2100,
    price: 65,
    category: 'Design',
    level: 'Intermediate',
    priceType: 'Paid',
    image: 'https://images.unsplash.com/photo-1559028006-448665bd7c7f?auto=format&fit=crop&w=680&q=80',
    description: 'Design polished products with research-led UX methods.',
    isDemo: true,
  },
  {
    id: 'demo-digital-marketing',
    title: 'Digital Marketing Strategy',
    instructor: 'Maria Garcia',
    rating: 4.7,
    reviews: 3500,
    price: 49,
    category: 'Business',
    level: 'Intermediate',
    priceType: 'Paid',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=680&q=80',
    description: 'Plan multi-channel campaigns with measurable growth.',
    isDemo: true,
  },
  {
    id: 'demo-python-data',
    title: 'Python for Data Science',
    instructor: 'Kemi Tanaka',
    rating: 4.9,
    reviews: 4200,
    price: 95,
    category: 'Development',
    level: 'Intermediate',
    priceType: 'Paid',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=680&q=80',
    description: 'Analyze data with Python, notebooks, and practical projects.',
    isDemo: true,
  },
  {
    id: 'demo-dslr',
    title: 'Mastering DSLR Photography',
    instructor: 'Emma Wilson',
    rating: 4.8,
    reviews: 580,
    price: 55,
    category: 'Photography',
    level: 'Beginner',
    priceType: 'Paid',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=680&q=80',
    description: 'Understand light, composition, lenses, and manual control.',
    isDemo: true,
  },
  {
    id: 'demo-agile',
    title: 'Agile Project Management',
    instructor: 'David Okafor',
    rating: 4.6,
    reviews: 900,
    price: 79,
    category: 'Business',
    level: 'Advanced',
    priceType: 'Paid',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=680&q=80',
    description: 'Lead agile teams, sprints, standups, and delivery rituals.',
    isDemo: true,
  },
  {
    id: 'demo-machine-learning',
    title: 'Intro to Machine Learning',
    instructor: 'Priya Patel',
    rating: 4.9,
    reviews: 790,
    price: 120,
    category: 'Development',
    level: 'Advanced',
    priceType: 'Paid',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=680&q=80',
    description: 'Train practical ML models with approachable examples.',
    isDemo: true,
  },
  {
    id: 'demo-copywriting',
    title: 'Copywriting Secrets',
    instructor: 'James Wilson',
    rating: 4.7,
    reviews: 600,
    price: 45,
    category: 'Marketing',
    level: 'Beginner',
    priceType: 'Paid',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=680&q=80',
    description: 'Write sharper offers, landing pages, and email campaigns.',
    isDemo: true,
  },
  {
    id: 'demo-illustrator',
    title: 'Adobe Illustrator Essentials',
    instructor: 'Omar Farooq',
    rating: 4.8,
    reviews: 1100,
    price: 59,
    category: 'Design',
    level: 'Beginner',
    priceType: 'Paid',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=680&q=80',
    description: 'Create scalable illustrations, icons, and brand assets.',
    isDemo: true,
  },
];

const categoryChipColors: Record<Category, { bg: string; text: string }> = {
  Development: { bg: '#EEF2FF', text: '#4F46E5' },
  Design: { bg: '#EEF2FF', text: '#4F46E5' },
  Business: { bg: '#EEF2FF', text: '#4F46E5' },
  Marketing: { bg: '#EEF2FF', text: '#4F46E5' },
  Photography: { bg: '#EEF2FF', text: '#4F46E5' },
};

function BrandMark() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <BoltOutlined sx={{ color: '#4F46E5', fontSize: 17 }} />
      <Typography sx={{ color: '#4F46E5', fontWeight: 800, fontSize: '0.86rem', letterSpacing: 0 }}>
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
    { label: 'Enterprise', to: '/pricing' },
  ];

  return (
    <Box component="header" sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E5EAF2' }}>
      <Container maxWidth={false} sx={{ maxWidth: 1368, mx: 'auto', px: { xs: 2, md: 4 }, py: 1.15 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <BrandMark />

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3.4 }}>
            {links.map((link) => (
              <Link
                key={link.label}
                component={RouterLink}
                to={link.to}
                underline="none"
                sx={{ color: '#475569', fontSize: '0.69rem', fontWeight: 600, '&:hover': { color: '#4F46E5' } }}
              >
                {link.label}
              </Link>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Link component={RouterLink} to="/auth/login" underline="none" sx={{ color: '#475569', fontSize: '0.7rem', fontWeight: 600 }}>
              Log in
            </Link>
            <Button
              component={RouterLink}
              to="/auth/signup"
              variant="contained"
              sx={{
                minHeight: 28,
                px: 1.6,
                py: 0.45,
                borderRadius: 0.75,
                bgcolor: '#4F46E5',
                fontSize: '0.65rem',
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
    { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog'] },
    { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Contact'] },
    { title: 'Resources', links: ['Help Center', 'Community', 'Creator Academy', 'Webinars'] },
  ];

  const resolveLink = (item: string) => {
    switch (item) {
      case 'Features':
        return '/#features';
      case 'Pricing':
        return '/pricing';
      case 'About Us':
        return '/about';
      case 'Careers':
        return '/careers';
      case 'Blog':
        return '/blog';
      case 'Contact':
        return '/contact';
      case 'Help Center':
        return '/help-center';
      case 'Community':
        return '/community';
      default:
        return '/';
    }
  };

  return (
    <Box component="footer" sx={{ mt: { xs: 8, md: 11 }, bgcolor: '#FFFFFF', borderTop: '1px solid #E5EAF2' }}>
      <Container maxWidth={false} sx={{ maxWidth: 1368, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 5, md: 6.5 } }}>
        <Grid container spacing={{ xs: 4, md: 8 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <BrandMark />
            <Typography sx={{ color: '#64748B', mt: 2, maxWidth: 250, lineHeight: 1.6, fontSize: '0.72rem' }}>
              Empowering educators to share knowledge and build sustainable businesses online.
            </Typography>
          </Grid>
          {columns.map((column) => (
            <Grid key={column.title} size={{ xs: 12, sm: 4, md: 2 }}>
              <Typography sx={{ color: '#0F172A', fontWeight: 800, mb: 1.8, fontSize: '0.74rem' }}>
                {column.title}
              </Typography>
              <Stack spacing={1.15}>
                {column.links.map((link) => (
                  <Link
                    key={link}
                    component={RouterLink}
                    to={resolveLink(link)}
                    underline="none"
                    sx={{ color: '#64748B', fontSize: '0.7rem', '&:hover': { color: '#4F46E5' } }}
                  >
                    {link}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ borderTop: '1px solid #EDF1F6' }}>
        <Container maxWidth={false} sx={{ maxWidth: 1368, mx: 'auto', px: { xs: 2, md: 4 }, py: 2.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.64rem' }}>
              &copy; {new Date().getFullYear()} LearnSpace Inc. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.2 }}>
              <Link component={RouterLink} to="/privacy" underline="none" sx={{ color: '#64748B', fontSize: '0.66rem' }}>
                Privacy Policy
              </Link>
              <Link component={RouterLink} to="/terms" underline="none" sx={{ color: '#64748B', fontSize: '0.66rem' }}>
                Terms of Service
              </Link>
              <Link href="https://twitter.com/learnspace" target="_blank" rel="noopener noreferrer" underline="none" aria-label="X (Twitter)">
                <TwitterIcon sx={{ color: '#64748B', fontSize: '0.66rem' }} />
              </Link>
              <Link href="https://linkedin.com/company/learnspace" target="_blank" rel="noopener noreferrer" underline="none" aria-label="LinkedIn">
                <LinkedInIcon sx={{ color: '#64748B', fontSize: '0.66rem' }} />
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

function FilterSection({ title, children, last = false }: { title: string; children: ReactNode; last?: boolean }) {
  return (
    <Box sx={{ pb: last ? 0 : 2.8, mb: last ? 0 : 2.6, borderBottom: last ? 'none' : '1px solid #E5EAF2' }}>
      <Typography sx={{ color: '#0F172A', fontSize: '0.72rem', fontWeight: 800, mb: 1.2 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function StyledCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <Checkbox
      checked={checked}
      onChange={onChange}
      size="small"
      sx={{
        p: 0.25,
        mr: 0.75,
        color: '#CBD5E1',
        '&.Mui-checked': { color: '#4F46E5' },
        '& .MuiSvgIcon-root': { fontSize: 14 },
      }}
    />
  );
}

function FilterOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <FormControlLabel
      control={<StyledCheckbox checked={checked} onChange={onChange} />}
      label={label}
      sx={{
        display: 'flex',
        alignItems: 'center',
        m: 0,
        minHeight: 22,
        '& .MuiFormControlLabel-label': {
          color: '#475569',
          fontSize: '0.7rem',
          fontWeight: 500,
        },
      }}
    />
  );
}

function ThumbnailFallback({ category }: { category: Category }) {
  const base = category === 'Design' ? '#E0E7FF' : category === 'Business' ? '#DBEAFE' : category === 'Marketing' ? '#FDE68A' : category === 'Photography' ? '#DCFCE7' : '#1E293B';
  const lineColor = category === 'Development' ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.22)';

  return (
    <Box sx={{ height: '100%', bgcolor: base, p: 1.5, display: 'grid', gap: 0.6, alignContent: 'center' }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            height: 6,
            width: `${74 - index * 8}%`,
            borderRadius: 999,
            bgcolor: lineColor,
          }}
        />
      ))}
    </Box>
  );
}

function CourseCard({ course, onEnroll }: { course: Course; onEnroll: (course: Course) => Promise<void> }) {
  const chip = categoryChipColors[course.category];

  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid #E4E9F2',
        borderRadius: 1,
        boxShadow: 'none',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <Box component={RouterLink} to={`/courses/${course.id}`} sx={{ height: 152, bgcolor: '#E8EEF6', overflow: 'hidden', display: 'block' }}>
        {course.image ? (
          <Box
            component="img"
            src={course.image}
            alt=""
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <ThumbnailFallback category={course.category} />
        )}
      </Box>

      <CardContent sx={{ p: 1.45, '&:last-child': { pb: 1.45 } }}>
        <Box sx={{ display: 'inline-flex', px: 0.65, py: 0.2, borderRadius: 0.5, bgcolor: chip.bg, mb: 0.85 }}>
          <Typography sx={{ color: chip.text, fontSize: '0.55rem', fontWeight: 900, letterSpacing: '0.05em' }}>
            {course.category.toUpperCase()}
          </Typography>
        </Box>

        <Typography component={RouterLink} to={`/courses/${course.id}`} sx={{ color: '#0F172A', fontWeight: 800, lineHeight: 1.32, minHeight: 38, fontSize: '0.84rem', display: 'block', '&:hover': { color: '#4F46E5' } }}>
          {course.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, mt: 1.1 }}>
          <Box
            sx={{
              width: 17,
              height: 17,
              borderRadius: '50%',
              bgcolor: '#E2E8F0',
              color: '#334155',
              display: 'grid',
              placeItems: 'center',
              fontSize: '0.55rem',
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {course.instructor.charAt(0).toUpperCase() || 'L'}
          </Box>
          <Typography sx={{ color: '#475569', fontSize: '0.66rem', fontWeight: 600 }} noWrap>
            {course.instructor || 'LearnSpace'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mt: 0.7 }}>
          <StarRounded sx={{ color: '#F59E0B', fontSize: 14 }} />
          <Typography sx={{ color: '#B45309', fontSize: '0.63rem', fontWeight: 700 }}>
            {course.rating.toFixed(1)}
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.62rem' }}>
            ({course.reviews.toLocaleString()} reviews)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 2.25 }}>
          <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: '0.78rem' }}>
            {course.price === 'Free' ? 'Free' : `$${course.price}`}
          </Typography>
          <Button
            variant="contained"
            onClick={() => void onEnroll(course)}
            sx={{
              minHeight: 30,
              px: 1.4,
              py: 0.55,
              borderRadius: 0.75,
              bgcolor: '#4F46E5',
              fontSize: '0.64rem',
              '&:hover': { bgcolor: '#4338CA' },
            }}
          >
            Enroll Now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

function normalizeCategory(value: string | undefined): Category {
  const normalized = (value || '').trim().toLowerCase();
  return categories.find((category) => category.toLowerCase() === normalized) || 'Development';
}

function normalizeLevel(value: string | undefined): Level {
  const normalized = (value || '').trim().toLowerCase();
  return levels.find((level) => level.toLowerCase() === normalized) || 'Beginner';
}

function mapApiCourse(course: ApiCourse): Course {
  const amount = Number((course as ApiCourseWithPricing).pricing?.amount ?? 0);
  const isFree = !amount || amount <= 0;
  const instructorName =
    typeof course.instructor === 'string'
      ? course.instructor
      : course.instructor?.firstName
        ? `${course.instructor.firstName} ${course.instructor.lastName || ''}`.trim()
        : course.instructor?.email || 'LearnSpace';

  return {
    id: String(course._id),
    title: course.title,
    instructor: instructorName,
    rating: course.rating?.average != null ? Number(course.rating.average) : null,
    reviews: Number(course.rating?.count ?? course.enrollmentCount ?? 0),
    price: isFree ? 'Free' : amount,
    category: normalizeCategory(course.category),
    level: normalizeLevel(course.level),
    priceType: isFree ? 'Free' : 'Paid',
    image: sanitizeHttpUrl(course.thumbnail) || '',
    description: course.shortDescription || course.description || '',
  };
}

export default function ExploreCourses({ embedded = false }: ExploreCoursesProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<Level[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<PriceType[]>([]);
  const [sortBy, setSortBy] = useState<SortValue>('Most Popular');
  const [visibleCount, setVisibleCount] = useState(9);
  const [allCategories, setAllCategories] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: apiCourses = [], isLoading, error } = useGetCoursesQuery();
  const [enrollInCourse] = useEnrollInCourseMutation();

  const apiCatalogCourses = useMemo(() => apiCourses.map(mapApiCourse), [apiCourses]);
  const usingFallbackCatalog = apiCatalogCourses.length === 0;
  const courses = usingFallbackCatalog ? fallbackCourses : apiCatalogCourses;
  const totalCourseCount = courses.length;

  const toggleValue = <T extends string>(value: T, list: T[], setList: (next: T[]) => void) => {
    setList(list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value]);
    setVisibleCount(9);
  };

  const toggleCategory = (value: Category) => {
    setAllCategories(false);
    setSelectedCategories((current) => (
      current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]
    ));
    setVisibleCount(9);
  };

  const clearCategory = () => {
    setAllCategories(true);
    setSelectedCategories([]);
    setVisibleCount(9);
  };

  const resetAllFilters = () => {
    setSearch('');
    setAllCategories(true);
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedPrices([]);
    setSortBy('Most Popular');
    setVisibleCount(9);
  };

  const handleEnroll = async (course: Course) => {
    setActionError(null);

    if (!user) {
      navigate('/auth/signup');
      return;
    }

    if (course.isDemo) {
      setActionError('Demo courses are placeholders. Add a real course in the CMS to enable enrollment.');
      return;
    }

    try {
      await enrollInCourse(course.id).unwrap();
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

  const content = (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: embedded ? '100%' : 1368,
        mx: 'auto',
        px: embedded ? 0 : { xs: 2, md: 4 },
        pt: embedded ? 0 : { xs: 3.5, md: 5 },
        pb: embedded ? 0 : { xs: 4, md: 6 },
      }}
    >
      <Box sx={{ mb: { xs: 3, md: 4.2 }, display: 'flex', alignItems: { xs: 'stretch', md: 'flex-end' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box>
          <Typography component="h1" sx={{ color: '#0F172A', fontWeight: 900, letterSpacing: 0, fontSize: { xs: '1.45rem', md: '1.6rem' }, lineHeight: 1.2 }}>
            Explore Courses
          </Typography>
          <Typography sx={{ color: '#64748B', mt: 1.15, fontSize: '0.76rem', lineHeight: 1.6 }}>
            Discover new skills with our expert-led video tutorials.
          </Typography>
        </Box>

        <TextField
          placeholder="Search for courses..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setVisibleCount(9);
          }}
          size="small"
          sx={{
            width: { xs: '100%', md: 318 },
            bgcolor: '#FFFFFF',
            '& .MuiOutlinedInput-root': {
              minHeight: 34,
              borderRadius: 0.75,
              fontSize: '0.72rem',
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#CBD5E1' },
              '&.Mui-focused fieldset': { borderColor: '#4F46E5', borderWidth: 1 },
            },
            '& .MuiOutlinedInput-input': { py: 0.8 },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: '#94A3B8', fontSize: 16 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {actionError ? (
        <Box sx={{ mb: 2, border: '1px solid #FECACA', bgcolor: '#FEF2F2', borderRadius: 1, px: 1.5, py: 1 }}>
          <Typography sx={{ color: '#B91C1C', fontSize: '0.78rem', fontWeight: 700 }}>{actionError}</Typography>
        </Box>
      ) : null}

      {error && (
        <Box sx={{ mb: 2, border: '1px solid #FECACA', bgcolor: '#FEF2F2', borderRadius: 1, px: 1.5, py: 1 }}>
          <Typography sx={{ color: '#B91C1C', fontSize: '0.78rem', fontWeight: 700 }}>
            {usingFallbackCatalog 
              ? 'Showing sample courses—check back soon for our full catalog' 
              : normalizeApiError(error).message || 'Unable to load courses.'}
          </Typography>
        </Box>
      )}

      <Grid container spacing={{ xs: 3, lg: 5.2 }} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, lg: 2.55 }}>
          <Box sx={{ position: { lg: 'sticky' }, top: embedded ? 96 : 24 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.45 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography sx={{ color: '#0F172A', fontSize: '0.72rem', fontWeight: 900 }}>
                  Filters
                </Typography>
                <Button
                  variant="text"
                  onClick={() => setFiltersOpen((current) => !current)}
                  sx={{
                    display: { xs: 'inline-flex', lg: 'none' },
                    minWidth: 0,
                    p: 0.25,
                    color: '#64748B',
                  }}
                >
                  <FilterListOutlined sx={{ fontSize: 16 }} />
                </Button>
              </Box>
              <Button
                variant="text"
                onClick={resetAllFilters}
                sx={{ minWidth: 0, px: 0, py: 0, color: '#4F46E5', fontSize: '0.62rem', fontWeight: 700 }}
              >
                Reset all
              </Button>
            </Box>

            <Box sx={{ display: { xs: filtersOpen ? 'block' : 'none', lg: 'block' } }}>
              <FilterSection title="Category">
                <Stack spacing={0.35}>
                  <FilterOption label="All Categories" checked={allCategories} onChange={clearCategory} />
                  {categories.map((category) => (
                    <FilterOption
                      key={category}
                      label={category}
                      checked={selectedCategories.includes(category) && !allCategories}
                      onChange={() => toggleCategory(category)}
                    />
                  ))}
                </Stack>
              </FilterSection>

              <FilterSection title="Level">
                <Stack spacing={0.35}>
                  {levels.map((level) => (
                    <FilterOption
                      key={level}
                      label={level}
                      checked={selectedLevels.includes(level)}
                      onChange={() => toggleValue(level, selectedLevels, setSelectedLevels)}
                    />
                  ))}
                </Stack>
              </FilterSection>

              <FilterSection title="Price" last>
                <Stack spacing={0.35}>
                  {prices.map((price) => (
                    <FilterOption
                      key={price}
                      label={price}
                      checked={selectedPrices.includes(price)}
                      onChange={() => toggleValue(price, selectedPrices, setSelectedPrices)}
                    />
                  ))}
                </Stack>
              </FilterSection>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 9.45 }}>
          <Box sx={{ mb: 2.35, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Typography sx={{ color: '#475569', fontWeight: 600, fontSize: '0.7rem' }}>
              Showing {visibleCourses.length} of {Math.max(filteredCourses.length, totalCourseCount)} courses
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.68rem' }}>
                Sort by:
              </Typography>
              <FormControl
                size="small"
                sx={{
                  minWidth: 126,
                  bgcolor: '#FFFFFF',
                  '& .MuiOutlinedInput-root': {
                    minHeight: 30,
                    borderRadius: 0.75,
                    fontSize: '0.68rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&.Mui-focused fieldset': { borderColor: '#4F46E5', borderWidth: 1 },
                  },
                  '& .MuiSelect-select': { py: 0.65, px: 1 },
                }}
              >
                <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortValue)}>
                  {sortOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Grid container spacing={{ xs: 2.4, md: 4.2, lg: 5 }}>
            {visibleCourses.map((course) => (
              <Grid key={course.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <CourseCard course={course} onEnroll={handleEnroll} />
              </Grid>
            ))}
          </Grid>

          {isLoading ? (
            <Typography sx={{ color: '#64748B', mt: 2, fontSize: '0.76rem' }}>Loading courses...</Typography>
          ) : null}

          {!isLoading && visibleCourses.length === 0 ? (
            <Box sx={{ mt: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', borderRadius: 1, px: 2, py: 2.5 }}>
              <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.9rem' }}>
                No courses match these filters.
              </Typography>
              <Typography sx={{ color: '#64748B', mt: 0.5, fontSize: '0.76rem' }}>
                Reset the filters or try a different search term.
              </Typography>
            </Box>
          ) : null}

          {visibleCount < filteredCourses.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 6.5 }}>
              <Button
                variant="outlined"
                onClick={() => setVisibleCount((current) => current + 3)}
                sx={{
                  color: '#0F172A',
                  borderColor: '#DCE3EE',
                  bgcolor: '#FFFFFF',
                  borderRadius: 0.75,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.68rem',
                  px: 1.4,
                  py: 0.7,
                  '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
                }}
              >
                Load More Courses
              </Button>
            </Box>
          ) : null}
        </Grid>
      </Grid>
    </Container>
  );

  return (
    <Box sx={{ minHeight: embedded ? 'auto' : '100vh', bgcolor: embedded ? 'transparent' : '#F4F7FB' }}>
      {embedded ? null : <TopNav />}
      {content}
      {embedded ? null : <Footer />}
    </Box>
  );
}
