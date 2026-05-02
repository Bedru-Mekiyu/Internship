import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Grid,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import {
  BusinessCenterOutlined,
  CalendarMonthOutlined,
  CampaignOutlined,
  CheckCircleOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
  MarkEmailReadOutlined,
  NotificationsOutlined,
  PaymentOutlined,
  SchoolOutlined,
} from '@mui/icons-material';
import DashboardPageFrame from '../../components/common/DashboardPageFrame';

interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  channels: {
    inApp: boolean;
    email: boolean;
  };
}

const initialCategories: NotificationCategory[] = [
  {
    id: 'courseUpdates',
    title: 'Course Updates',
    description: 'Notifications about new lessons, content updates, and course announcements',
    icon: <SchoolOutlined />,
    channels: { inApp: true, email: true },
  },
  {
    id: 'enrollments',
    title: 'Enrollment & Progress',
    description: 'Course enrollment confirmations, progress milestones, and completions',
    icon: <BusinessCenterOutlined />,
    channels: { inApp: true, email: true },
  },
  {
    id: 'announcements',
    title: 'Announcements',
    description: 'Platform announcements, feature updates, and system notifications',
    icon: <CampaignOutlined />,
    channels: { inApp: true, email: false },
  },
  {
    id: 'schedule',
    title: 'Schedule & Reminders',
    description: 'Upcoming live sessions, assignment deadlines, and learning reminders',
    icon: <CalendarMonthOutlined />,
    channels: { inApp: true, email: true },
  },
  {
    id: 'payments',
    title: 'Payments & Billing',
    description: 'Payment confirmations, invoice receipts, and billing updates',
    icon: <PaymentOutlined />,
    channels: { inApp: true, email: true },
  },
  {
    id: 'marketing',
    title: 'Marketing & Promotions',
    description: 'Special offers, new course recommendations, and promotional content',
    icon: <NotificationsOutlined />,
    channels: { inApp: false, email: true },
  },
];

function NotificationCategoryRow({
  category,
  onToggle,
}: {
  category: NotificationCategory;
  onToggle: (categoryId: string, channel: 'inApp' | 'email', value: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 0 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          px: 2,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'grey.50' },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Stack direction="row" spacing={2} sx={{ flex: 1, alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'grid',
              placeItems: 'center',
              color: '#FFF',
            }}
          >
            {category.icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {category.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {category.description}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
              In-App
            </Typography>
            <Switch
              checked={category.channels.inApp}
              onChange={(e) => {
                e.stopPropagation();
                onToggle(category.id, 'inApp', e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              size="small"
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
              Email
            </Typography>
            <Switch
              checked={category.channels.email}
              onChange={(e) => {
                e.stopPropagation();
                onToggle(category.id, 'email', e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              size="small"
            />
          </Stack>
          {expanded ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
        </Stack>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ pb: 2, px: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            Detailed settings for {category.title.toLowerCase()} notifications will appear here.
            You can customize the frequency and specific triggers for each notification type.
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}

export default function NotificationPreferencesPage() {
  const [categories, setCategories] = useState<NotificationCategory[]>(initialCategories);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleToggle = (categoryId: string, channel: 'inApp' | 'email', value: boolean) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, channels: { ...cat.channels, [channel]: value } }
          : cat
      )
    );
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  const handleReset = () => {
    setCategories(initialCategories);
  };

  const totalEnabled = categories.reduce(
    (sum, cat) => sum + (cat.channels.inApp ? 1 : 0) + (cat.channels.email ? 1 : 0),
    0
  );

  return (
    <DashboardPageFrame
      title="Notification Preferences"
      description="Manage how and when you receive notifications"
      breadcrumbs={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Settings', to: '/profile-settings' },
        { label: 'Notifications' },
      ]}
    >
      <Stack spacing={3}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'info.main',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#FFF',
                }}
              >
                <MarkEmailReadOutlined />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Email & Notification Channels
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Choose how you want to be notified for each category
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Notification Categories
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {totalEnabled} notification{totalEnabled !== 1 ? 's' : ''} enabled
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack direction="row" spacing={2} sx={{ justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                  <Button variant="outlined" onClick={handleReset}>
                    Reset to Default
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                  >
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Box>
            {categories.map((category) => (
              <NotificationCategoryRow
                key={category.id}
                category={category}
                onToggle={handleToggle}
              />
            ))}
          </Box>
        </Card>

        <Collapse in={saveStatus === 'saved'}>
          <Alert severity="success" icon={<CheckCircleOutlined />}>
            Your notification preferences have been saved successfully.
          </Alert>
        </Collapse>

        <Card sx={{ borderRadius: 2, bgcolor: 'grey.50' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              Important Notes
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                • Some critical notifications (like security alerts) cannot be disabled
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                • Email notifications may include a daily or weekly digest option
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                • Push notifications require browser permissions to be enabled
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </DashboardPageFrame>
  );
}
