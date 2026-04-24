import { useMemo, useState, type ChangeEvent } from 'react';
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
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { type SelectChangeEvent } from '@mui/material/Select';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardPageFrame, { DashboardSection } from '../../components/common/DashboardPageFrame';
import { SPACING, card } from './dashboardTokens';

type SettingsSection = 'profile' | 'account' | 'security' | 'notifications' | 'preferences';

interface SystemSettingsData {
  platformName: string;
  supportEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactHours: string;
  contactMapUrl: string;
  contactResponseTime: string;
  language: string;
  timezone: string;
  themeMode: 'light' | 'dark' | 'system';
}

interface ApiSettingsResponse {
  settings: SystemSettingsData;
  message?: string;
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
}

interface ApiUnreadCountResponse {
  unreadCount: number;
}

const defaultSettings: SystemSettingsData = {
  platformName: '',
  supportEmail: '',
  contactPhone: '',
  contactAddress: '',
  contactHours: '',
  contactMapUrl: '',
  contactResponseTime: '',
  language: 'en',
  timezone: 'UTC',
  themeMode: 'system',
};

const sectionItems: Array<{ key: SettingsSection; label: string; description: string }> = [
  { key: 'profile', label: 'Profile', description: 'Identity and role' },
  { key: 'account', label: 'Account', description: 'Platform and contact settings' },
  { key: 'security', label: 'Security', description: 'Protection and sessions' },
  { key: 'notifications', label: 'Notifications', description: 'Delivery preferences' },
  { key: 'preferences', label: 'Preferences', description: 'Language, region, and theme' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'zh', label: '中文' },
];

const timezoneOptions = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
];

const themeOptions = [
  { value: 'light' as const, label: 'Light', description: 'Clean and bright' },
  { value: 'dark' as const, label: 'Dark', description: 'Reduced eye strain' },
  { value: 'system' as const, label: 'System', description: 'Follows device setting' },
];

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const isValidUrl = (value: string) => {
  if (!value.trim()) {
    return true;
  }

  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function SystemSettings() {
  const { user, refreshSession } = useAuth();
  const queryClient = useQueryClient();
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('md'));

  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [form, setForm] = useState<SystemSettingsData>(defaultSettings);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({ email: true, push: true });
  const [hasLocalEdits, setHasLocalEdits] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const response = await api.get<ApiSettingsResponse>('/api/settings');
      return response.data.settings;
    },
    enabled: true,
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await api.get<ApiUnreadCountResponse>('/api/notifications/me/unread-count');
      return response.data;
    },
    retry: false,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<SystemSettingsData>) => {
      const response = await api.patch('/api/settings', settings);
      return response.data;
    },
    onSuccess: async () => {
      await refreshSession();
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      setHasLocalEdits(false);
    },
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (preferences: {
      language?: string;
      timezone?: string;
      themeMode?: string;
      notifications?: NotificationPreferences;
    }) => {
      const response = await api.patch('/api/users/me', { preferences });
      return response.data;
    },
    onSuccess: async () => {
      await refreshSession();
      setHasLocalEdits(false);
    },
  });

  const mergedSettings = useMemo<SystemSettingsData>(() => ({
    ...defaultSettings,
    ...(settingsData || {}),
    language: user?.preferences?.language || settingsData?.language || defaultSettings.language,
    timezone: user?.preferences?.timezone || settingsData?.timezone || defaultSettings.timezone,
    supportEmail: user?.email || settingsData?.supportEmail || defaultSettings.supportEmail,
  }), [settingsData, user]);

  const activeForm = hasLocalEdits ? form : mergedSettings;
  const isSaving = saveSettingsMutation.isPending || savePreferencesMutation.isPending;

  const supportEmailError = activeForm.supportEmail.trim().length > 0 && !isValidEmail(activeForm.supportEmail);
  const mapUrlError = !isValidUrl(activeForm.contactMapUrl);
  const hasValidationErrors = supportEmailError || mapUrlError;
  const unreadCount = unreadData?.unreadCount ?? 0;
  const effectiveNotificationPrefs = hasLocalEdits
    ? notificationPrefs
    : {
      email: user?.preferences?.notifications?.email ?? true,
      push: user?.preferences?.notifications?.push ?? true,
    };

  const applyFormPatch = (patch: Partial<SystemSettingsData>) => {
    setForm((prev) => ({ ...(hasLocalEdits ? prev : activeForm), ...patch }));
    setHasLocalEdits(true);
  };

  const handleFormChange =
    (field: keyof SystemSettingsData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      applyFormPatch({ [field]: event.target.value } as Partial<SystemSettingsData>);
    };

  const handleSelectChange =
    (field: keyof SystemSettingsData) =>
    (event: SelectChangeEvent) => {
      applyFormPatch({ [field]: event.target.value } as Partial<SystemSettingsData>);
    };

  const handleSave = async () => {
    if (hasValidationErrors) {
      setFeedback({ type: 'error', message: 'Fix validation errors before saving changes.' });
      return;
    }

    try {
      await saveSettingsMutation.mutateAsync({
        platformName: activeForm.platformName,
        supportEmail: activeForm.supportEmail,
        contactPhone: activeForm.contactPhone,
        contactAddress: activeForm.contactAddress,
        contactHours: activeForm.contactHours,
        contactMapUrl: activeForm.contactMapUrl,
        contactResponseTime: activeForm.contactResponseTime,
      });

      await savePreferencesMutation.mutateAsync({
        language: activeForm.language,
        timezone: activeForm.timezone,
        themeMode: activeForm.themeMode,
        notifications: effectiveNotificationPrefs,
      });

      setFeedback({ type: 'success', message: 'Settings saved successfully.' });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to save settings. Please try again.' });
    }
  };

  const handleDiscardChanges = () => {
    setForm(mergedSettings);
    setNotificationPrefs({
      email: user?.preferences?.notifications?.email ?? true,
      push: user?.preferences?.notifications?.push ?? true,
    });
    setHasLocalEdits(false);
    setFeedback(null);
  };

  const saveDisabled = !hasLocalEdits || isSaving || isLoading || hasValidationErrors;

  const sectionNav = isDesktop ? (
    <Card sx={{ ...card, position: 'sticky', top: 88 }}>
      <List sx={{ p: 1 }}>
        {sectionItems.map((item) => (
          <ListItemButton
            key={item.key}
            selected={activeSection === item.key}
            onClick={() => setActiveSection(item.key)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              alignItems: 'flex-start',
              py: 1.25,
              '&.Mui-selected': {
                bgcolor: 'background.default',
                '&:hover': { bgcolor: 'background.default' },
              },
            }}
          >
            <ListItemText
              primary={(
                <Typography sx={{ fontWeight: 700, color: activeSection === item.key ? 'primary.main' : 'text.primary' }}>
                  {item.label}
                </Typography>
              )}
              secondary={(
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.description}
                </Typography>
              )}
            />
          </ListItemButton>
        ))}
      </List>
    </Card>
  ) : (
    <Tabs
      value={activeSection}
      onChange={(_, value) => setActiveSection(value)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        minHeight: 44,
        '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 700 },
      }}
      >
        {sectionItems.map((item) => (
          <Tab key={item.key} value={item.key} label={item.label} />
        ))}
      </Tabs>
  );

  return (
    <DashboardPageFrame
      title="System Settings"
      description="Manage profile, account, security, notification, and preference settings with a consistent structure."
      actions={(
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            onClick={() => (hasLocalEdits ? setConfirmDiscardOpen(true) : handleDiscardChanges())}
            disabled={!hasLocalEdits || isSaving}
            fullWidth={!isDesktop}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saveDisabled}
            fullWidth={!isDesktop}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      )}
    >
      {feedback ? (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ borderRadius: 2 }}>
          {feedback.message}
        </Alert>
      ) : null}

      <Grid container spacing={SPACING.lg} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, md: 3 }}>{sectionNav}</Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Stack spacing={SPACING.lg}>
            {activeSection === 'profile' ? (
              <DashboardSection title="Profile" description="Read-only identity details for the signed-in account.">
                <Grid container spacing={SPACING.md}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Email Address" value={user?.email || ''} disabled helperText="Managed by your authentication account." />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Role" value={user?.role || ''} disabled helperText="Role permissions are controlled by administrators." />
                  </Grid>
                </Grid>
              </DashboardSection>
            ) : null}

            {activeSection === 'account' ? (
              <>
                <DashboardSection
                  title="Account"
                  description="Platform and public contact information."
                  action={(
                    <Button variant="contained" size="small" onClick={handleSave} disabled={saveDisabled}>
                      {isSaving ? 'Saving...' : 'Save section'}
                    </Button>
                  )}
                >
                  <Grid container spacing={SPACING.md}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Platform Name"
                        value={activeForm.platformName}
                        onChange={handleFormChange('platformName')}
                        disabled={isLoading || isSaving}
                        helperText="Displayed across headers and public pages."
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Support Email"
                        value={activeForm.supportEmail}
                        onChange={handleFormChange('supportEmail')}
                        disabled={isLoading || isSaving}
                        error={supportEmailError}
                        helperText={supportEmailError ? 'Use a valid email address.' : 'Used in contact and system communications.'}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label="Contact Phone" value={activeForm.contactPhone} onChange={handleFormChange('contactPhone')} disabled={isLoading || isSaving} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label="Business Hours" value={activeForm.contactHours} onChange={handleFormChange('contactHours')} disabled={isLoading || isSaving} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField label="Contact Address" value={activeForm.contactAddress} onChange={handleFormChange('contactAddress')} disabled={isLoading || isSaving} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField label="Expected Response Time" value={activeForm.contactResponseTime} onChange={handleFormChange('contactResponseTime')} disabled={isLoading || isSaving} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Map Embed URL"
                        value={activeForm.contactMapUrl}
                        onChange={handleFormChange('contactMapUrl')}
                        disabled={isLoading || isSaving}
                        error={mapUrlError}
                        helperText={mapUrlError ? 'Use a full URL starting with http:// or https://.' : 'Optional. Supports Google Maps embed links.'}
                      />
                    </Grid>
                  </Grid>
                </DashboardSection>

                <DashboardSection title="Danger Zone" description="Destructive account actions are protected by confirmation and backend policies.">
                  <Stack spacing={SPACING.md}>
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      Account deletion is currently disabled in this console and requires administrator workflow.
                    </Alert>
                    <Tooltip title="Deletion requires backend approval flow">
                      <span>
                        <Button variant="outlined" color="error" disabled>
                          Delete Account
                        </Button>
                      </span>
                    </Tooltip>
                  </Stack>
                </DashboardSection>
              </>
            ) : null}

            {activeSection === 'security' ? (
              <DashboardSection title="Security" description="Security controls are shown for consistency and future expansion.">
                <FormGroup>
                  <FormControlLabel
                    control={<Switch checked disabled />}
                    label="Require strong passwords"
                  />
                  <FormControlLabel
                    control={<Switch checked disabled />}
                    label="Enable two-factor authentication (coming soon)"
                  />
                  <FormControlLabel
                    control={<Switch disabled />}
                    label="Automatic sign-out on inactive sessions (coming soon)"
                  />
                </FormGroup>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                  Security policy management is currently read-only in this UI.
                </Typography>
              </DashboardSection>
            ) : null}

            {activeSection === 'notifications' ? (
              <DashboardSection
                title="Notifications"
                description="Control your delivery preferences and see current unread volume."
                action={(
                  <Button variant="contained" size="small" onClick={handleSave} disabled={saveDisabled}>
                    {isSaving ? 'Saving...' : 'Save section'}
                  </Button>
                )}
              >
                <Grid container spacing={SPACING.md}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                      <CardContent>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Unread notifications
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {unreadCount}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <FormGroup>
                      <FormControlLabel
                        control={(
                          <Switch
                            checked={effectiveNotificationPrefs.email}
                            onChange={(_, checked) => {
                              setNotificationPrefs((current) => ({
                                ...(hasLocalEdits ? current : effectiveNotificationPrefs),
                                email: checked,
                              }));
                              setHasLocalEdits(true);
                            }}
                            disabled={isSaving}
                          />
                        )}
                        label="Email notifications"
                      />
                      <FormControlLabel
                        control={(
                          <Switch
                            checked={effectiveNotificationPrefs.push}
                            onChange={(_, checked) => {
                              setNotificationPrefs((current) => ({
                                ...(hasLocalEdits ? current : effectiveNotificationPrefs),
                                push: checked,
                              }));
                              setHasLocalEdits(true);
                            }}
                            disabled={isSaving}
                          />
                        )}
                        label="Push notifications"
                      />
                    </FormGroup>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                      Preferences are loaded from your account and saved to your user profile settings.
                    </Typography>
                  </Grid>
                </Grid>
              </DashboardSection>
            ) : null}

            {activeSection === 'preferences' ? (
              <DashboardSection
                title="Preferences"
                description="Personalize language, regional defaults, and theme."
                action={(
                  <Button variant="contained" size="small" onClick={handleSave} disabled={saveDisabled}>
                    {isSaving ? 'Saving...' : 'Save section'}
                  </Button>
                )}
              >
                <Grid container spacing={SPACING.md}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth disabled={isLoading || isSaving}>
                      <InputLabel id="language-label">Language</InputLabel>
                      <Select labelId="language-label" label="Language" value={activeForm.language} onChange={handleSelectChange('language')}>
                        {languageOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth disabled={isLoading || isSaving}>
                      <InputLabel id="timezone-label">Timezone</InputLabel>
                      <Select labelId="timezone-label" label="Timezone" value={activeForm.timezone} onChange={handleSelectChange('timezone')}>
                        {timezoneOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.25 }}>
                      Theme Mode
                    </Typography>
                    <Grid container spacing={SPACING.md}>
                      {themeOptions.map((option) => (
                        <Grid key={option.value} size={{ xs: 12, sm: 4 }}>
                          <Card
                            onClick={() => applyFormPatch({ themeMode: option.value })}
                            sx={{
                              p: 2,
                              cursor: isLoading || isSaving ? 'not-allowed' : 'pointer',
                              border: '2px solid',
                              borderColor: activeForm.themeMode === option.value ? 'primary.main' : 'divider',
                              bgcolor: activeForm.themeMode === option.value ? 'background.default' : 'background.paper',
                              opacity: isLoading || isSaving ? 0.7 : 1,
                              transition: 'border-color 160ms ease, background-color 160ms ease',
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {option.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {option.description}
                            </Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </DashboardSection>
            ) : null}
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={confirmDiscardOpen} onClose={() => setConfirmDiscardOpen(false)}>
        <DialogTitle>Discard unsaved changes?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Your pending updates will be removed and replaced with the latest saved values.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDiscardOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              handleDiscardChanges();
              setConfirmDiscardOpen(false);
            }}
          >
            Discard changes
          </Button>
        </DialogActions>
      </Dialog>

      {!isDesktop && hasLocalEdits ? (
        <Box
          sx={{
            position: 'fixed',
            left: 16,
            right: 16,
            bottom: 16,
            zIndex: 1200,
          }}
        >
          <Card sx={{ ...card, p: 1.25 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Unsaved changes
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="text" onClick={() => setConfirmDiscardOpen(true)} disabled={isSaving}>
                  Discard
                </Button>
                <Button size="small" variant="contained" onClick={handleSave} disabled={saveDisabled}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Box>
      ) : null}
    </DashboardPageFrame>
  );
}
