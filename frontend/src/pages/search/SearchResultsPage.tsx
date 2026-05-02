import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  MenuBookOutlined,
  PeopleOutlined,
  SchoolOutlined,
  SearchOutlined,
} from '@mui/icons-material';
import DashboardPageFrame from '../../components/common/DashboardPageFrame';

interface SearchResult {
  id: string;
  type: 'course' | 'instructor' | 'lesson';
  title: string;
  description?: string;
  thumbnail?: string;
  meta?: string;
  url: string;
}

interface SearchResultsData {
  courses: SearchResult[];
  instructors: SearchResult[];
  lessons: SearchResult[];
}

const mockSearchResults: SearchResultsData = {
  courses: [
    {
      id: 'course-1',
      type: 'course',
      title: 'Advanced React Patterns',
      description: 'Master advanced React patterns including compound components, render props, and hooks',
      thumbnail: '',
      meta: '4.8 ★ • 2,500 students • 12 hours',
      url: '/courses/advanced-react-patterns',
    },
    {
      id: 'course-2',
      type: 'course',
      title: 'TypeScript Masterclass',
      description: 'Learn TypeScript from beginner to advanced with real-world projects',
      thumbnail: '',
      meta: '4.9 ★ • 1,800 students • 18 hours',
      url: '/courses/typescript-masterclass',
    },
    {
      id: 'course-3',
      type: 'course',
      title: 'Node.js Backend Development',
      description: 'Build scalable backend applications with Node.js, Express, and MongoDB',
      thumbnail: '',
      meta: '4.7 ★ • 3,200 students • 20 hours',
      url: '/courses/nodejs-backend',
    },
  ],
  instructors: [
    {
      id: 'instructor-1',
      type: 'instructor',
      title: 'Sarah Chen',
      description: 'Senior Software Engineer at Google with 10+ years of experience',
      thumbnail: '',
      meta: '12 courses • 15,000+ students',
      url: '/instructors/sarah-chen',
    },
    {
      id: 'instructor-2',
      type: 'instructor',
      title: 'Michael Rodriguez',
      description: 'Full-stack developer and technical writer',
      thumbnail: '',
      meta: '8 courses • 8,500+ students',
      url: '/instructors/michael-rodriguez',
    },
  ],
  lessons: [
    {
      id: 'lesson-1',
      type: 'lesson',
      title: 'Understanding useCallback and useMemo',
      description: 'Learn when and how to optimize React components with memoization hooks',
      thumbnail: '',
      meta: 'Advanced React Patterns • 15 min',
      url: '/courses/advanced-react-patterns/learn/lesson-1',
    },
    {
      id: 'lesson-2',
      type: 'lesson',
      title: 'TypeScript Generics Explained',
      description: 'Deep dive into TypeScript generics with practical examples',
      thumbnail: '',
      meta: 'TypeScript Masterclass • 25 min',
      url: '/courses/typescript-masterclass/learn/lesson-2',
    },
  ],
};

function SearchResultCard({ result }: { result: SearchResult }) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (result.type) {
      case 'course':
        return <SchoolOutlined />;
      case 'instructor':
        return <PeopleOutlined />;
      case 'lesson':
        return <MenuBookOutlined />;
      default:
        return <SearchOutlined />;
    }
  };

  const getTypeLabel = () => {
    switch (result.type) {
      case 'course':
        return 'Course';
      case 'instructor':
        return 'Instructor';
      case 'lesson':
        return 'Lesson';
      default:
        return 'Result';
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'all 180ms ease',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
        },
      }}
      onClick={() => navigate(result.url)}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2}>
          {result.thumbnail ? (
            <CardMedia
              component="img"
              sx={{ width: 80, height: 60, borderRadius: 1.5, objectFit: 'cover' }}
              image={result.thumbnail}
              alt={result.title}
            />
          ) : (
            <Box
              sx={{
                width: 80,
                height: 60,
                borderRadius: 1.5,
                bgcolor: 'grey.100',
                display: 'grid',
                placeItems: 'center',
                color: 'text.secondary',
              }}
            >
              {getIcon()}
            </Box>
          )}
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 0.5, alignItems: 'center' }}>
              <Chip
                label={getTypeLabel()}
                size="small"
                sx={{ fontSize: 10, height: 20 }}
              />
            </Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
              {result.title}
            </Typography>
            {result.description && (
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5, mb: 0.5 }}>
                {result.description}
              </Typography>
            )}
            {result.meta && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {result.meta}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const isSearching = Boolean(query);

  const results = useMemo(() => {
    if (!query) {
      return { courses: [], instructors: [], lessons: [] };
    }
    return mockSearchResults;
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const totalResults = results.courses.length + results.instructors.length + results.lessons.length;

  return (
    <DashboardPageFrame
      title="Search Results"
      description={query ? `Results for "${query}"` : 'Search for courses, instructors, and lessons'}
      breadcrumbs={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Search' },
      ]}
    >
      <Stack spacing={3}>
        <Box component="form" onSubmit={handleSearch}>
          <TextField
            fullWidth
            placeholder="Search courses, instructors, lessons..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button type="submit" variant="contained" size="small">
                      Search
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {!query ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <SearchOutlined sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Search LearnSpace
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto' }}>
              Find courses, instructors, and lessons across our entire platform
            </Typography>
          </Box>
        ) : isSearching ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Searching...
            </Typography>
          </Box>
        ) : totalResults === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <SearchOutlined sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              No results found
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
              We couldn't find anything matching "{query}"
            </Typography>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setSearchInput('')}
              >
                Clear Search
              </Button>
              <Button
                component={RouterLink}
                to="/courses/browse"
                variant="contained"
              >
                Browse Courses
              </Button>
            </Stack>
          </Box>
        ) : (
          <>
            <Box sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
              </Typography>
            </Box>

            {results.courses.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Courses ({results.courses.length})
                </Typography>
                <Stack spacing={2}>
                  {results.courses.map((result) => (
                    <SearchResultCard key={result.id} result={result} />
                  ))}
                </Stack>
              </Box>
            )}

            {results.instructors.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Instructors ({results.instructors.length})
                </Typography>
                <Stack spacing={2}>
                  {results.instructors.map((result) => (
                    <SearchResultCard key={result.id} result={result} />
                  ))}
                </Stack>
              </Box>
            )}

            {results.lessons.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Lessons ({results.lessons.length})
                </Typography>
                <Stack spacing={2}>
                  {results.lessons.map((result) => (
                    <SearchResultCard key={result.id} result={result} />
                  ))}
                </Stack>
              </Box>
            )}
          </>
        )}
      </Stack>
    </DashboardPageFrame>
  );
}
