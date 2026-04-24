import type { ReactNode } from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { card, SPACING } from '../../pages/dashboard/dashboardTokens';

type DashboardPageFrameProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

type DashboardSectionProps = {
  children: ReactNode;
  action?: ReactNode;
  title?: string;
  description?: string;
  cardContentSx?: Record<string, unknown>;
};

export default function DashboardPageFrame({
  title,
  description,
  actions,
  children,
}: DashboardPageFrameProps) {
  return (
    <Stack spacing={SPACING.lg}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: SPACING.md,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ mt: 0.75, color: 'text.secondary', maxWidth: 760 }}>
            {description}
          </Typography>
        </Box>
        {actions}
      </Box>
      {children}
    </Stack>
  );
}

export function DashboardSection({
  children,
  action,
  title,
  description,
  cardContentSx,
}: DashboardSectionProps) {
  return (
    <Card sx={card}>
      <CardContent sx={{ p: SPACING.cardPadding, ...(cardContentSx || {}) }}>
        {title ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: SPACING.md,
              flexWrap: 'wrap',
              mb: SPACING.lg,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {title}
              </Typography>
              {description ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {description}
                </Typography>
              ) : null}
            </Box>
            {action}
          </Box>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
}
