import { Alert, Box, Card, CardContent, Container, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useMemo } from 'react';
import { useGetContentListQuery } from '../../store/api/contentApi';

const postCardSx = {
  textDecoration: 'none',
  color: 'inherit',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
} as const;

export default function BlogLandingPage() {
  const { data, isLoading, isError } = useGetContentListQuery();

  const posts = useMemo(() => {
    const items = data ?? [];
    const typed = items.filter((item) => item.type === 'post');
    const source = typed.length > 0 ? typed : items;
    return [...source]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
  }, [data]);

  const featured = posts[0];
  const rest = posts.slice(1, 6);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
              LearnSpace Blog
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Fresh articles published from the backend CMS.
            </Typography>
          </Stack>

          {isError ? <Alert severity="error">Could not load blog content.</Alert> : null}

          {isLoading ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading blog content...
            </Typography>
          ) : null}

          {!isLoading && posts.length === 0 ? (
            <Alert severity="info">No published blog posts are available yet.</Alert>
          ) : null}

          {featured ? (
            <Grid container spacing={{ xs: 1.5, md: 2 }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Card
                  component={RouterLink}
                  to={`/blog/${featured.slug}`}
                  sx={{
                    height: '100%',
                    ...postCardSx,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                      {featured.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
                      Published {new Date(featured.updatedAt || featured.createdAt || 0).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Stack spacing={2}>
                  {rest.map((post) => (
                    <Card
                      key={post._id}
                      component={RouterLink}
                      to={`/blog/${post.slug}`}
                      sx={postCardSx}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {post.title}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.9, color: 'text.secondary' }}>
                          {new Date(post.updatedAt || post.createdAt || 0).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}
