import { useMemo, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Link,
} from '@mui/material';
import { CloseOutlined, MenuOutlined } from '@mui/icons-material';
import { publicHeaderLinks, isPublicNavActive } from './publicNavigation';

function BrandMark() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
      <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
        LearnSpace
      </Typography>
    </Box>
  );
}

export default function Header() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeLink = useMemo(
    () =>
      publicHeaderLinks.find((link) => isPublicNavActive(location.pathname, location.hash, link.to))?.to ?? null,
    [location.hash, location.pathname],
  );

  const closeMobileMenu = () => setMobileOpen(false);

  const navLinks = (
    <>
      {publicHeaderLinks.map((link) => {
        const active = activeLink === link.to;

        return (
          <Link
            key={link.label}
            component={RouterLink}
            to={link.to}
            underline="none"
            sx={{
              color: active ? 'primary.main' : 'text.secondary',
              fontSize: '0.68rem',
              fontWeight: 700,
              '&:hover': { color: 'primary.main' },
            }}
            onClick={closeMobileMenu}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: (appTheme) => appTheme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 4 }, maxWidth: 1368, width: '100%', mx: 'auto', gap: 2 }}>
        {!isDesktop ? (
          <IconButton edge="start" aria-label="open navigation" onClick={() => setMobileOpen(true)} sx={{ mr: 0.5 }}>
            <MenuOutlined />
          </IconButton>
        ) : null}

        <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
          <BrandMark />
        </Box>

        {isDesktop ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, ml: 2 }}>{navLinks}</Box> : <Box sx={{ flex: 1 }} />}

        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Link component={RouterLink} to="/auth/login" underline="none" sx={{ color: 'text.secondary', fontSize: '0.72rem', fontWeight: 700 }}>
            Log in
          </Link>
          <Button component={RouterLink} to="/auth/signup" variant="contained" sx={{ px: 1.8, py: 0.55, fontSize: '0.68rem' }}>
            Get Started
          </Button>
        </Box>
      </Toolbar>

      <Drawer
        anchor="left"
        open={!isDesktop && mobileOpen}
        onClose={closeMobileMenu}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 'min(88vw, 320px)',
            boxSizing: 'border-box',
            p: 2,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <BrandMark />
          <IconButton aria-label="close navigation" onClick={closeMobileMenu}>
            <CloseOutlined />
          </IconButton>
        </Box>

        <List disablePadding sx={{ display: 'grid', gap: 0.75 }}>
          {publicHeaderLinks.map((link) => {
            const active = activeLink === link.to;

            return (
              <ListItemButton
                key={link.label}
                component={RouterLink}
                to={link.to}
                selected={active}
                onClick={closeMobileMenu}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: active ? 'action.selected' : 'transparent',
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: active ? 'primary.main' : 'text.primary' }}>
                      {link.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ mt: 'auto', pt: 2, display: 'grid', gap: 1.25 }}>
          <Button component={RouterLink} to="/auth/login" variant="outlined" onClick={closeMobileMenu}>
            Log in
          </Button>
          <Button component={RouterLink} to="/auth/signup" variant="contained" onClick={closeMobileMenu}>
            Get Started
          </Button>
        </Box>
      </Drawer>
    </AppBar>
  );
}
