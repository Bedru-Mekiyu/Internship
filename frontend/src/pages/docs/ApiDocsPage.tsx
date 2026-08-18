import { useEffect, useRef, useState } from 'react';
import {
  Box,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';

declare global {
  interface Window {
    SwaggerUIBundle: ((options: Record<string, unknown>) => void) & {
      presets: {
        apis: unknown;
      };
    };
  }
}

export default function ApiDocsPage() {
  const swaggerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;

    const loadSwagger = async () => {
      try {
        // Fetch the OpenAPI spec from the backend
        const response = await fetch('/api/docs/json');
        if (!response.ok) {
          throw new Error(`Failed to load API spec (HTTP ${response.status})`);
        }
        const spec = await response.json();

        // Load Swagger UI stylesheet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css';
        document.head.appendChild(link);

        // Load Swagger UI bundle
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js';
        script.onload = () => {
          if (disposed) return;
          const SB = window.SwaggerUIBundle;
          if (swaggerRef.current && SB) {
            SB({
              spec,
              domNode: swaggerRef.current,
              presets: [
                SB.presets.apis,
              ],
              layout: 'BaseLayout',
              deepLinking: true,
              showExtensions: true,
              showCommonExtensions: true,
              defaultModelsExpandDepth: 1,
              defaultModelExpandDepth: 1,
              docExpansion: 'list',
              filter: true,
              tryItOutEnabled: true,
            });
          }
          if (!disposed) setLoading(false);
        };
        script.onerror = () => {
          if (!disposed) {
            setError('Failed to load Swagger UI. Please try refreshing the page.');
            setLoading(false);
          }
        };
        document.body.appendChild(script);
      } catch (err) {
        if (!disposed) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          setLoading(false);
        }
      }
    };

    loadSwagger();

    return () => {
      disposed = true;
    };
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.paper', color: 'text.primary', minHeight: '100vh' }}>
      <Box
        sx={{
          pt: { xs: 4, md: 6 },
          pb: { xs: 2, md: 3 },
          bgcolor: 'background.default',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={1.5} sx={{ textAlign: 'center' }}>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.2em' }}
            >
              DEVELOPERS
            </Typography>
            <Typography
              variant="h3"
              sx={{ fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              API Documentation
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              Explore the LearnSpace API endpoints, request formats, and authentication methods.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Stack spacing={2} sx={{ alignItems: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Loading API documentation...
              </Typography>
            </Stack>
          </Box>
        )}

        {error && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 700, mb: 1 }}>
              Error Loading Documentation
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {error}
            </Typography>
          </Box>
        )}

        <div ref={swaggerRef} />
      </Container>
    </Box>
  );
}
