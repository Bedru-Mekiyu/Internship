import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api, normalizeApiError } from '../../services/api';
import DashboardPageFrame, { DashboardSection } from '../../components/common/DashboardPageFrame';
import { card, SPACING } from './dashboardTokens';

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
    page?: number;
    limit?: number;
    totalPages?: number;
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

const formatTimestamp = (createdAt?: string) => {
  if (!createdAt) return 'Unknown time';

  const sourceDate = new Date(createdAt);
  if (Number.isNaN(sourceDate.getTime())) return 'Unknown time';

  return sourceDate.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const tabConfig: Array<{ key: NotificationTab; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'mentions', label: 'Mentions' },
  { key: 'system', label: 'System' },
];

function NotificationRow({ item, onAction }: { item: NotificationItem; onAction: (item: NotificationItem) => void }) {
  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: item.unread ? 'primary.main' : 'divider',
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack direction="row" spacing={SPACING.md} sx={{ alignItems: 'flex-start' }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-start' } }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.35 }}>
                {item.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', mt: { xs: 0, sm: 0.25 } }}>
                {item.timestamp}
              </Typography>
            </Stack>

            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, lineHeight: 1.6 }}>
              {item.message}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1.25, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {item.unread ? 'Unread' : 'Read'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'capitalize' }}>
                {item.kind}
              </Typography>
              {item.actionLabel ? (
                <Button size="small" variant="text" onClick={() => onAction(item)} sx={{ px: 0.5 }}>
                  {item.actionLabel}
                </Button>
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));

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
        timestamp: formatTimestamp(item.createdAt),
        unread: !item.isRead,
        actionLabel: item.type === 'discussion' ? 'Open thread' : 'View details',
      }));
  }, [data]);

  const counts = useMemo(() => {
    const unread = unreadData?.unreadCount ?? notifications.filter((item) => item.unread).length;
    const mentions = notifications.filter((item) => item.kind === 'mention').length;
    const system = notifications.filter((item) => item.kind === 'warning' || item.kind === 'success' || item.kind === 'user').length;

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
      if (tab === 'system') return item.kind === 'warning' || item.kind === 'success' || item.kind === 'user';
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

  const sideFilters = (
    <Card sx={{ ...card, position: { lg: 'sticky' }, top: { lg: 88 } }}>
      <List sx={{ p: 1 }}>
        {tabConfig.map((item) => (
          <ListItemButton
            key={item.key}
            selected={tab === item.key}
            onClick={() => setTab(item.key)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'background.default',
                '&:hover': { bgcolor: 'background.default' },
              },
            }}
          >
            <ListItemText primary={item.label} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {counts[item.key]}
            </Typography>
          </ListItemButton>
        ))}
      </List>
    </Card>
  );

  return (
    <DashboardPageFrame
      title="Notifications"
      description="Review alerts, mentions, and system updates in a structured feed."
      actions={(
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            onClick={() => setMarkAllConfirmOpen(true)}
            disabled={markAllAsReadMutation.isPending || counts.unread === 0}
            fullWidth={!isDesktop}
          >
            Mark all as read
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/settings')}
            fullWidth={!isDesktop}
          >
            Notification settings
          </Button>
        </Stack>
      )}
    >
      {statusMessage ? (
        <Alert severity={statusMessage.type} onClose={() => setStatusMessage(null)} sx={{ borderRadius: 2 }}>
          {statusMessage.message}
        </Alert>
      ) : null}

      {isError ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {normalizeApiError(error).message || 'Could not load notifications.'}
        </Alert>
      ) : null}

      <Grid container spacing={SPACING.lg} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, lg: 3 }}>
          {isDesktop ? sideFilters : (
            <Tabs
              value={tab}
              onChange={(_, value) => setTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 44,
                '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 700 },
              }}
            >
              {tabConfig.map((item) => (
                <Tab key={item.key} value={item.key} label={`${item.label} (${counts[item.key]})`} />
              ))}
            </Tabs>
          )}
        </Grid>

        <Grid size={{ xs: 12, lg: 9 }}>
          <Stack spacing={SPACING.lg}>
            <DashboardSection title="Notification Summary" description="Quick visibility into inbox health.">
              <Grid container spacing={SPACING.md}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{counts.all}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Unread</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>{counts.unread}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Mentions</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{counts.mentions}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DashboardSection>

            <DashboardSection
              title="Notification Feed"
              description="Notifications are grouped by date for easier scanning."
              action={(
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setMarkAllConfirmOpen(true)}
                  disabled={markAllAsReadMutation.isPending || counts.unread === 0}
                >
                  Mark all as read
                </Button>
              )}
            >
              {isLoading ? (
                <Typography sx={{ color: 'text.secondary' }}>Loading notifications...</Typography>
              ) : (
                <Stack spacing={SPACING.lg}>
                  {(['TODAY', 'YESTERDAY', 'OLDER'] as const).map((groupKey) => {
                    const items = grouped[groupKey];
                    if (!items.length) return null;

                    return (
                      <Box key={groupKey}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.14em', display: 'block', mb: 1.5 }}>
                          {groupKey}
                        </Typography>
                        <Stack spacing={SPACING.md}>
                          {items.map((item) => (
                            <NotificationRow key={item.id} item={item} onAction={handleNotificationAction} />
                          ))}
                        </Stack>
                      </Box>
                    );
                  })}

                  {!filteredNotifications.length ? (
                    <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                      <CardContent>
                        <Typography sx={{ color: 'text.secondary' }}>
                          {tab === 'all' ? 'No notifications yet.' : `No ${tab} notifications.`}
                        </Typography>
                      </CardContent>
                    </Card>
                  ) : null}
                </Stack>
              )}
            </DashboardSection>
          </Stack>
        </Grid>
      </Grid>

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
    </DashboardPageFrame>
  );
}
