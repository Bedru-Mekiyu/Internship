import { useMemo, useState } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { MenuOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import {
  drawerWidth,
  getLandingRouteForRole,
  getNavigationItemsForRole,
  isActiveRoute,
  type NavigationSection,
} from './learnSpaceNavigation';

export default function LearnSpaceShell() {
  const location = useLocation();
  const { user, isLoading, logout } = useAuth();
  const currentRole = user?.role ?? null;
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigationSections: NavigationSection[] = useMemo(
    () => getNavigationItemsForRole(currentRole),
    [currentRole],
  );
  const navigationItems = useMemo(
    () => navigationSections.flatMap((section) => section.items),
    [navigationSections],
  );
  const activeItem = useMemo(() => {
    return navigationItems.find((item) => {
      const targetPath = item.to === '/dashboard' ? getLandingRouteForRole(currentRole) : item.to;
      return isActiveRoute(location.pathname, targetPath);
    });
  }, [currentRole, location.pathname, navigationItems]);
  const topAction = useMemo(() => {
    if (currentRole === 'instructor' && location.pathname.startsWith('/courses')) {
      return { label: 'Create Course', to: '/courses/new' };
    }
    if (currentRole === 'student' && location.pathname.startsWith('/courses')) {
      return { label: 'Explore Courses', to: '/courses/explore' };
    }
    return null;
  }, [currentRole, location.pathname]);

  const closeMobileDrawer = () => {
    if (!isDesktop) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          px: 2,
          py: 2,
        }}
      >
        {navigationSections.map((section) => (
          <Box key={section.heading} sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 700,
                px: 1,
                mb: 0.75,
                display: 'block',
                textTransform: 'uppercase',
                fontSize: 10,
                letterSpacing: '0.08em',
              }}
            >
              {section.heading}
            </Typography>
            <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
              {section.items.map((item) => {
                const targetPath = item.to === '/dashboard' ? getLandingRouteForRole(currentRole) : item.to;
                const active = isActiveRoute(location.pathname, targetPath);

                return (
                  <ListItemButton
                    key={item.label}
                    selected={active}
                    component={RouterLink}
                    to={targetPath}
                    onClick={closeMobileDrawer}
                    sx={{
                      borderRadius: 1.5,
                      minHeight: 40,
                      px: 1.25,
                      justifyContent: 'flex-start',
                      color: active ? 'primary.main' : 'text.primary',
                      bgcolor: active ? alpha(muiTheme.palette.primary.main, 0.1) : 'transparent',
                      '& .MuiListItemIcon-root': {
                        color: active ? 'primary.main' : 'text.secondary',
                        minWidth: 34,
                      },
                      '&.Mui-selected': {
                        bgcolor: alpha(muiTheme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        '&:hover': { bgcolor: alpha(muiTheme.palette.primary.main, 0.14) },
                      },
                      '&:hover': {
                        bgcolor: active
                          ? alpha(muiTheme.palette.primary.main, 0.14)
                          : alpha(muiTheme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 60, sm: 64, lg: 72 }, px: { xs: 2, sm: 2.5, lg: 3 } }}>
          {!isDesktop ? (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open navigation"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1.5 }}
            >
              <MenuOutlined />
            </IconButton>
          ) : null}
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }} noWrap>
              {activeItem?.label || 'LearnSpace Dashboard'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }} noWrap>
              {activeItem ? 'Connected LMS module' : 'Learning Platform'}
            </Typography>
          </Box>
          {topAction ? (
            <Button component={RouterLink} to={topAction.to} variant="contained" sx={{ mr: { xs: 0, sm: 1.5 } }}>
              {topAction.label}
            </Button>
          ) : null}
          {user ? (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }} noWrap>
                {user.role.replace('_', ' ')}
              </Typography>
            </Box>
          ) : null}
          {user ? (
            <Button
              onClick={() => {
                void logout();
              }}
              variant="text"
              disabled={isLoading}
              sx={{
                ml: 1.5,
                px: 1.25,
                py: 0.65,
                minWidth: 0,
                borderRadius: 1.25,
                fontWeight: 700,
                lineHeight: 1,
                color: 'error.main',
              }}
            >
              Logout
            </Button>
          ) : null}
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: { xs: 'min(86vw, 320px)', lg: drawerWidth },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: { xs: 'min(86vw, 320px)', lg: drawerWidth },
            boxSizing: 'border-box',
            borderRightColor: 'divider',
            top: { xs: '60px', sm: '64px', lg: '72px' },
            height: { xs: 'calc(100% - 60px)', sm: 'calc(100% - 64px)', lg: 'calc(100% - 72px)' },
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          ml: { lg: `${drawerWidth}px` },
          minHeight: '100vh',
          maxWidth: '100%',
          overflowX: 'hidden',
          px: { xs: 1.5, sm: 2, lg: 2.5 },
          py: { xs: 1.5, sm: 2, lg: 2.5 },
          pt: { xs: 9, sm: 10, lg: 11 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
