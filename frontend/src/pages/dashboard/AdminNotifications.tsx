import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  CheckOutlined,
  Circle,
  LanguageOutlined,
  NotificationsActiveOutlined,
  PersonOutlineOutlined,
  SettingsOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api, normalizeApiError } from '../../services/api';
import DashboardPageFrame from '../../components/common/DashboardPageFrame';
import { BRAND } from '../../theme/brand';

type NotificationTab = 'all' | 'unread' | 'mentions' | 'system';
type NotificationDate = 'TODAY' | 'YESTERDAY' | 'OLDER';
type NotificationKind = 'warning' | 'mention' | 'success' | 'user';

interface NotificationItem {
  id: string;
  dateGroup: NotificationDate;
  kind: NotificationKind;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  actionLabel?: string;
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
  pagination?: {
    total?: number;
  };
}

interface ApiUnreadCountResponse {
  unreadCount: number;
}

const inferNotificationKind = (type: ApiNotification['type']): NotificationKind => {
  if (type === 'discussion') return 'mention';
  if (type === 'assignment') return 'warning';
  if (type === 'enrollment') return 'user';
  return 'success';
};

const inferDateGroup = (createdAt?: string): NotificationDate => {
  if (!createdAt) return 'OLDER';

  const sourceDate = new Date(createdAt);
  if (Number.isNaN(sourceDate.getTime())) return 'OLDER';

  const now = new Date();
  const midnightToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const midnightYesterday = new Date(midnightToday);
  midnightYesterday.setDate(midnightYesterday.getDate() - 1);

  if (sourceDate >= midnightToday) return 'TODAY';
  if (sourceDate >= midnightYesterday) return 'YESTERDAY';
  return 'OLDER';
};

const toRelativeTimestamp = (createdAt?: string) => {
  if (!createdAt) return 'Unknown time';
  const sourceDate = new Date(createdAt);
  if (Number.isNaN(sourceDate.getTime())) return 'Unknown time';

  const diffMs = Date.now() - sourceDate.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;

  return `Yesterday at ${sourceDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
};

const tabConfig: Array<{ key: NotificationTab; label: string }> = [
  { key: 'all', label: 'All Notifications' },
  { key: 'unread', label: 'Unread' },
  { key: 'mentions', label: 'Mentions' },
  { key: 'system', label: 'System' },
];

function kindIcon(kind: NotificationKind) {
  if (kind === 'mention') return <Avatar sx={{ width: 34, height: 34, bgcolor: BRAND.primarySoftBg, color: BRAND.primary }}><PersonOutlineOutlined sx={{ fontSize: 19 }} /></Avatar>;
  if (kind === 'warning') return <Avatar sx={{ width: 34, height: 34, bgcolor: '#FFF4DA', color: '#B7791F' }}><WarningAmberOutlined sx={{ fontSize: 19 }} /></Avatar>;
  if (kind === 'success') return <Avatar sx={{ width: 34, height: 34, bgcolor: '#DCFCE7', color: '#13803C' }}><CheckOutlined sx={{ fontSize: 19 }} /></Avatar>;
  return <Avatar sx={{ width: 34, height: 34, bgcolor: BRAND.primarySoftBg, color: BRAND.primary }}><LanguageOutlined sx={{ fontSize: 18 }} /></Avatar>;
}

function NotificationRow({ item, onAction }: { item: NotificationItem; onAction: (item: NotificationItem) => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        px: 2.25,
        py: 1.8,
        borderLeft: item.unread ? `3px solid ${BRAND.primary}` : '3px solid transparent',
        borderBottom: '1px solid',
        borderColor: '#E5EAF2',
        bgcolor: '#FFFFFF',
      }}
    >
      {kindIcon(item.kind)}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.4 }}>
          {item.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.35, lineHeight: 1.55 }}>
          {item.message}
        </Typography>
        {item.actionLabel ? (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onAction(item)}
            sx={{
              mt: 1,
              py: 0.2,
              px: 1.1,
              minWidth: 0,
              borderRadius: 1,
              textTransform: 'none',
              borderColor: '#D3DAE7',
              color: 'text.primary',
            }}
          >
            {item.actionLabel}
          </Button>
        ) : null}
      </Box>
      <Stack sx={{ alignItems: 'flex-end', minWidth: 84 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
          {item.timestamp}
        </Typography>
        <Circle sx={{ mt: 1, fontSize: 8, color: item.unread ? BRAND.primary : '#CBD5E1' }} />
      </Stack>
    </Box>
  );
}

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [tab, setTab] = useState<NotificationTab>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [markAllConfirmOpen, setMarkAllConfirmOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['notifications', 'me'],
    queryFn: async () => {
      const response = await api.get<ApiNotificationsResponse>('/api/notifications/me', {
        params: { limit: 100 },
      });
      return response.data;
    },
    retry: false,
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await api.get<ApiUnreadCountResponse>('/api/notifications/me/unread-count');
      return response.data;
    },
    retry: false,
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/api/notifications/me/read-all');
    },
    onSuccess: () => {
      setStatusMessage({ type: 'success', message: 'All notifications marked as read.' });
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (requestError) => {
      setStatusMessage({
        type: 'error',
        message: normalizeApiError(requestError).message || 'Failed to mark all notifications as read.',
      });
    },
  });

  const markOneAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.patch(`/api/notifications/${notificationId}/read`);
    },
    onError: (requestError) => {
      setStatusMessage({
        type: 'error',
        message: normalizeApiError(requestError).message || 'Failed to update notification.',
      });
    },
  });

  const notifications = useMemo<NotificationItem[]>(() => {
    if (!Array.isArray(data?.data)) return [];

    return [...data.data]
      .sort((a, b) => {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        return bDate - aDate;
      })
      .map((item) => ({
        id: item._id,
        dateGroup: inferDateGroup(item.createdAt),
        kind: inferNotificationKind(item.type),
        title: item.title,
        message: item.message,
        timestamp: toRelativeTimestamp(item.createdAt),
        unread: !item.isRead,
        actionLabel: item.type === 'discussion' ? 'Reply' : undefined,
      }));
  }, [data]);

  const counts = useMemo(() => {
    const unread = unreadData?.unreadCount ?? notifications.filter((item) => item.unread).length;
    const mentions = notifications.filter((item) => item.kind === 'mention').length;
    const system = notifications.filter((item) => item.kind !== 'mention').length;

    return {
      all: data?.pagination?.total ?? notifications.length,
      unread,
      mentions,
      system,
    };
  }, [data?.pagination?.total, notifications, unreadData?.unreadCount]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (tab === 'unread') return item.unread;
      if (tab === 'mentions') return item.kind === 'mention';
      if (tab === 'system') return item.kind !== 'mention';
      return true;
    });
  }, [notifications, tab]);

  const grouped = useMemo(
    () => ({
      TODAY: filteredNotifications.filter((item) => item.dateGroup === 'TODAY'),
      YESTERDAY: filteredNotifications.filter((item) => item.dateGroup === 'YESTERDAY'),
      OLDER: filteredNotifications.filter((item) => item.dateGroup === 'OLDER'),
    }),
    [filteredNotifications],
  );

  const handleNotificationAction = (item: NotificationItem) => {
    void markOneAsReadMutation.mutateAsync(item.id, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] });
        void queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        if (item.kind === 'mention') {
          navigate('/messages');
          return;
        }
        navigate('/admin/settings');
      },
    });
  };

  const markAllAsRead = () => {
    void markAllAsReadMutation.mutateAsync();
    setMarkAllConfirmOpen(false);
  };

  return (
    <DashboardPageFrame
      title="Notifications"
      description="View and manage your notifications and alerts."
      breadcrumbs={[
        { label: 'Dashboard', to: '/admin/dashboard' },
        { label: 'Notifications' },
      ]}
      actions={
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CheckOutlined />}
            onClick={() => setMarkAllConfirmOpen(true)}
            disabled={markAllAsReadMutation.isPending || counts.unread === 0}
            sx={{ borderColor: '#D5DBE7', bgcolor: '#FFFFFF', textTransform: 'none' }}
          >
            Mark all as read
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<SettingsOutlined />}
            onClick={() => navigate('/admin/settings')}
            sx={{ borderColor: '#D5DBE7', bgcolor: '#FFFFFF', textTransform: 'none' }}
          >
            Settings
          </Button>
        </Stack>
      }
    >
      <Box sx={{ maxWidth: 1080, mx: 'auto', width: '100%' }}>
        <Stack spacing={1.8}>
          {statusMessage ? (
            <Alert severity={statusMessage.type} onClose={() => setStatusMessage(null)} sx={{ borderRadius: 1.5 }}>
              {statusMessage.message}
            </Alert>
          ) : null}

          {isError ? (
            <Alert severity="error" sx={{ borderRadius: 1.5 }}>
              {normalizeApiError(error).message || 'Could not load notifications.'}
            </Alert>
          ) : null}

        <Card sx={{ borderRadius: 1.5, border: '1px solid', borderColor: '#DFE5F1', boxShadow: 'none' }}>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            sx={{
              minHeight: 44,
              px: 1,
              '& .MuiTab-root': {
                minHeight: 44,
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
              },
              '& .Mui-selected': { color: 'primary.main !important', fontWeight: 700 },
            }}
          >
            {tabConfig.map((item) => (
              <Tab
                key={item.key}
                value={item.key}
                label={
                  <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                      {item.label}
                    </Typography>
                    {item.key === 'all' ? (
                      <Box
                        sx={{
                          minWidth: 16,
                          height: 16,
                          px: 0.45,
                          borderRadius: 99,
                          bgcolor: '#F04438',
                          color: '#FFFFFF',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        {counts.all}
                      </Box>
                    ) : null}
                  </Stack>
                }
              />
            ))}
          </Tabs>
        </Card>

        <Card sx={{ borderRadius: 1.5, border: '1px solid', borderColor: '#DFE5F1', boxShadow: 'none', overflow: 'hidden' }}>
          {isLoading ? (
            <Box sx={{ p: 2.5 }}>
              <Typography sx={{ color: 'text.secondary' }}>Loading notifications...</Typography>
            </Box>
          ) : (
            <Box>
              {(['TODAY', 'YESTERDAY', 'OLDER'] as const).map((groupKey) => {
                const items = grouped[groupKey];
                if (!items.length) return null;

                return (
                  <Box key={groupKey}>
                    <Typography
                      variant="caption"
                      sx={{
                        px: 2.25,
                        py: 1.1,
                        display: 'block',
                        bgcolor: '#F8FAFD',
                        borderBottom: '1px solid',
                        borderColor: '#E5EAF2',
                        color: 'text.secondary',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {groupKey}
                    </Typography>
                    {items.map((item) => (
                      <NotificationRow key={item.id} item={item} onAction={handleNotificationAction} />
                    ))}
                  </Box>
                );
              })}

              {!filteredNotifications.length ? (
                <Box sx={{ p: 2.5 }}>
                  <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center' }}>
                    <NotificationsActiveOutlined sx={{ color: '#94A3B8' }} />
                    <Typography sx={{ color: 'text.secondary' }}>
                      {tab === 'all' ? 'No notifications yet.' : `No ${tab} notifications.`}
                    </Typography>
                  </Stack>
                </Box>
              ) : null}
            </Box>
          )}
        </Card>
      </Stack>

      <Dialog open={markAllConfirmOpen} onClose={() => setMarkAllConfirmOpen(false)}>
        <DialogTitle>Mark all as read?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This will update all unread notifications in your inbox.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkAllConfirmOpen(false)}>Cancel</Button>
          <Button onClick={markAllAsRead} variant="contained" disabled={markAllAsReadMutation.isPending}>
            {markAllAsReadMutation.isPending ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </DashboardPageFrame>
  );
}
