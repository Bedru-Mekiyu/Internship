import { Box, Container, Grid, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { publicFooterColumns, publicFooterLegalLinks } from './publicNavigation';

function BrandMark() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 16,
          height: 16,
          display: 'grid',
          placeItems: 'center',
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        <Box component="svg" viewBox="0 0 24 24" aria-hidden="true" sx={{ width: '100%', height: '100%' }}>
          <path
            fill="currentColor"
            d="M12 2.75 14.35 9 21 11.35l-6.65 2.3L12 21.25l-2.35-7.6L3 11.35 9.65 9 12 2.75Z"
          />
        </Box>
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: 'primary.main' }}>
        LearnSpace
      </Typography>
    </Box>
  );
}

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
      <Container maxWidth={false} sx={{ maxWidth: 1368, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 5, md: 6.5 } }}>
        <Grid container spacing={{ xs: 4, md: 8 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <BrandMark />
            <Typography sx={{ color: 'text.secondary', mt: 2, maxWidth: 250, lineHeight: 1.6, fontSize: '0.72rem' }}>
              Empowering educators to share knowledge and build sustainable businesses online.
            </Typography>
          </Grid>
          {publicFooterColumns.map((column) => (
            <Grid key={column.title} size={{ xs: 12, sm: 4, md: 2 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 800, mb: 1.8, fontSize: '0.74rem' }}>
                {column.title}
              </Typography>
              <Stack spacing={1.15}>
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    component={RouterLink}
                    to={link.to}
                    underline="none"
                    sx={{ color: 'text.secondary', fontSize: '0.7rem', '&:hover': { color: 'primary.main' } }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth={false} sx={{ maxWidth: 1368, mx: 'auto', px: { xs: 2, md: 4 }, py: 2.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.64rem' }}>
              &copy; {new Date().getFullYear()} LearnSpace. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.2 }}>
              {publicFooterLegalLinks.map((link) => (
                <Link key={link.label} component={RouterLink} to={link.to} underline="none" sx={{ color: 'text.secondary', fontSize: '0.66rem' }}>
                  {link.label}
                </Link>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
