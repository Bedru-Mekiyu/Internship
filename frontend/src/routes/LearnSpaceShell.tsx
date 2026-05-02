import { useMemo, useState } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  LogoutOutlined,
  MailOutlineOutlined,
  MenuOutlined,
  NotificationsNoneOutlined,
  SearchOutlined,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { sanitizeHttpUrl } from '../utils/safeUrl';
import {
  drawerWidth,
  getLandingRouteForRole,
  getNavigationItemsForRole,
  isActiveRoute,
  type NavigationSection,
} from './learnSpaceNavigation';

function ShellLogo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
      <Box
        component="span"
        sx={{
          width: 24,
          height: 24,
          display: 'grid',
          placeItems: 'center',
          color: '#4F46E5',
          flexShrink: 0,
        }}
      >
        <Box component="svg" viewBox="0 0 24 24" aria-hidden="true" sx={{ width: 22, height: 22 }}>
          <path
            fill="currentColor"
            d="M13.65 2.25 4.25 13h6.65l-1.25 8.75 10.1-11.55h-6.9l.8-7.95Z"
          />
        </Box>
      </Box>
      <Typography sx={{ color: '#111827', fontWeight: 900, fontSize: '1rem', letterSpacing: 0 }}>
        LearnSpace
      </Typography>
    </Box>
  );
}

function sectionHeading(label: string, index: number) {
  if (label === 'Settings') return 'SETTINGS';
  if (index === 0 || label === 'Overview') return 'MAIN MENU';
  return label.toUpperCase();
}

export default function LearnSpaceShell() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentRole = user?.role ?? null;
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await api.get<{ unreadCount: number }>('/api/notifications/me/unread-count');
      return response.data;
    },
    enabled: Boolean(user),
  });

  const unreadCount = unreadData?.unreadCount ?? 0;

  const navigationSections: NavigationSection[] = useMemo(
    () => getNavigationItemsForRole(currentRole),
    [currentRole],
  );
  const navigationItems = useMemo(
    () => navigationSections.flatMap((section) => section.items),
    [navigationSections],
  );

  const activeItem = useMemo(() => {
    return navigationItems
      .map((item) => ({
        item,
        targetPath: item.to === '/dashboard' ? getLandingRouteForRole(currentRole) : item.to,
      }))
      .filter(({ targetPath }) => (targetPath === '/courses' ? location.pathname === targetPath : isActiveRoute(location.pathname, targetPath)))
      .sort((left, right) => right.targetPath.length - left.targetPath.length)[0]?.item;
  }, [currentRole, location.pathname, navigationItems]);

  const topAction = useMemo(() => {
    if (currentRole === 'instructor' && location.pathname.startsWith('/courses')) {
      return { label: 'Create Course', to: '/courses/new' };
    }
    if (currentRole === 'student' && location.pathname.startsWith('/courses') && location.pathname !== '/courses/browse') {
      return { label: 'Explore Courses', to: '/courses/browse' };
    }
    return null;
  }, [currentRole, location.pathname]);

  const closeMobileDrawer = () => {
    if (!isDesktop) {
      setMobileOpen(false);
    }
  };

  const roleLabel = user?.role ? user.role.replace('_', ' ') : 'member';
  const avatarSrc = sanitizeHttpUrl(user?.avatar);
  const avatarInitials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';
  const searchPlaceholder = activeItem?.label === 'Profile' ? 'Search settings...' : 'Search LearnSpace...';

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#EFF3FA' }}>
      <Box sx={{ px: 2.35, height: 66, display: 'flex', alignItems: 'center' }}>
        <ShellLogo />
      </Box>

      <Box sx={{ px: 2, py: 1.2, flex: 1, overflowY: 'auto' }}>
        {navigationSections.map((section, sectionIndex) => (
          <Box key={section.heading} sx={{ mb: 2.05 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#6B7280',
                fontWeight: 800,
                px: 0.75,
                mb: 0.65,
                display: 'block',
                fontSize: 10,
                letterSpacing: 0,
              }}
            >
              {sectionHeading(section.heading, sectionIndex)}
            </Typography>
            <List disablePadding sx={{ display: 'grid', gap: 0.35 }}>
              {section.items.map((item) => {
                const targetPath = item.to === '/dashboard' ? getLandingRouteForRole(currentRole) : item.to;
                const active = targetPath === '/courses' ? location.pathname === targetPath : isActiveRoute(location.pathname, targetPath);
                const showBadge = item.label === 'Messages' && unreadCount > 0;

                return (
                  <ListItemButton
                    key={item.label}
                    selected={active}
                    component={RouterLink}
                    to={targetPath}
                    onClick={closeMobileDrawer}
                    sx={{
                      minHeight: 36,
                      borderRadius: 1,
                      px: 0.75,
                      color: active ? '#4F46E5' : '#111827',
                      bgcolor: active ? '#EEF2FF' : 'transparent',
                      '& .MuiListItemIcon-root': {
                        color: active ? '#4F46E5' : '#111827',
                        minWidth: 30,
                      },
                      '&.Mui-selected': {
                        bgcolor: '#EEF2FF',
                        color: '#4F46E5',
                        '&:hover': { bgcolor: '#E6EAFF' },
                      },
                      '&:hover': {
                        bgcolor: active ? '#E6EAFF' : alpha('#4F46E5', 0.05),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ '& svg': { fontSize: 17 } }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: active ? 800 : 700, fontSize: '0.78rem', lineHeight: 1.2 }} noWrap>
                          {item.label}
                        </Typography>
                      }
                    />
                    {showBadge ? (
                      <Box
                        sx={{
                          minWidth: 17,
                          height: 17,
                          px: 0.5,
                          borderRadius: 999,
                          bgcolor: '#5B4CF6',
                          color: '#FFFFFF',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '0.62rem',
                          fontWeight: 800,
                        }}
                      >
                        {Math.min(unreadCount, 9)}
                      </Box>
                    ) : null}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {user ? (
        <Box sx={{ p: 1.4, borderTop: '1px solid #DDE4F0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.05, borderRadius: 1.2, px: 0.45, py: 0.5 }}>
            <Avatar
              src={avatarSrc || undefined}
              alt={`${user.firstName} ${user.lastName}`}
              sx={{ width: 32, height: 32, fontSize: '0.78rem', fontWeight: 800, bgcolor: '#DDE7F7', color: '#4F46E5' }}
            >
              {avatarInitials}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ color: '#111827', fontWeight: 800, lineHeight: 1.2, fontSize: '0.76rem' }} noWrap>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography sx={{ color: '#6B7280', textTransform: 'capitalize', lineHeight: 1.2, fontSize: '0.66rem' }} noWrap>
                {roleLabel}
              </Typography>
            </Box>
            <Tooltip title="Log out">
              <IconButton
                size="small"
                onClick={() => {
                  void logout();
                }}
                sx={{ color: '#6B7280' }}
              >
                <LogoutOutlined sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ) : null}
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4F7FB' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          borderBottom: '1px solid #DDE4F0',
          bgcolor: '#FFFFFF',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: 66, px: { xs: 2, sm: 2.6, lg: 3.2 }, gap: 1.6 }}>
          {!isDesktop ? (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open navigation"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 0.5 }}
            >
              <MenuOutlined />
            </IconButton>
          ) : null}

          <Box
            sx={{
              width: { xs: '100%', sm: 320 },
              maxWidth: 360,
              height: 34,
              borderRadius: 1,
              bgcolor: '#F1F4FC',
              display: 'flex',
              alignItems: 'center',
              px: 1.15,
              gap: 0.8,
            }}
          >
            <SearchOutlined sx={{ color: '#7C8798', fontSize: 17 }} />
            <InputBase
              placeholder={searchPlaceholder}
              inputProps={{ 'aria-label': searchPlaceholder }}
              sx={{ flex: 1, color: '#111827', fontSize: '0.75rem' }}
            />
          </Box>

          <Box sx={{ flex: 1 }} />

          <IconButton component={RouterLink} to="/notifications" sx={{ color: '#4B5563', width: 36, height: 36 }}>
            <Badge color="primary" badgeContent={unreadCount || undefined} max={9}>
              <NotificationsNoneOutlined sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
          <IconButton component={RouterLink} to="/messages" sx={{ color: '#4B5563', width: 36, height: 36 }}>
            <MailOutlineOutlined sx={{ fontSize: 19 }} />
          </IconButton>

          {topAction ? (
            <Button component={RouterLink} to={topAction.to} variant="contained" sx={{ display: { xs: 'none', sm: 'inline-flex' }, ml: 0.5 }}>
              {topAction.label}
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
            borderRightColor: '#DDE4F0',
            bgcolor: '#EFF3FA',
            top: 0,
            height: '100%',
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
          bgcolor: '#F4F7FB',
          maxWidth: '100%',
          overflowX: 'hidden',
          px: { xs: 1.8, sm: 2.4, lg: 3.2 },
          pt: { xs: 9.2, sm: 10.2, lg: 10.7 },
          pb: { xs: 3, lg: 4 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
