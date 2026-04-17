import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  PersonAddAltOutlined,
  WarningAmberOutlined,
  CheckCircleOutlineOutlined,
  MoreHorizOutlined,
  ShareOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../theme';
import { api, normalizeApiError } from '../../services/api';
type NotificationTab = 'all' | 'unread' | 'mentions' | 'system';
type NotificationDate = 'TODAY' | 'YESTERDAY' | 'OLDER';
type NotificationKind = 'comment' | 'warning' | 'mention' | 'success' | 'user';

interface NotificationItem {
  id: string;
  dateGroup: NotificationDate;
  kind: NotificationKind;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  actionLabel?: string;
  avatar?: string;
}

interface ApiNotification {
  _id: string;
  title: string;
  message: string;
  type: 'enrollment' | 'assignment' | 'discussion' | 'system';
  isRead: boolean;
  createdAt?: string;
}

interface ApiNotificationsResponse {
  data: ApiNotification[];
}

function inferNotificationKind(type: ApiNotification['type']): NotificationKind {
  if (type === 'discussion') return 'mention';
  if (type === 'assignment') return 'warning';
  if (type === 'enrollment') return 'user';
  return 'success';
}

function inferDateGroup(createdAt?: string): NotificationDate {
  if (!createdAt) {
    return 'OLDER';
  }

  const sourceDate = new Date(createdAt);
  if (Number.isNaN(sourceDate.getTime())) {
    return 'OLDER';
  }

  const now = new Date();
  const midnightToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const midnightYesterday = new Date(midnightToday);
  midnightYesterday.setDate(midnightYesterday.getDate() - 1);

  if (sourceDate >= midnightToday) {
    return 'TODAY';
  }

  if (sourceDate >= midnightYesterday) {
    return 'YESTERDAY';
  }

  return 'OLDER';
}

function formatTimestamp(createdAt?: string) {
  if (!createdAt) {
    return 'Unknown time';
  }

  const sourceDate = new Date(createdAt);
  if (Number.isNaN(sourceDate.getTime())) {
    return 'Unknown time';
  }

  return sourceDate.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NotificationIcon({ kind, avatar }: { kind: NotificationKind; avatar?: string }) {
  const iconSx = { fontSize: 22 };

  if (kind === 'comment' || kind === 'mention') {
    return (
      <Avatar sx={{ width: 42, height: 42, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700 }}>
        {avatar ?? 'AM'}
      </Avatar>
    );
  }

  if (kind === 'warning') {
    return (
      <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: alpha(theme.palette.warning.main, 0.12), color: 'warning.main', display: 'grid', placeItems: 'center' }}>
        <WarningAmberOutlined sx={iconSx} />
      </Box>
    );
  }

  if (kind === 'success') {
    return (
      <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: alpha(theme.palette.success.main, 0.12), color: 'success.main', display: 'grid', placeItems: 'center' }}>
        <CheckCircleOutlineOutlined sx={iconSx} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', display: 'grid', placeItems: 'center' }}>
      <PersonAddAltOutlined sx={iconSx} />
    </Box>
  );
}

function NotificationRow({ item, onAction }: { item: NotificationItem; onAction: (item: NotificationItem) => void }) {
  const hasBlueBar = item.unread;

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 10px 24px rgba(15,23,42,0.08)',
          borderColor: 'rgba(0,102,255,0.16)',
        },
      }}
    >
      {hasBlueBar ? (
        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: 'primary.main' }} />
      ) : null}
      <CardContent sx={{ p: 2.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <NotificationIcon kind={item.kind} avatar={item.avatar} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.35 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', lineHeight: 1.55 }}>
                  {item.message}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, whiteSpace: 'nowrap', pt: 0.3 }}>
                {item.timestamp}
              </Typography>
            </Box>

            <Box sx={{ mt: 1.25, display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
              {item.actionLabel ? (
                <Button
                  size="small"
                  variant={item.actionLabel === 'Reply' ? 'text' : 'outlined'}
                  sx={{
                    px: 0,
                    minWidth: 'auto',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                  }}
                  onClick={() => onAction(item)}
                >
                  {item.actionLabel}
                </Button>
              ) : null}
              {item.kind === 'success' ? (
                <Chip
                  label="Live"
                  size="small"
                  sx={{ bgcolor: alpha(theme.palette.success.main, 0.12), color: 'success.main', fontWeight: 700 }}
                />
              ) : null}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState<NotificationTab>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['notifications', 'me'],
    queryFn: async () => {
      const response = await api.get<ApiNotificationsResponse>('/api/notifications/me', {
        params: { limit: 100 },
      });

      return response.data.data ?? [];
    },
    retry: false,
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/api/notifications/me/read-all');
    },
    onSuccess: () => {
      setStatusMessage('All notifications marked as read.');
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] });
    },
    onError: (requestError) => {
      setStatusMessage(normalizeApiError(requestError).message || 'Failed to mark all notifications as read.');
    },
  });

  const markOneAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.patch(`/api/notifications/${notificationId}/read`);
    },
    onError: (requestError) => {
      setStatusMessage(normalizeApiError(requestError).message || 'Failed to update notification.');
    },
  });

  const notifications = useMemo<NotificationItem[]>(() => {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map((item) => ({
      id: item._id,
      dateGroup: inferDateGroup(item.createdAt),
      kind: inferNotificationKind(item.type),
      title: item.title,
      message: item.message,
      timestamp: formatTimestamp(item.createdAt),
      unread: !item.isRead,
      actionLabel: item.type === 'discussion' ? 'Reply' : undefined,
    }));
  }, [data]);

  const unreadCount = useMemo(() => {
    if (!Array.isArray(notifications)) {
      return 0;
    }
    return notifications.filter((item) => item.unread).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (!Array.isArray(notifications)) {
      return [];
    }
    return notifications.filter((item) => {
      if (tab === 'unread') {
        return item.unread;
      }
      if (tab === 'mentions') {
        return item.kind === 'mention' || item.title.toLowerCase().includes('mentioned');
      }
      if (tab === 'system') {
        return item.kind === 'warning' || item.kind === 'success' || item.kind === 'user';
      }
      return true;
    });
  }, [notifications, tab]);

  const todayNotifications = useMemo(
    () => filteredNotifications.filter((item) => item.dateGroup === 'TODAY'),
    [filteredNotifications]
  );
  const yesterdayNotifications = useMemo(
    () => filteredNotifications.filter((item) => item.dateGroup === 'YESTERDAY'),
    [filteredNotifications]
  );
  const olderNotifications = useMemo(
    () => filteredNotifications.filter((item) => item.dateGroup === 'OLDER'),
    [filteredNotifications]
  );

  const markAllAsRead = () => {
    void markAllAsReadMutation.mutateAsync();
  };

  const openSettings = () => {
    navigate('/admin/settings');
  };

  const handleNotificationAction = (item: NotificationItem) => {
    void markOneAsReadMutation.mutateAsync(item.id, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] });

        if (item.actionLabel === 'Reply') {
          navigate('/messages');
          return;
        }

        if (item.actionLabel === 'Live view') {
          navigate('/pricing');
        }
      },
    });
  };

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, sm: 2.5, md: 3 } }}>
      {statusMessage ? (
        <Alert
          severity={statusMessage.toLowerCase().includes('failed') ? 'error' : 'success'}
          sx={{ mb: 2.25, borderRadius: '12px' }}
          onClose={() => setStatusMessage(null)}
        >
          {statusMessage}
        </Alert>
      ) : null}

      {isError ? (
        <Alert severity="error" sx={{ mb: 2.25, borderRadius: '12px' }}>
          {normalizeApiError(error).message || 'Could not load notifications'}
        </Alert>
      ) : null}

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Dashboard &gt; Notifications
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.75, fontWeight: 800, letterSpacing: '-0.03em' }}>
                Notifications
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<ShareOutlined />}
                onClick={markAllAsRead}
                disabled={markAllAsReadMutation.isPending || unreadCount === 0}
              >
                Mark all as read
              </Button>
              <Button variant="outlined" startIcon={<MoreHorizOutlined />} onClick={openSettings}>
                Settings
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
          <Tabs
            value={tab}
            onChange={(_, nextTab) => setTab(nextTab)}
            sx={{ minHeight: 44, '& .MuiTabs-indicator': { height: 3, borderRadius: 999 } }}
          >
            <Tab
              value="all"
              label={
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                  <Typography component="span" sx={{ fontWeight: 700 }}>
                    All Notifications
                  </Typography>
                  <Box
                    sx={{
                      minWidth: 20,
                      height: 20,
                      px: 0.7,
                      borderRadius: '999px',
                      bgcolor: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 800,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {unreadCount}
                  </Box>
                </Box>
              }
            />
            <Tab value="unread" label="Unread" />
            <Tab value="mentions" label="Mentions" />
            <Tab value="system" label="System" />
          </Tabs>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, xl: 9 }}>
          <Stack spacing={2.25}>
            {isLoading ? (
              <Card>
                <CardContent>
                  <Typography sx={{ color: 'text.secondary' }}>Loading notifications...</Typography>
                </CardContent>
              </Card>
            ) : null}

            {!isLoading && todayNotifications.length > 0 ? (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.16em', mb: 1.5, display: 'block' }}>
                  TODAY
                </Typography>
                <Stack spacing={1.5}>
                  {todayNotifications.map((item) => (
                    <NotificationRow key={item.id} item={item} onAction={handleNotificationAction} />
                  ))}
                </Stack>
              </Box>
            ) : null}

            {!isLoading && yesterdayNotifications.length > 0 ? (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.16em', mb: 1.5, display: 'block' }}>
                  YESTERDAY
                </Typography>
                <Stack spacing={1.5}>
                  {yesterdayNotifications.map((item) => (
                    <NotificationRow key={item.id} item={item} onAction={handleNotificationAction} />
                  ))}
                </Stack>
              </Box>
            ) : null}

            {!isLoading && olderNotifications.length > 0 ? (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.16em', mb: 1.5, display: 'block' }}>
                  OLDER
                </Typography>
                <Stack spacing={1.5}>
                  {olderNotifications.map((item) => (
                    <NotificationRow key={item.id} item={item} onAction={handleNotificationAction} />
                  ))}
                </Stack>
              </Box>
            ) : null}

            {!isLoading && filteredNotifications.length === 0 ? (
              <Card>
                <CardContent>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {tab === 'all' ? 'No notifications yet.' : `No ${tab} notifications.`}
                  </Typography>
                </CardContent>
              </Card>
            ) : null}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, xl: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Quick Actions
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
                Keep the notifications feed organized and actionable.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={markAllAsRead}
                  disabled={markAllAsReadMutation.isPending || unreadCount === 0}
                >
                  Mark all as read
                </Button>
                <Button variant="outlined" fullWidth onClick={openSettings}>
                  Notification settings
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
