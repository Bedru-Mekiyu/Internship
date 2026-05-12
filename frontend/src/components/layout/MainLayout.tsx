import { Box, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout() {
  const theme = useTheme<import('@mui/material').Theme>();
  const primaryMain = theme.palette.primary.main;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <a
        href="#main-content"
        className="skip-link"
        style={{
          position: 'absolute',
          top: -40,
          left: 16,
          zIndex: 9999,
          padding: '8px 16px',
          backgroundColor: primaryMain,
          color: 'white',
          borderRadius: '0 0 8px 8px',
          fontWeight: 700,
          fontSize: '0.875rem',
          textDecoration: 'none',
          transition: 'top 200ms ease',
        }}
        onFocus={(e) => { e.currentTarget.style.top = '0'; }}
        onBlur={(e) => { e.currentTarget.style.top = '-40px'; }}
      >
        Skip to main content
      </a>
      <Header />
      <Box component="main" id="main-content" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
