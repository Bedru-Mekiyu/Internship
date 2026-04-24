import { Alert, Box, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { ContentBlock, ContentItem } from '../../types';
import { useGetContentBySlugQuery } from '../../store/api/contentApi';
import { sanitizeHttpUrl } from '../../utils/safeUrl';

interface CmsContentPageProps {
  slug?: string;
  eyebrow?: string;
}

const contentCardSx = {
  border: '1px solid',
  borderColor: 'divider',
} as const;

const parseContentBlocks = (content: ContentItem): ContentBlock[] => {
  if (Array.isArray(content.blocks) && content.blocks.length > 0) {
    return [...content.blocks].sort((a, b) => a.order - b.order);
  }

  if (typeof content.content === 'string' && content.content.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(content.content) as ContentBlock[];
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => a.order - b.order);
      }
    } catch {
      return [];
    }
  }

  return [];
};

function BlockRenderer({ block }: { block: ContentBlock }) {
  if (block.type === 'hero') {
    return (
      <Card sx={contentCardSx}>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
            {block.title || 'Welcome'}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, color: 'text.secondary', lineHeight: 1.8 }}>
            {block.content}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (block.type === 'image') {
    const safeImageUrl = sanitizeHttpUrl(block.content);
    return (
      <Card sx={contentCardSx}>
        <CardContent sx={{ p: 1.25 }}>
          {safeImageUrl ? (
            <Box component="img" src={safeImageUrl} alt={block.title || 'Content image'} sx={{ width: '100%', borderRadius: 1.5 }} />
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Invalid image URL.</Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  if (block.type === 'video') {
    return (
      <Card sx={contentCardSx}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {block.title || 'Video'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', wordBreak: 'break-all' }}>
            {block.content}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (block.type === 'testimonial') {
    return (
      <Card sx={contentCardSx}>
        <CardContent>
          <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.8 }}>
            “{block.content}”
          </Typography>
          {block.title ? (
            <Typography variant="body2" sx={{ mt: 1.25, color: 'text.secondary', fontWeight: 700 }}>
              — {block.title}
            </Typography>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (block.type === 'features') {
    const features = block.content.split(',').map((item) => item.trim()).filter(Boolean);
    return (
      <Card sx={contentCardSx}>
        <CardContent>
          {block.title ? (
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
              {block.title}
            </Typography>
          ) : null}
          <Stack spacing={1}>
            {features.map((feature) => (
              <Typography key={feature} variant="body2" sx={{ color: 'text.secondary' }}>
                • {feature}
              </Typography>
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (block.type === 'cta') {
    return (
      <Card sx={contentCardSx}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {block.title || 'Get started'}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.25, color: 'text.secondary' }}>
            {block.content}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (block.type === 'form') {
    return (
      <Card sx={contentCardSx}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {block.title || 'Contact form'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Fields: {block.content}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={contentCardSx}>
      <CardContent>
        {block.title ? (
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            {block.title}
          </Typography>
        ) : null}
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
          {block.content}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function CmsContentPage({ slug, eyebrow = 'Content' }: CmsContentPageProps) {
  const params = useParams<{ slug?: string }>();
  const resolvedSlug = (slug || params.slug || '').trim();
  const { data, isLoading, isError } = useGetContentBySlugQuery(resolvedSlug, { skip: !resolvedSlug });

  const blocks = useMemo(() => (data ? parseContentBlocks(data) : []), [data]);
  const hasPlainContent = Boolean(data?.content && typeof data.content === 'string' && data.content.trim() && blocks.length === 0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="md">
        <Stack spacing={2}>
          {isLoading ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading content...
            </Typography>
          ) : null}

          {isError ? (
            <Alert severity="error">This page is unavailable right now.</Alert>
          ) : null}

          {!isLoading && !isError && !data ? (
            <Alert severity="warning">No published content was found for this page yet.</Alert>
          ) : null}

          {data ? (
            <Card sx={contentCardSx}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Stack spacing={1.25}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    {eyebrow}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                    {data.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Last updated {new Date(data.updatedAt || data.createdAt || 0).toLocaleDateString()}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ) : null}

          {hasPlainContent ? (
            <Card sx={contentCardSx}>
              <CardContent>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.9 }}>
                  {data?.content}
                </Typography>
              </CardContent>
            </Card>
          ) : null}

          {blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
