import { useEffect, useState, type ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { type SelectChangeEvent } from '@mui/material/Select';
import { alpha } from '@mui/material/styles';
import {
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Language as LanguageIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type SettingsTab = 'general' | 'appearance';

interface SystemSettingsData {
  platformName: string;
  supportEmail: string;
  language: string;
  timezone: string;
  themeMode: 'light' | 'dark' | 'system';
}

interface ApiSettingsResponse {
  settings: SystemSettingsData;
  message?: string;
}

const defaultSettings: SystemSettingsData = {
  platformName: 'LearnSpace',
  supportEmail: 'support@learnspace.com',
  language: 'en',
  timezone: 'UTC',
  themeMode: 'light',
};

const themeOptions = [
  { value: 'light' as const, label: 'Light', description: 'Clean and bright interface', icon: '☀️' },
  { value: 'dark' as const, label: 'Dark', description: 'Easy on the eyes', icon: '🌙' },
  { value: 'system' as const, label: 'System', description: 'Follows device settings', icon: '💻' },
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

function TabPanel({ children, value, index }: { children: React.ReactNode; value: SettingsTab; index: SettingsTab }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
}

function SectionCard({ title, description, icon, children }: { title: string; description: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack spacing={2.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: alpha('#0066FF', 0.08),
                color: 'primary.main',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                {title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                {description}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ borderColor: '#E2E8F0' }} />
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function SystemSettings() {
  const { user, refreshSession } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [form, setForm] = useState<SystemSettingsData>(defaultSettings);
  const [dirty, setDirty] = useState(false);

  // Fetch settings from backend
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const response = await api.get<ApiSettingsResponse>('/api/settings');
      return response.data.settings;
    },
    enabled: true,
  });

  // Save settings mutation - updates platform settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<SystemSettingsData>) => {
      const response = await api.patch('/api/settings', settings);
      return response.data;
    },
    onSuccess: async () => {
      await refreshSession();
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      setDirty(false);
    },
  });

  // Save user preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (preferences: { language?: string; timezone?: string; themeMode?: string }) => {
      const response = await api.patch('/api/users/me', { preferences });
      return response.data;
    },
    onSuccess: async () => {
      await refreshSession();
      setDirty(false);
    },
  });

  // Sync form with fetched data
  useEffect(() => {
    if (settingsData) {
      setForm(settingsData);
      setDirty(false);
    }
  }, [settingsData]);

  // Sync form with user data on mount
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        language: user.preferences?.language || 'en',
        timezone: user.preferences?.timezone || 'UTC',
        supportEmail: user.email || '',
      }));
    }
  }, [user]);

  // Mark dirty on form change
  useEffect(() => {
    setDirty(true);
  }, [form]);

  const handleFormChange =
    (field: keyof SystemSettingsData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSelectChange =
    (field: keyof SystemSettingsData) =>
    (e: SelectChangeEvent) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSave = async () => {
    try {
      // Save platform settings
      await saveSettingsMutation.mutateAsync({
        platformName: form.platformName,
        supportEmail: form.supportEmail,
      });
      // Save user preferences
      await savePreferencesMutation.mutateAsync({
        language: form.language,
        timezone: form.timezone,
        themeMode: form.themeMode,
      });
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  };

  const handleReset = () => {
    if (settingsData) {
      setForm(settingsData);
    } else {
      setForm(defaultSettings);
    }
    setDirty(false);
  };

  const tabs = [
    { value: 'general', label: 'General', icon: <SettingsIcon /> },
    { value: 'appearance', label: 'Appearance', icon: <PaletteIcon /> },
  ];

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, lg: 4 },
          pt: { xs: 3, lg: 4 },
          pb: 3,
          borderBottom: '1px solid #E2E8F0',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Stack spacing={0.5}>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
              System Settings
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Configure your platform preferences
            </Typography>
          </Stack>
          {dirty && (
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button variant="outlined" onClick={handleReset} startIcon={<RefreshIcon />} sx={{ borderRadius: 2.5 }}>
                Discard
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                startIcon={<SaveIcon />}
                disabled={saveSettingsMutation.isPending || isLoading}
                sx={{ borderRadius: 2.5 }}
              >
                {saveSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, pt: 2, borderBottom: '1px solid #E2E8F0', bgcolor: 'background.paper' }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 56,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              bgcolor: 'primary.main',
            },
            '& .MuiTab-root': {
              minHeight: 56,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 15,
              px: 3,
              gap: 1,
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} iconPosition="start" />
          ))}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, pb: 6 }}>
        <TabPanel value={activeTab} index="general">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title="Platform Information" description="Basic details about your platform" icon={<SettingsIcon />}>
                <Stack spacing={2.5}>
                  <TextField
                    label="Platform Name"
                    value={form.platformName}
                    onChange={handleFormChange('platformName')}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                  />
                  <TextField
                    label="Support Email"
                    value={form.supportEmail}
                    onChange={handleFormChange('supportEmail')}
                    type="email"
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                  />
                </Stack>
              </SectionCard>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title="User Profile" description="Your personal information" icon={<PersonIcon />}>
                <Stack spacing={2.5}>
                  <TextField
                    label="Email Address"
                    value={user?.email || ''}
                    fullWidth
                    disabled
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                  />
                  <TextField
                    label="Role"
                    value={user?.role || ''}
                    fullWidth
                    disabled
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                  />
                </Stack>
              </SectionCard>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index="appearance">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <SectionCard title="Language & Region" description="Localize your platform experience" icon={<LanguageIcon />}>
                <Stack spacing={2.5}>
                  <Box>
                    <InputLabel id="language-select-label">Language</InputLabel>
                    <Select
                      labelId="language-select-label"
                      label="Language"
                      value={form.language}
                      onChange={handleSelectChange('language')}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                    >
                      {languageOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                  <Box>
                    <InputLabel id="timezone-select-label">Timezone</InputLabel>
                    <Select
                      labelId="timezone-select-label"
                      label="Timezone"
                      value={form.timezone}
                      onChange={handleSelectChange('timezone')}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                    >
                      {timezoneOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                </Stack>
              </SectionCard>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <SectionCard title="Theme Preference" description="Choose your interface appearance" icon={<PaletteIcon />}>
                <Grid container spacing={2}>
                  {themeOptions.map((option) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={option.value}>
                      <Card
                        onClick={() => setForm((prev) => ({ ...prev, themeMode: option.value }))}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 3,
                          border: '2px solid',
                          borderColor: form.themeMode === option.value ? 'primary.main' : '#E2E8F0',
                          bgcolor: form.themeMode === option.value ? alpha('#0066FF', 0.04) : 'background.paper',
                          transition: 'all 160ms ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography sx={{ fontSize: 32, mb: 1 }}>{option.icon}</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {option.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {option.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </SectionCard>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>

      {/* Floating Save Bar */}
      {dirty && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
          }}
        >
          <Card
            sx={{
              borderRadius: 3,
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: '#22C55E',
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Unsaved changes
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="text" onClick={handleReset} sx={{ color: '#FFFFFF' }}>
                    Discard
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleSave}
                    disabled={saveSettingsMutation.isPending}
                    sx={{
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' },
                      borderRadius: 2.5,
                      px: 2.5,
                    }}
                  >
                    {saveSettingsMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
