import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { CameraAltOutlined } from '@mui/icons-material';
import { api, normalizeApiError } from '../../services/api';
import { useAuth, type AuthUser } from '../../context/AuthContext';
import { useGetStudentDashboardQuery } from '../../store/api/dashboardApi';
import { sanitizeHttpUrl } from '../../utils/safeUrl';
import { card, innerCard, SPACING, sectionHeader } from './dashboardTokens';

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type NotificationPrefs = {
  emailNotifications: boolean;
  lessonReminders: boolean;
  marketingEmails: boolean;
};

type LabeledFieldProps = {
  label: string;
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  error?: boolean;
  helperText?: string;
  id?: string;
};

function LabeledField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  multiline = false,
  rows,
  error,
  helperText,
  id,
}: LabeledFieldProps) {
  const labelId = id || `labeled-field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <Box>
      <Typography id={`${labelId}-label`} sx={{ mb: 0.65, color: 'text.primary', fontWeight: 600 }}>
        {label}
      </Typography>
      <TextField
        id={labelId}
        hiddenLabel
        fullWidth
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        multiline={multiline}
        rows={rows}
        error={error}
        helperText={helperText}
        inputProps={{ 'aria-labelledby': `${labelId}-label` }}
      />
    </Box>
  );
}

function formatMemberSince(value?: string) {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
}

function profileSubtitle(role?: AuthUser['role']) {
  switch (role) {
    case 'admin':
      return 'Platform Administrator';
    case 'instructor':
      return 'Course Instructor';
    case 'content_manager':
      return 'Content Manager';
    case 'student':
      return 'Student';
    default:
      return 'LearnSpace Member';
  }
}

export default function ProfileSettings() {
  const { user, refreshSession } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    emailNotifications: true,
    lessonReminders: true,
    marketingEmails: true,
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: studentDashboard, isLoading: isLoadingStudentStats } = useGetStudentDashboardQuery(undefined, {
    skip: user?.role !== 'student',
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
    });

    setNotificationPrefs({
      emailNotifications: user.preferences?.notifications?.email ?? true,
      lessonReminders: user.preferences?.notifications?.push ?? true,
      marketingEmails: user.preferences?.notifications?.marketingEmails ?? true,
    });
  }, [user]);

  const displayName = useMemo(() => {
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return name || 'LearnSpace User';
  }, [user?.firstName, user?.lastName]);

  const initials = useMemo(() => {
    return displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'LS';
  }, [displayName]);

  const avatarSrc = sanitizeHttpUrl(user?.avatar);
  const memberSince = formatMemberSince(user?.createdAt);
  const location = useMemo(() => {
    const address = user?.address;
    const parts = [address?.city, address?.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not set';
  }, [user?.address]);

  const stats = useMemo(() => {
    const isStudent = user?.role === 'student';
    return [
      {
        label: 'Enrolled Courses',
        value: isStudent
          ? isLoadingStudentStats
            ? '...'
            : String(studentDashboard?.totalCourses ?? 0)
          : '-',
      },
      {
        label: 'Certificates',
        value: isStudent
          ? isLoadingStudentStats
            ? '...'
            : String(studentDashboard?.certificatesEarned ?? 0)
          : '-',
      },
      { label: 'Member Since', value: memberSince },
      { label: 'Location', value: location },
    ];
  }, [isLoadingStudentStats, location, memberSince, studentDashboard?.certificatesEarned, studentDashboard?.totalCourses, user?.role]);

  const profileMutation = useMutation({
    mutationFn: async (payload: Omit<ProfileForm, 'email'>) => {
      const response = await api.patch<AuthUser>('/api/users/me', payload);
      return response.data;
    },
    onSuccess: async () => {
      setFeedback({ type: 'success', message: 'Profile details saved.' });
      await refreshSession();
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (requestError) => {
      setFeedback({ type: 'error', message: normalizeApiError(requestError).message });
    },
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append('file', file);
      const response = await api.post<{ user: AuthUser; avatar: string }>('/api/users/me/avatar', body);
      return response.data;
    },
    onSuccess: async () => {
      setFeedback({ type: 'success', message: 'Avatar updated.' });
      await refreshSession();
    },
    onError: (requestError) => {
      setFeedback({ type: 'error', message: normalizeApiError(requestError).message });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const response = await api.patch<{ message: string }>('/api/users/me/password', payload);
      return response.data;
    },
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setFeedback({ type: 'success', message: 'Password updated successfully.' });
    },
    onError: (requestError) => {
      setFeedback({ type: 'error', message: normalizeApiError(requestError).message });
    },
  });

  const notificationsMutation = useMutation({
    mutationFn: async (prefs: NotificationPrefs) => {
      const response = await api.patch<AuthUser>('/api/users/me', {
        preferences: {
          notifications: {
            email: prefs.emailNotifications,
            push: prefs.lessonReminders,
            marketingEmails: prefs.marketingEmails,
          },
        },
      });
      return response.data;
    },
    onSuccess: async () => {
      await refreshSession();
    },
    onError: (requestError) => {
      setFeedback({ type: 'error', message: normalizeApiError(requestError).message });
      void refreshSession();
    },
  });

  const firstNameError = profileForm.firstName.trim().length > 0 && profileForm.firstName.trim().length < 2;
  const lastNameError = profileForm.lastName.trim().length > 0 && profileForm.lastName.trim().length < 2;
  const isSavingProfile = profileMutation.isPending;
  const isUploadingAvatar = avatarMutation.isPending;

  const updateProfileField = (field: keyof ProfileForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const updatePasswordField = (field: keyof PasswordForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPasswordForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const resetProfileForm = () => {
    setProfileForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    });
    setFeedback(null);
  };

  const saveProfile = () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setFeedback({ type: 'error', message: 'First name and last name are required.' });
      return;
    }

    if (firstNameError || lastNameError) {
      setFeedback({ type: 'error', message: 'Names must be at least 2 characters.' });
      return;
    }

    profileMutation.mutate({
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      phone: profileForm.phone,
      bio: profileForm.bio,
    });
  };

  const updateAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    avatarMutation.mutate(file);
  };

  const handleEditInfo = () => {
    setIsEditInfoOpen(true);
  };

  const savePassword = () => {
    if (passwordForm.currentPassword.length < 8) {
      setFeedback({ type: 'error', message: 'Current password must be at least 8 characters.' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'New password must be at least 8 characters.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ type: 'error', message: 'Password confirmation does not match.' });
      return;
    }

    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const toggleNotification = (key: keyof NotificationPrefs) => (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const nextPrefs = { ...notificationPrefs, [key]: checked };
    setNotificationPrefs(nextPrefs);
    notificationsMutation.mutate(nextPrefs);
  };

  return (
    <Box sx={{ maxWidth: 1110, mx: 'auto', color: '#111827' }}>
      <Box sx={{ mb: 2.6 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: '1.35rem', md: '1.7rem' }, letterSpacing: 0 }}>
          Profile &amp; Settings
        </Typography>
        <Typography sx={{ mt: 0.55, color: '#6B7280', fontSize: '0.78rem' }}>
          Manage your account settings and preferences.
        </Typography>
      </Box>

      {feedback ? (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 2, borderRadius: 1.5 }}>
          {feedback.message}
        </Alert>
      ) : null}

      <Grid container spacing={2.6} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, md: 3.6 }}>
          <Card sx={{ ...surface }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'grid', justifyItems: 'center', textAlign: 'center', pt: 1 }}>
                <Avatar
                  src={avatarSrc || undefined}
                  alt={displayName}
                  sx={{
                    width: 92,
                    height: 92,
                    fontSize: 31,
                    fontWeight: 800,
                    bgcolor: '#DDE7F7',
                    color: '#4F46E5',
                    border: '4px solid #EEF3FF',
                  }}
                >
                  {initials}
                </Avatar>
                <Typography sx={{ mt: 1.45, fontSize: '1.03rem', lineHeight: 1.2, fontWeight: 900 }}>
                  {displayName}
                </Typography>
                <Typography sx={{ mt: 0.35, color: '#6B7280', fontSize: '0.76rem' }}>
                  {profileSubtitle(user?.role)}
                </Typography>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={updateAvatar} />
                <Button
                  variant="contained"
                  fullWidth
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={isUploadingAvatar ? <CircularProgress size={13} color="inherit" /> : <CameraAltOutlined sx={{ fontSize: 15 }} />}
                  sx={{
                    mt: 2.3,
                    py: 0.52,
                    bgcolor: '#EEF2FF',
                    color: '#4F46E5',
                    fontSize: '0.72rem',
                    '&:hover': { bgcolor: '#E0E7FF' },
                  }}
                >
                  Change Avatar
                </Button>
              </Box>

              <Box sx={{ mt: 3 }}>
                {stats.map((item, index) => (
                  <Box
                    key={item.label}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      py: 1.25,
                      borderTop: index === 0 ? '1px solid #E6EBF3' : 0,
                      borderBottom: '1px solid #E6EBF3',
                    }}
                  >
                    <Typography sx={{ color: '#6B7280', fontSize: '0.74rem' }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ color: '#111827', fontSize: '0.76rem', fontWeight: 800, textAlign: 'right' }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8.4 }}>
          <Box sx={{ display: 'grid', gap: 2.4 }}>
            <Card sx={{ ...surface }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ px: 2.4, py: 1.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.96rem' }}>
                    Personal Information
                  </Typography>
                  <Button variant="outlined" onClick={handleEditInfo} sx={{ px: 1.55, py: 0.45, color: '#111827', borderColor: '#D7DEEA', fontSize: '0.72rem' }}>
                    Edit Info
                  </Button>
                </Box>
                <Divider />
                <Box sx={{ p: 2.4 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <LabeledField
                        label="First Name"
                        value={profileForm.firstName}
                        onChange={updateProfileField('firstName')}
                        disabled={isSavingProfile}
                        error={firstNameError}
                        helperText={firstNameError ? 'Use at least 2 characters.' : undefined}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <LabeledField
                        label="Last Name"
                        value={profileForm.lastName}
                        onChange={updateProfileField('lastName')}
                        disabled={isSavingProfile}
                        error={lastNameError}
                        helperText={lastNameError ? 'Use at least 2 characters.' : undefined}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <LabeledField label="Email Address" value={profileForm.email} disabled />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <LabeledField
                        label="Phone Number"
                        value={profileForm.phone}
                        onChange={updateProfileField('phone')}
                        disabled={isSavingProfile}
                        placeholder="+234 801 234 5678"
                      />
                    </Grid>
                    <Grid size={12}>
                      <LabeledField
                        label="Bio"
                        value={profileForm.bio}
                        onChange={updateProfileField('bio')}
                        disabled={isSavingProfile}
                        multiline
                        rows={4}
                        placeholder="Tell learners a little about yourself."
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2.35, display: 'flex', justifyContent: 'flex-end', gap: 1.2 }}>
                    <Button
                      variant="outlined"
                      onClick={resetProfileForm}
                      disabled={isSavingProfile}
                      sx={{ px: 2, py: 0.75, color: '#111827', borderColor: '#D7DEEA', fontSize: '0.76rem' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={saveProfile}
                      disabled={isSavingProfile}
                      sx={{ px: 2.1, py: 0.78, bgcolor: '#5B4CF6', fontSize: '0.76rem', '&:hover': { bgcolor: '#4F46E5' } }}
                    >
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ ...surface }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ px: 2.4, py: 1.75 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.96rem' }}>
                    Password &amp; Security
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ p: 2.4 }}>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <LabeledField
                        label="Current Password"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={updatePasswordField('currentPassword')}
                        disabled={passwordMutation.isPending}
                        placeholder="************"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <LabeledField
                        label="New Password"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={updatePasswordField('newPassword')}
                        disabled={passwordMutation.isPending}
                        placeholder="Enter new password"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <LabeledField
                        label="Confirm Password"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={updatePasswordField('confirmPassword')}
                        disabled={passwordMutation.isPending}
                        placeholder="Confirm new password"
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2.35, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={savePassword}
                      disabled={passwordMutation.isPending}
                      sx={{ px: 2.1, py: 0.78, bgcolor: '#5B4CF6', fontSize: '0.76rem', '&:hover': { bgcolor: '#4F46E5' } }}
                    >
                      {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ ...surface }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ px: 2.4, py: 1.75 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.96rem' }}>
                    Notifications
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ px: 2.4, py: 2.2 }}>
                  {[
                    {
                      key: 'emailNotifications' as const,
                      title: 'Email Notifications',
                      description: 'Receive emails about your course progress and announcements.',
                    },
                    {
                      key: 'lessonReminders' as const,
                      title: 'Lesson Reminders',
                      description: "Get reminded to continue learning if you've been inactive.",
                    },
                    {
                      key: 'marketingEmails' as const,
                      title: 'Marketing Emails',
                      description: 'Receive offers and updates about new courses.',
                    },
                  ].map((item, index, items) => (
                    <Box
                      key={item.key}
                      sx={{
                        py: 1.45,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        borderBottom: index === items.length - 1 ? 0 : '1px solid #EDF1F7',
                      }}
                    >
                      <Box>
                        <Typography sx={{ color: '#111827', fontWeight: 800, fontSize: '0.78rem' }}>
                          {item.title}
                        </Typography>
                        <Typography sx={{ mt: 0.25, color: '#6B7280', fontSize: '0.72rem' }}>
                          {item.description}
                        </Typography>
                      </Box>
                      <Switch
                        checked={notificationPrefs[item.key]}
                        disabled={notificationsMutation.isPending}
                        onChange={toggleNotification(item.key)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#5B4CF6' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#5B4CF6', opacity: 1 },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
