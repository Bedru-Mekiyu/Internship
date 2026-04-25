import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { api, normalizeApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { sanitizeHttpUrl } from '../../utils/safeUrl';
import DashboardPageFrame from '../../components/common/DashboardPageFrame';
import {
  useGetAdminDashboardQuery,
  useGetInstructorDashboardQuery,
  useGetStudentDashboardQuery,
} from '../../store/api/dashboardApi';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type NotificationState = {
  email: boolean;
  push: boolean;
};

const notificationOptions = [
  {
    key: 'email',
    title: 'Email Notifications',
    description: 'Receive updates about course activity, announcements, and account changes.',
    defaultChecked: true,
  },
  {
    key: 'push',
    title: 'Push Notifications',
    description: 'Get reminders before your scheduled lessons and upcoming deadlines.',
    defaultChecked: true,
  },
] as const;

const initialForm: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bio: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.default',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800, color: 'text.primary' }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function ProfileSettings() {
  const { user, refreshSession } = useAuth();
  const isStudent = user?.role === 'student';
  const isInstructor = user?.role === 'instructor';
  const isAdmin = user?.role === 'admin';

  const { data: studentDashboard } = useGetStudentDashboardQuery(undefined, { skip: !isStudent });
  const { data: instructorDashboard } = useGetInstructorDashboardQuery(undefined, { skip: !isInstructor });
  const { data: adminDashboard } = useGetAdminDashboardQuery(undefined, { skip: !isAdmin });
  const [form, setForm] = useState<FormState>(initialForm);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [notifications, setNotifications] = useState<NotificationState>({
    email: notificationOptions[0].defaultChecked,
    push: notificationOptions[1].defaultChecked,
  });

  const displayName = useMemo(() => {
    const firstName = user?.firstName?.trim() || form.firstName.trim();
    const lastName = user?.lastName?.trim() || form.lastName.trim();
    return [firstName, lastName].filter(Boolean).join(' ') || 'LearnSpace User';
  }, [form.firstName, form.lastName, user?.firstName, user?.lastName]);

  const initials = useMemo(() => {
    return displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((value) => value[0]?.toUpperCase() || '')
      .join('') || 'LS';
  }, [displayName]);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) {
      return 'N/A';
    }

    const createdAt = new Date(user.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      return 'N/A';
    }

    return createdAt.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  }, [user?.createdAt]);

  const profileStats = useMemo(
    () => [
      {
        label: isStudent ? 'Enrolled Courses' : 'Managed Courses',
        value: String(
          isStudent
            ? studentDashboard?.totalCourses ?? 0
            : instructorDashboard?.totalCourses ?? adminDashboard?.totalCourses ?? 0,
        ),
      },
      {
        label: isStudent ? 'Certificates' : 'Total Learners',
        value: String(
          isStudent
            ? studentDashboard?.certificatesEarned ?? 0
            : instructorDashboard?.totalStudents ?? adminDashboard?.totalUsers ?? 0,
        ),
      },
      { label: 'Member Since', value: memberSince },
      { label: 'Phone', value: form.phone || 'N/A' },
    ],
    [
      adminDashboard?.totalCourses,
      adminDashboard?.totalUsers,
      form.phone,
      instructorDashboard?.totalCourses,
      instructorDashboard?.totalStudents,
      isStudent,
      memberSince,
      studentDashboard?.certificatesEarned,
      studentDashboard?.totalCourses,
    ],
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((current) => ({
      ...current,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
    }));

    setNotifications((current) => ({
      email: user.preferences?.notifications?.email ?? current.email,
      push: user.preferences?.notifications?.push ?? current.push,
    }));
  }, [user]);

  const updateField =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSaveProfile = async () => {
    setStatusMessage(null);
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setStatusMessage('First name, last name, and email are required.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await api.patch('/api/users/me', {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        bio: form.bio,
        preferences: {
          notifications: {
            email: notifications.email,
            push: notifications.push,
          },
        },
      });
      await refreshSession();
      setStatusMessage('Profile updated successfully.');
    } catch (error) {
      setStatusMessage(normalizeApiError(error).message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    setStatusMessage(null);

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setStatusMessage('Please fill all password fields.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setStatusMessage('New password and confirm password must match.');
      return;
    }

    if (form.newPassword.length < 8) {
      setStatusMessage('New password must be at least 8 characters.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.patch('/api/users/me/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm((current) => ({
        ...current,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setStatusMessage('Password updated successfully.');
    } catch (error) {
      setStatusMessage(normalizeApiError(error).message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCancelProfile = () => {
    if (!user) return;
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setStatusMessage(null);
  };

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default' }}>
      <DashboardPageFrame
        title="Profile & Settings"
        description="Manage account information, password security, and notification preferences."
      >
          {statusMessage ? (
            <Typography sx={{ mb: 2, fontWeight: 700, color: statusMessage.includes('successfully') ? 'success.main' : 'error.main' }}>
              {statusMessage}
            </Typography>
          ) : null}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textAlign: 'center' }}>
                    <Avatar
                      src={sanitizeHttpUrl(user?.avatar) ?? undefined}
                      alt={displayName}
                      sx={{ width: 116, height: 116, fontSize: 36, fontWeight: 800 }}
                    >
                      {initials}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {displayName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {user?.role ? user.role.replace('_', ' ') : 'LearnSpace member'}
                      </Typography>
                    </Box>
                    <Grid container spacing={1.5}>
                      {profileStats.map((stat) => (
                        <Grid key={stat.label} size={{ xs: 12, sm: 6 }}>
                          <StatChip label={stat.label} value={stat.value} />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={3}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Stack spacing={3}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Personal information
                      </Typography>
                      <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField label="First Name" value={form.firstName} onChange={updateField('firstName')} fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField label="Last Name" value={form.lastName} onChange={updateField('lastName')} fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField label="Email Address" value={form.email} fullWidth disabled />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField label="Phone Number" value={form.phone} onChange={updateField('phone')} fullWidth />
                        </Grid>
                        <Grid size={12}>
                          <TextField label="Bio" value={form.bio} onChange={updateField('bio')} multiline minRows={4} fullWidth />
                        </Grid>
                      </Grid>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, flexWrap: 'wrap' }}>
                          <Button variant="outlined" sx={{ borderColor: 'divider', color: 'text.primary', px: 3 }} onClick={handleCancelProfile}>
                            Cancel
                          </Button>
                        <Button variant="contained" sx={{ px: 3 }} onClick={() => void handleSaveProfile()} disabled={isSavingProfile}>
                          {isSavingProfile ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Stack spacing={3}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Password & security
                      </Typography>
                      <Grid container spacing={2.5}>
                        <Grid size={12}>
                          <TextField label="Current Password" type="password" fullWidth value={form.currentPassword} onChange={updateField('currentPassword')} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField label="New Password" type="password" fullWidth value={form.newPassword} onChange={updateField('newPassword')} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField label="Confirm Password" type="password" fullWidth value={form.confirmPassword} onChange={updateField('confirmPassword')} />
                        </Grid>
                      </Grid>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Button variant="contained" sx={{ px: 3 }} onClick={() => void handleUpdatePassword()} disabled={isUpdatingPassword}>
                          {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Stack spacing={3}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Notifications
                      </Typography>
                      <Stack spacing={2.5}>
                        {notificationOptions.map((option) => (
                          <Box
                            key={option.title}
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: 2,
                              p: 2,
                              borderRadius: 2,
                              bgcolor: 'background.default',
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Box sx={{ pr: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                {option.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, lineHeight: 1.7 }}>
                                {option.description}
                              </Typography>
                            </Box>
                            <Switch
                              checked={notifications[option.key]}
                              onChange={(_, checked) =>
                                setNotifications((current) => ({
                                  ...current,
                                  [option.key]: checked,
                                }))
                              }
                            />
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
      </DashboardPageFrame>
    </Box>
  );
}
