import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { LogoutOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
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

  const navigationSections: NavigationSection[] = getNavigationItemsForRole(currentRole);

  const userInitials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.trim() || 'LS'
    : 'LS';

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            px: 2,
            py: 2.5,
            borderRightColor: 'divider',
            backgroundImage: `linear-gradient(180deg, #FFFFFF 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          },
        }}
      >
        <Box>
          {/* Brand Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: 'primary.main',
                color: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                boxShadow: `0 10px 22px ${alpha(theme.palette.primary.main, 0.28)}`,
                flexShrink: 0,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 900, fontSize: 18 }}>LS</Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                LearnSpace
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Learning Platform
              </Typography>
            </Box>
          </Box>

          {/* User Info Card */}
          {user && (
            <Card sx={{ mb: 2.5, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 42,
                      height: 42,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: 'primary.main',
                      fontWeight: 800,
                    }}
                  >
                    {userInitials}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }} noWrap>
                      {user.role}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Navigation Sections */}
          {navigationSections.map((section) => (
            <Box key={section.heading} sx={{ mb: 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 800,
                  px: 1.5,
                  mb: 1,
                  display: 'block',
                  textTransform: 'uppercase',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                }}
              >
                {section.heading}
              </Typography>
              <List disablePadding sx={{ display: 'grid', gap: 0.75 }}>
                {section.items.map((item) => {
                  const targetPath = item.to === '/dashboard' ? getLandingRouteForRole(currentRole) : item.to;
                  const active = isActiveRoute(location.pathname, targetPath);

                  return (
                    <ListItemButton
                      key={item.label}
                      selected={active}
                      component={RouterLink}
                      to={targetPath}
                      sx={{
                        borderRadius: '12px',
                        minHeight: 44,
                        px: 1.5,
                        justifyContent: 'flex-start',
                        color: active ? 'primary.main' : 'text.primary',
                        bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                        '& .MuiListItemIcon-root': {
                          color: active ? 'primary.main' : 'text.secondary',
                          minWidth: 40,
                        },
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: 'primary.main',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.16) },
                        },
                        '&:hover': {
                          bgcolor: active ? alpha(theme.palette.primary.main, 0.16) : alpha(theme.palette.primary.main, 0.06),
                        },
                      }}
                    >
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
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

        {/* Footer with Logout */}
        <Box>
          <Divider sx={{ mb: 2 }} />
          <Button
            onClick={() => {
              void logout();
            }}
            variant="outlined"
            fullWidth
            disabled={isLoading}
            startIcon={<LogoutOutlined />}
            sx={{
              py: 1.25,
              borderRadius: '12px',
              borderColor: '#E2E8F0',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'error.light',
                color: 'error.main',
                backgroundColor: alpha(theme.palette.error.main, 0.04),
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          ml: `${drawerWidth}px`,
          minHeight: '100vh',
          px: { xs: 2, lg: 2.5 },
          py: { xs: 2, lg: 2.5 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
