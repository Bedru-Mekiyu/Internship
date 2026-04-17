import { Avatar, Box, Card, CardContent, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { CloseOutlined } from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

export type SidebarNavItem = {
  label: string;
  icon: ReactNode;
  to?: string;
  onClick?: () => void;
  badge?: number;
  selected?: boolean;
  exact?: boolean;
  matchPaths?: string[];
};

export type SidebarNavSection = {
  heading: string;
  items: SidebarNavItem[];
};

type SidebarProfile = {
  displayName?: string;
  roleLabel?: string;
  initials?: string;
  avatarSrc?: string;
};

type AppSidebarProps = {
  brandIcon: ReactNode;
  brandTitle: string;
  brandSubtitle?: string;
  sections: SidebarNavSection[];
  onClose?: () => void;
  profile?: SidebarProfile;
  profileTrailingIcon?: ReactNode;
  /** `soft` matches LearnSpace mockups (tinted active row). `filled` uses solid primary. */
  navStyle?: 'soft' | 'filled';
};

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'LS'
  );
}

function isPathMatch(pathname: string, to: string, exact?: boolean): boolean {
  if (exact) {
    return pathname === to;
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function AppSidebar({
  brandIcon,
  brandTitle,
  brandSubtitle,
  sections,
  onClose,
  profile,
  profileTrailingIcon,
  navStyle = 'soft',
}: AppSidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const muiTheme = useTheme();
  const primary = muiTheme.palette.primary.main;

  const fallbackName = useMemo(() => {
    const firstName = user?.firstName?.trim() || '';
    const lastName = user?.lastName?.trim() || '';
    return [firstName, lastName].filter(Boolean).join(' ') || user?.email || 'User';
  }, [user?.email, user?.firstName, user?.lastName]);

  const displayName = profile?.displayName || fallbackName;
  const roleLabel = profile?.roleLabel || (user?.role ? user.role.replace('_', ' ') : 'Member');
  const initials = profile?.initials || getInitials(displayName);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 3, p: 2.5 }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 3 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              bgcolor: 'primary.main',
              color: '#FFFFFF',
              display: 'grid',
              placeItems: 'center',
              boxShadow: `0 10px 22px ${alpha(primary, 0.28)}`,
              flexShrink: 0,
            }}
          >
            {brandIcon}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              {brandTitle}
            </Typography>
            {brandSubtitle ? (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {brandSubtitle}
              </Typography>
            ) : null}
          </Box>
          {onClose ? (
            <IconButton sx={{ ml: 'auto', display: { xs: 'inline-flex', lg: 'none' } }} onClick={onClose}>
              <CloseOutlined />
            </IconButton>
          ) : null}
        </Box>

        {sections.map((section) => (
          <Box key={section.heading} sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, px: 1.5, mb: 1, display: 'block' }}>
              {section.heading.toUpperCase()}
            </Typography>
            <List disablePadding sx={{ display: 'grid', gap: 0.75 }}>
              {section.items.map((item) => {
                const customMatch = item.matchPaths?.some((path) => isPathMatch(location.pathname, path, item.exact));
                const routeMatch = item.to ? isPathMatch(location.pathname, item.to, item.exact) : false;
                const active = item.selected ?? customMatch ?? routeMatch;
                const softActiveBg = alpha(primary, 0.12);
                const softHoverBg = alpha(primary, 0.08);

                return (
                  <ListItemButton
                    key={item.label}
                    component={item.to ? RouterLink : 'button'}
                    to={item.to || undefined}
                    selected={active}
                    onClick={() => {
                      item.onClick?.();
                      onClose?.();
                    }}
                    sx={
                      navStyle === 'soft'
                        ? {
                            borderRadius: '14px',
                            minHeight: 48,
                            px: 1.5,
                            justifyContent: 'flex-start',
                            color: active ? 'primary.main' : 'text.primary',
                            bgcolor: active ? softActiveBg : 'transparent',
                            '& .MuiListItemIcon-root': {
                              color: active ? 'primary.main' : 'text.secondary',
                              minWidth: 40,
                            },
                            '&.Mui-selected': {
                              bgcolor: softActiveBg,
                              color: 'primary.main',
                              '&:hover': { bgcolor: alpha(primary, 0.16) },
                            },
                            '&:hover': { bgcolor: active ? alpha(primary, 0.16) : softHoverBg },
                          }
                        : {
                            borderRadius: '14px',
                            minHeight: 48,
                            px: 1.5,
                            justifyContent: 'flex-start',
                            color: active ? '#FFFFFF' : 'text.primary',
                            bgcolor: active ? 'primary.main' : 'transparent',
                            '& .MuiListItemIcon-root': { color: active ? '#FFFFFF' : 'text.secondary', minWidth: 40 },
                            '&.Mui-selected': { bgcolor: 'primary.main', color: '#FFFFFF', '&:hover': { bgcolor: 'primary.dark' } },
                            '&:hover': { bgcolor: active ? 'primary.dark' : alpha(primary, 0.06) },
                          }
                    }
                  >
                    <ListItemIcon>
                      {item.badge ? (
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          {item.icon}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -4,
                              right: -8,
                              minWidth: 18,
                              height: 18,
                              px: 0.5,
                              borderRadius: '999px',
                              bgcolor: '#EF4444',
                              color: '#FFFFFF',
                              fontSize: 11,
                              fontWeight: 700,
                              display: 'grid',
                              placeItems: 'center',
                            }}
                          >
                            {item.badge}
                          </Box>
                        </Box>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>} />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Card sx={{ boxShadow: 'none', border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={profile?.avatarSrc} sx={{ width: 42, height: 42, bgcolor: alpha(primary, 0.12), color: 'primary.main', fontWeight: 800 }}>
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
                {displayName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                {roleLabel}
              </Typography>
            </Box>
            {profileTrailingIcon}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
