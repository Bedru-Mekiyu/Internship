import { useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
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
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { CameraAltOutlined, EditOutlined } from '@mui/icons-material';
import { api, normalizeApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useGetStudentDashboardQuery } from '../../store/api/dashboardApi';
import { sanitizeHttpUrl } from '../../utils/safeUrl';
import type { AuthUser } from '../../types';

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

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
} | null;

type FieldProps = {
  label: string;
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  rows?: number;
  helperText?: string;
  error?: string;
  autoComplete?: string;
};

const pageSx = {
  maxWidth: 1112,
  mx: 'auto',
  py: { xs: 1, md: 1.5 },
  color: '#111827',
};

const surfaceSx = {
  borderRadius: 2,
  border: '1px solid #E7ECF6',
  boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
  backgroundColor: '#FFFFFF',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.25,
    minHeight: 40,
    backgroundColor: '#F7F9FE',
    '& fieldset': {
      borderColor: '#E4EAF6',
    },
    '&:hover fieldset': {
      borderColor: '#C9D3E8',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#5B4CF6',
    },
  },
  '& .MuiInputBase-input': {
    py: 1,
    fontSize: 13.5,
  },
};

const notificationRows: Array<{
  key: keyof NotificationPrefs;
  title: string;
  description: string;
}> = [
  {
    key: 'emailNotifications',
    title: 'Email Notifications',
    description: 'Receive emails about your course progress and announcements.',
  },
  {
    key: 'lessonReminders',
    title: 'Lesson Reminders',
    description: "Get reminded to continue learning if you've been inactive.",
  },
  {
    key: 'marketingEmails',
    title: 'Marketing Emails',
    description: 'Receive offers and updates about new courses.',
  },
];

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  readOnly = false,
  multiline = false,
  rows,
  helperText,
  error,
  autoComplete,
}: FieldProps) {
  const labelId = `profile-field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <Box>
      <Typography id={`${labelId}-label`} sx={{ mb: 0.65, color: '#334155', fontWeight: 600, fontSize: 12.5 }}>
        {label}
      </Typography>
      <TextField
        id={labelId}
        fullWidth
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        multiline={multiline}
        rows={rows}
        helperText={error || helperText}
        error={Boolean(error)}
        autoComplete={autoComplete}
        slotProps={{ input: { readOnly } }}
        inputProps={{ 'aria-labelledby': `${labelId}-label` }}
        sx={inputSx}
      />
    </Box>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card sx={surfaceSx}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 1.85, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.94rem', color: '#111827' }}>{title}</Typography>
          {action}
        </Box>
        <Divider />
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

function formatMemberSince(value?: string) {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  return `${month === 'Sep' ? 'Sept' : month} ${date.getFullYear()}`;
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

function getDisplayName(user?: AuthUser | null) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return name || 'LearnSpace User';
}

function getInitials(user?: AuthUser | null) {
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase();
  return initials || 'LS';
}

function validateProfile(values: ProfileForm) {
  const errors: Partial<Record<keyof ProfileForm, string>> = {};

  if (values.firstName.trim().length < 2) {
    errors.firstName = 'Use at least 2 characters.';
  }

  if (values.lastName.trim().length < 2) {
    errors.lastName = 'Use at least 2 characters.';
  }

  if (values.phone.trim().length > 32) {
    errors.phone = 'Phone number is too long.';
  }

  if (values.bio.trim().length > 1000) {
    errors.bio = 'Bio must be 1000 characters or less.';
  }

  return errors;
}

function validatePassword(values: PasswordForm) {
  const errors: Partial<Record<keyof PasswordForm, string>> = {};
  const passwordPattern = /^(?=.{8,128}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/;

  if (values.currentPassword.trim().length < 8) {
    errors.currentPassword = 'Current password must be at least 8 characters.';
  }

  if (!passwordPattern.test(values.newPassword)) {
    errors.newPassword = 'Use 8+ characters with uppercase, lowercase, number, and special character.';
  }

  if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = 'Password confirmation does not match.';
  }

  return errors;
}

export default function ProfileSettings() {
  const { user, refreshSession } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileForm>(() => ({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  }));
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(() => ({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }));
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(() => ({
    emailNotifications: user?.preferences?.notifications?.email ?? true,
    lessonReminders: user?.preferences?.notifications?.push ?? true,
    marketingEmails: user?.preferences?.notifications?.marketingEmails ?? true,
  }));
  const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof PasswordForm, string>>>({});
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const { data: studentDashboard, isLoading: isLoadingStudentStats } = useGetStudentDashboardQuery(undefined, {
    skip: user?.role !== 'student',
  });

  const displayName = useMemo(() => getDisplayName(user), [user]);
  const initials = useMemo(() => getInitials(user), [user]);
  const avatarSrc = sanitizeHttpUrl(user?.avatar);
  const memberSince = useMemo(() => formatMemberSince(user?.createdAt), [user?.createdAt]);
  const location = useMemo(() => {
    const address = user?.address;
    const parts = [address?.city, address?.state || address?.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not set';
  }, [user?.address]);

  const stats = useMemo(() => {
    const isStudent = user?.role === 'student';
    const enrolled = isStudent ? String(studentDashboard?.totalCourses ?? 0) : '0';
    const certificates = isStudent ? String(studentDashboard?.certificatesEarned ?? 0) : '0';

    return [
      { label: 'Enrolled Courses', value: isLoadingStudentStats ? '...' : enrolled },
      { label: 'Certificates', value: isLoadingStudentStats ? '...' : certificates },
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
      setProfileErrors({});
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
      setPasswordErrors({});
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

  const updateProfileField = (field: keyof ProfileForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setProfileForm((current) => ({ ...current, [field]: value }));
    setProfileErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (feedback?.type === 'error') {
      setFeedback(null);
    }
  };

  const updatePasswordField = (field: keyof PasswordForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setPasswordForm((current) => ({ ...current, [field]: value }));
    setPasswordErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (feedback?.type === 'error') {
      setFeedback(null);
    }
  };

  const resetProfileForm = () => {
    setProfileForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    });
    setProfileErrors({});
    setFeedback(null);
  };

  const saveProfile = () => {
    const errors = validateProfile(profileForm);
    setProfileErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFeedback({ type: 'error', message: 'Please fix the highlighted fields.' });
      return;
    }

    profileMutation.mutate({
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
      phone: profileForm.phone.trim(),
      bio: profileForm.bio.trim(),
    });
  };

  const savePassword = () => {
    const errors = validatePassword(passwordForm);
    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFeedback({ type: 'error', message: 'Please fix the highlighted password fields.' });
      return;
    }

    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
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

  const toggleNotification = (key: keyof NotificationPrefs) => (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const previous = notificationPrefs;
    const next = { ...notificationPrefs, [key]: checked };
    setNotificationPrefs(next);
    notificationsMutation.mutate(next, {
      onError: () => {
        setNotificationPrefs(previous);
      },
    });
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={pageSx}>
      <Box sx={{ mb: 2.4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: '1.35rem', md: '1.72rem' }, letterSpacing: 0 }}>
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

      <Grid container spacing={2.5} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, md: 3.7 }}>
          <Card sx={surfaceSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'grid', justifyItems: 'center', textAlign: 'center', pt: 1 }}>
                <Avatar
                  src={avatarSrc || undefined}
                  alt={displayName}
                  sx={{
                    width: 82,
                    height: 82,
                    fontSize: 28,
                    fontWeight: 800,
                    bgcolor: '#DDE7F7',
                    color: '#4F46E5',
                    border: '4px solid #EEF2FF',
                    boxShadow: '0 8px 18px rgba(79,70,229,0.12)',
                  }}
                >
                  {initials}
                </Avatar>

                <Typography sx={{ mt: 1.4, fontSize: '1.02rem', lineHeight: 1.2, fontWeight: 900 }}>
                  {displayName}
                </Typography>
                <Typography sx={{ mt: 0.35, color: '#6B7280', fontSize: '0.76rem' }}>
                  {profileSubtitle(user.role)}
                </Typography>

                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={updateAvatar} />
                <Button
                  variant="contained"
                  fullWidth
                  disabled={avatarMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={avatarMutation.isPending ? <CircularProgress size={13} color="inherit" /> : <CameraAltOutlined sx={{ fontSize: 15 }} />}
                  sx={{
                    mt: 2.25,
                    py: 0.55,
                    bgcolor: '#EEF2FF',
                    color: '#4F46E5',
                    fontSize: '0.72rem',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#E0E7FF', boxShadow: 'none' },
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
                      py: 1.15,
                      borderTop: index === 0 ? '1px solid #E6EBF3' : 0,
                      borderBottom: '1px solid #E6EBF3',
                    }}
                  >
                    <Typography sx={{ color: '#6B7280', fontSize: '0.74rem' }}>{item.label}</Typography>
                    <Typography sx={{ color: '#111827', fontSize: '0.76rem', fontWeight: 800, textAlign: 'right' }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8.3 }}>
          <Box sx={{ display: 'grid', gap: 2.3 }}>
            <SectionCard
              title="Personal Information"
              action={
                <Button
                  variant="outlined"
                  onClick={() => setFeedback(null)}
                  startIcon={<EditOutlined sx={{ fontSize: 15 }} />}
                  sx={{
                    px: 1.4,
                    py: 0.45,
                    color: '#111827',
                    borderColor: '#D7DEEA',
                    bgcolor: '#FFFFFF',
                    fontSize: '0.72rem',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#C9D3E8', bgcolor: '#F8FAFF', boxShadow: 'none' },
                  }}
                >
                  Edit Info
                </Button>
              }
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ProfileField
                    label="First Name"
                    value={profileForm.firstName}
                    onChange={updateProfileField('firstName')}
                    disabled={profileMutation.isPending}
                    error={profileErrors.firstName}
                    autoComplete="given-name"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ProfileField
                    label="Last Name"
                    value={profileForm.lastName}
                    onChange={updateProfileField('lastName')}
                    disabled={profileMutation.isPending}
                    error={profileErrors.lastName}
                    autoComplete="family-name"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ProfileField
                    label="Email Address"
                    value={profileForm.email}
                    readOnly
                    autoComplete="email"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ProfileField
                    label="Phone Number"
                    value={profileForm.phone}
                    onChange={updateProfileField('phone')}
                    disabled={profileMutation.isPending}
                    placeholder="+234 801 234 5678"
                    error={profileErrors.phone}
                    autoComplete="tel"
                  />
                </Grid>
                <Grid size={12}>
                  <ProfileField
                    label="Bio"
                    value={profileForm.bio}
                    onChange={updateProfileField('bio')}
                    disabled={profileMutation.isPending}
                    multiline
                    rows={4}
                    placeholder="Tell learners a little about yourself."
                    error={profileErrors.bio}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2.35, display: 'flex', justifyContent: 'flex-end', gap: 1.2 }}>
                <Button
                  variant="outlined"
                  onClick={resetProfileForm}
                  disabled={profileMutation.isPending}
                  sx={{
                    px: 2,
                    py: 0.75,
                    color: '#111827',
                    borderColor: '#D7DEEA',
                    fontSize: '0.76rem',
                    bgcolor: '#FFFFFF',
                    '&:hover': { borderColor: '#C9D3E8', bgcolor: '#F8FAFF' },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={saveProfile}
                  disabled={profileMutation.isPending}
                  sx={{
                    px: 2.1,
                    py: 0.78,
                    bgcolor: '#5B4CF6',
                    fontSize: '0.76rem',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#4F46E5', boxShadow: 'none' },
                  }}
                >
                  {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </SectionCard>

            <SectionCard title="Password &amp; Security">
              <Grid container spacing={2}>
                <Grid size={12}>
                  <ProfileField
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={updatePasswordField('currentPassword')}
                    disabled={passwordMutation.isPending}
                    placeholder="************"
                    error={passwordErrors.currentPassword}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ProfileField
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={updatePasswordField('newPassword')}
                    disabled={passwordMutation.isPending}
                    placeholder="Enter new password"
                    helperText="Use 8+ characters with uppercase, lowercase, number, and special character."
                    error={passwordErrors.newPassword}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ProfileField
                    label="Confirm Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={updatePasswordField('confirmPassword')}
                    disabled={passwordMutation.isPending}
                    placeholder="Confirm new password"
                    error={passwordErrors.confirmPassword}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2.35, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={savePassword}
                  disabled={passwordMutation.isPending}
                  sx={{
                    px: 2.1,
                    py: 0.78,
                    bgcolor: '#5B4CF6',
                    fontSize: '0.76rem',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#4F46E5', boxShadow: 'none' },
                  }}
                >
                  {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
                </Button>
              </Box>
            </SectionCard>

            <SectionCard title="Notifications">
              <Box>
                {notificationRows.map((item, index) => (
                  <Box
                    key={item.key}
                    sx={{
                      py: 1.45,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      borderBottom: index === notificationRows.length - 1 ? 0 : '1px solid #EDF1F7',
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
            </SectionCard>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
