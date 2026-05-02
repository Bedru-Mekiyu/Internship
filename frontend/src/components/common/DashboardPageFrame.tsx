import type { ReactNode } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { card, SPACING } from '../../pages/dashboard/dashboardTokens';

type DashboardPageFrameProps = {
  title: string;
  description: string;
  eyebrow?: string;
  actionLabel?: string;
  actionTo?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; to?: string }>;
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
  eyebrow,
  actionLabel,
  actionTo,
  actions,
  breadcrumbs,
  children,
}: DashboardPageFrameProps) {
  const hasAction = actionLabel && actionTo;

  return (
    <Stack spacing={SPACING.lg}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {breadcrumbs.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
              {index > 0 && <Typography variant="body2" sx={{ mx: 0.5, color: 'text.secondary' }}>/</Typography>}
              {item.to ? (
                <Typography
                  component={RouterLink}
                  to={item.to}
                  variant="body2"
                  sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {item.label}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {item.label}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      ) : null}
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
          {eyebrow ? (
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.1em' }}>
              {eyebrow}
            </Typography>
          ) : null}
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ mt: 0.75, color: 'text.secondary', maxWidth: 760 }}>
            {description}
          </Typography>
        </Box>
        {hasAction ? (
          <Button
            component={RouterLink}
            to={actionTo}
            variant="contained"
            sx={{ borderRadius: 2, px: 2.5, py: 1.2, cursor: 'pointer' }}
          >
            {actionLabel}
          </Button>
        ) : actions ? (
          actions
        ) : null}
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
