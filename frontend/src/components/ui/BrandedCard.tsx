import type { ReactNode } from 'react';
import { Box, Card, CardContent, Stack, type CardProps } from '@mui/material';

interface BrandedCardProps extends CardProps {
  children: ReactNode;
  maxWidth?: number | string;
}

export default function BrandedCard({
  children,
  maxWidth = 420,
  sx,
  ...cardProps
}: BrandedCardProps) {
  return (
    <Card
      sx={{
        width: '100%',
        maxWidth,
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        ...sx,
      }}
      {...cardProps}
    >
      <CardContent sx={{ p: { xs: 2.25, sm: 2.75, md: 3 } }}>
        {children}
      </CardContent>
    </Card>
  );
}

const authFormSpacing = {
  stack: 2,
  field: 2,
} as const;

export function AuthFormFields({ children }: { children: ReactNode }) {
  return <Stack spacing={authFormSpacing.field}>{children}</Stack>;
}

const pageSpacing = {
  container: { xs: 2.25, sm: 2.75, md: 3 },
  card: { xs: 2.25, sm: 2.75, md: 3 },
  section: { xs: 2, sm: 2.5, md: 3 },
} as const;

export function PageContainer({ children, sx }: { children: ReactNode; sx?: Record<string, unknown> }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: pageSpacing.container,
        py: { xs: 3.25, md: 4 },
        bgcolor: 'background.default',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
