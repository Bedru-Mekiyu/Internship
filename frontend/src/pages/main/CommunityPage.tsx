import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  CampaignOutlined,
  CommentOutlined,
  PeopleOutlined,
  SendOutlined,
} from '@mui/icons-material';

interface ForumPost {
  id: string;
  title: string;
  author: string;
  replies: number;
  lastActivity: string;
  category: string;
}

function BrandMark() {
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1.5,
        bgcolor: 'primary.main',
        color: '#FFFFFF',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      LS
    </Box>
  );
}

function TopNav() {
  const navItems = [
    { label: 'Features', to: '/#features' },
    { label: 'Courses', to: '/courses/explore' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Community', to: '/community' },
  ];

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <BrandMark />
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
              LearnSpace
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            {navItems.map((item) => (
              <Link key={item.label} component={RouterLink} to={item.to} underline="none" sx={{ color: 'text.secondary', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>
                {item.label}
              </Link>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Link component={RouterLink} to="/auth/login" underline="none" sx={{ color: 'text.primary', fontWeight: 700 }}>
              Log in
            </Link>
            <Button component={RouterLink} to="/auth/signup" variant="contained" sx={{ px: 3, py: 1.25, borderRadius: 1.5 }}>
              Get Started
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function ForumPostCard({ post }: { post: ForumPost }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 180ms ease',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {post.category}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                {post.title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <CommentOutlined sx={{ fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {post.replies}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              by <Typography component="span" sx={{ fontWeight: 700 }}>{post.author}</Typography>
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {post.lastActivity}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function FooterColumn({ heading, items }: { heading: string; items: string[] }) {
  const resolveLink = (item: string) => {
    switch (item) {
      case 'Features': return '/#features';
      case 'Courses': return '/courses/explore';
      case 'Pricing': return '/pricing';
      case 'About': return '/about';
      case 'Blog': return '/blog';
      case 'Careers': return '/careers';
      case 'Contact': return '/contact';
      case 'Help Center': return '/help-center';
      default: return '/home';
    }
  };

  return (
    <Stack spacing={1.25}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{heading}</Typography>
      {items.map((item) => (
        <Link key={item} component={RouterLink} to={resolveLink(item)} underline="none" sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
          {item}
        </Link>
      ))}
    </Stack>
  );
}

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const forumPosts: ForumPost[] = [
    {
      id: '1',
      title: 'Best practices for course pricing?',
      author: 'Sarah Chen',
      replies: 24,
      lastActivity: '2 hours ago',
      category: 'Business',
    },
    {
      id: '2',
      title: 'How to increase student engagement in the first week',
      author: 'Michael Torres',
      replies: 18,
      lastActivity: '5 hours ago',
      category: 'Teaching',
    },
    {
      id: '3',
      title: 'Video production tips for beginners',
      author: 'Emma Wilson',
      replies: 31,
      lastActivity: '1 day ago',
      category: 'Technical',
    },
    {
      id: '4',
      title: 'Community spotlight: What are you teaching this month?',
      author: 'LearnSpace Team',
      replies: 56,
      lastActivity: '2 days ago',
      category: 'General',
    },
    {
      id: '5',
      title: 'Certificate completion rates - what works?',
      author: 'David Kim',
      replies: 12,
      lastActivity: '3 days ago',
      category: 'Analytics',
    },
  ];

  const categories = [...new Set(forumPosts.map((p) => p.category))];

  const filteredPosts = forumPosts.filter((post) => {
    const matchesSearch = !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <TopNav />

      <Box sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 4, md: 5 }, bgcolor: 'background.default', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Stack spacing={2}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.2em' }}>
              COMMUNITY
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Connect with fellow educators
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 560, mx: 'auto', lineHeight: 1.8 }}>
              Share ideas, ask questions, and learn from instructors building courses on LearnSpace.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant={selectedCategory === null ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Button
                  component={RouterLink}
                  to="/contact"
                  variant="contained"
                  startIcon={<CampaignOutlined />}
                  fullWidth
                  sx={{ height: '100%' }}
                >
                  Start Discussion
                </Button>
              </Grid>
            </Grid>

            {filteredPosts.length === 0 ? (
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Stack spacing={2}>
                    <PeopleOutlined sx={{ fontSize: 48, color: 'text.secondary' }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      No discussions match your search. Start a new one!
                    </Typography>
                    <Button component={RouterLink} to="/contact" variant="outlined">
                      Start Discussion
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {filteredPosts.map((post) => (
                  <Grid key={post.id} size={{ xs: 12, md: 6 }}>
                    <ForumPostCard post={post} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 5, md: 6 }, bgcolor: 'background.default' }}>
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'grey.100' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 }, textAlign: 'center' }}>
              <Stack spacing={2}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  Join the conversation
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Connect with thousands of instructors sharing knowledge and growing together.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/auth/signup"
                  variant="contained"
                  endIcon={<SendOutlined />}
                  sx={{ alignSelf: 'center' }}
                >
                  Sign Up Free
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Box sx={{ pt: { xs: 5, md: 6 }, pb: 4, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <BrandMark />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>LearnSpace</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 330, lineHeight: 1.8 }}>
                  A modern EdTech platform for teams, creators, and learners.
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FooterColumn heading="Product" items={['Features', 'Courses', 'Pricing']} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FooterColumn heading="Company" items={['About', 'Careers', 'Blog', 'Contact']} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FooterColumn heading="Resources" items={['Help Center', 'Community', 'Status']} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              © 2026 LearnSpace. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}