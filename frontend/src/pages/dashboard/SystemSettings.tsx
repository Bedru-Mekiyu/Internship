import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
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
  Grid,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { type SelectChangeEvent } from '@mui/material/Select';
import { DeleteOutlined, SendOutlined, SettingsOutlined, UploadOutlined } from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { sanitizeHttpUrl } from '../../utils/safeUrl';
import { BRAND } from '../../theme/brand';

interface PlatformSettingsData {
  platformName: string;
  supportEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactHours: string;
  contactMapUrl: string;
  contactResponseTime: string;
  logoUrl?: string;
  language: string;
  timezone: string;
  themeMode: 'light' | 'dark' | 'system';
  provider: string;
  currency: string;
  taxRate: string;
  stripePublicKey: string;
  stripeSecretKey: string;
  smtpEnabled: boolean;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
}

interface ApiSettingsResponse {
  settings: PlatformSettingsData;
  message?: string;
}

const defaultSettings: PlatformSettingsData = {
  platformName: 'LearnSpace',
  supportEmail: 'hello@learnspace.com',
  contactPhone: '+1 (555) 000-0000',
  contactAddress: '100 Smith Street, Collingwood VIC 3066',
  contactHours: 'Mon-Fri from 8am to 5pm EST.',
  contactMapUrl: 'https://www.google.com/maps?q=100+Smith+Street,+Collingwood+VIC+3066&output=embed',
  contactResponseTime: 'Within 24 hours',
  logoUrl: '',
  language: 'en',
  timezone: 'UTC',
  themeMode: 'light',
  provider: 'Stripe',
  currency: 'USD',
  taxRate: '0.00',
  stripePublicKey: '',
  stripeSecretKey: '',
  smtpEnabled: true,
  smtpHost: 'smtp.mailtrap.io',
  smtpPort: '587',
  smtpUsername: '',
  smtpPassword: '',
};

const themeOptions = [
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
  { value: 'system' as const, label: 'System' },
];

const providerOptions = ['Stripe', 'PayPal', 'Manual'];
const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (EUR)' },
  { value: 'GBP', label: 'GBP (GBP)' },
  { value: 'NGN', label: 'NGN (NGN)' },
];

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isValidHttpUrl = (value: string) => {
  if (!value.trim()) return true;

  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 36,
    borderRadius: 1,
    bgcolor: '#FFFFFF',
    fontSize: '0.82rem',
    '& fieldset': {
      borderColor: '#E2E8F0',
    },
    '&:hover fieldset': {
      borderColor: '#CBD5E1',
    },
    '&.Mui-focused fieldset': {
      borderColor: BRAND.primary,
      borderWidth: 1,
    },
  },
  '& .MuiOutlinedInput-input': {
    px: 1.25,
    py: 1,
  },
};

const selectSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 36,
    borderRadius: 1,
    bgcolor: '#FFFFFF',
    fontSize: '0.82rem',
    '& fieldset': {
      borderColor: '#E2E8F0',
    },
    '&:hover fieldset': {
      borderColor: '#CBD5E1',
    },
    '&.Mui-focused fieldset': {
      borderColor: BRAND.primary,
      borderWidth: 1,
    },
  },
  '& .MuiSelect-select': {
    py: 1,
    px: 1.25,
  },
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.7rem' }}>
      {children}
    </Typography>
  );
}

function SettingsPanel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card
      sx={{
        borderRadius: 1,
        border: '1px solid #DFE7F2',
        boxShadow: 'none',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 1.75,
            borderBottom: '1px solid #EDF1F7',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.25, fontSize: '0.72rem' }}>
              {description}
            </Typography>
          </Box>
          {action}
        </Box>
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

function ThemePreview({
  value,
  label,
  selected,
  onSelect,
}: {
  value: PlatformSettingsData['themeMode'];
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const dark = value === 'dark';
  const system = value === 'system';

  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      sx={{
        width: '100%',
        minHeight: 92,
        border: selected ? `2px solid ${BRAND.primary}` : '1px solid #E2E8F0',
        bgcolor: selected ? alpha(BRAND.primary, 0.04) : '#FFFFFF',
        borderRadius: 1,
        cursor: 'pointer',
        p: 1,
        textAlign: 'center',
        transition: 'border-color 160ms ease, background-color 160ms ease',
        '&:hover': {
          borderColor: BRAND.primary,
        },
      }}
    >
      <Box
        sx={{
          height: 42,
          borderRadius: 0.75,
          border: '1px solid #E2E8F0',
          bgcolor: dark ? '#111827' : '#F8FAFC',
          p: 0.7,
          display: 'grid',
          gridTemplateColumns: system ? '1fr 1fr' : '1fr',
          gap: 0.7,
        }}
      >
        <Box
          sx={{
            borderRadius: 0.5,
            bgcolor: dark ? '#1F2937' : '#E2E8F0',
          }}
        />
        {system ? (
          <Box
            sx={{
              borderRadius: 0.5,
              bgcolor: '#111827',
            }}
          />
        ) : null}
      </Box>
      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#0F172A', fontWeight: 800 }}>
        {label}
      </Typography>
    </Box>
  );
}

function maskSecret(value: string) {
  if (!value.trim()) {
    return '';
  }

  const visibleStart = value.slice(0, Math.min(8, value.length));
  const visibleEnd = value.length > 12 ? value.slice(-4) : '';

  return `${visibleStart}${'*'.repeat(12)}${visibleEnd}`;
}

export default function SystemSettings() {
  const { user, refreshSession } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PlatformSettingsData>(defaultSettings);
  const [hasLocalEdits, setHasLocalEdits] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [logoDraft, setLogoDraft] = useState('');

  const { data: settingsData } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const response = await api.get<ApiSettingsResponse>('/api/settings');
      return response.data.settings;
    },
    enabled: user?.role === 'admin',
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<PlatformSettingsData>) => {
      const response = await api.patch<ApiSettingsResponse>('/api/settings', settings);
      return response.data.settings;
    },
    onSuccess: async (settings) => {
      queryClient.setQueryData(['system-settings'], settings);
      await refreshSession();
      setForm({ ...defaultSettings, ...settings });
      setHasLocalEdits(false);
      setFeedback({ type: 'success', message: 'Settings saved successfully.' });
    },
    onError: () => {
      setFeedback({ type: 'error', message: 'Failed to save settings. Please try again.' });
    },
  });

  const mergedSettings = useMemo<PlatformSettingsData>(
    () => ({
      ...defaultSettings,
      ...(settingsData || {}),
    }),
    [settingsData],
  );

  const activeForm = hasLocalEdits ? form : mergedSettings;
  const logoPreviewUrl = sanitizeHttpUrl(activeForm.logoUrl);
  const logoDraftError = !isValidHttpUrl(logoDraft);
  const supportEmailError = activeForm.supportEmail.trim().length > 0 && !isValidEmail(activeForm.supportEmail);
  const contactMapUrlError = activeForm.contactMapUrl.trim().length > 0 && !isValidHttpUrl(activeForm.contactMapUrl);
  const taxRateError = activeForm.taxRate.trim().length > 0 && Number.isNaN(Number(activeForm.taxRate));
  const isSaving = saveSettingsMutation.isPending;

  const applyFormPatch = (patch: Partial<PlatformSettingsData>) => {
    setForm((previous) => ({ ...(hasLocalEdits ? previous : activeForm), ...patch }));
    setHasLocalEdits(true);
    setFeedback(null);
  };

  const handleFormChange =
    (field: keyof PlatformSettingsData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      applyFormPatch({ [field]: event.target.value } as Partial<PlatformSettingsData>);
    };

  const handleSelectChange = (field: keyof PlatformSettingsData) => (event: SelectChangeEvent) => {
    applyFormPatch({ [field]: event.target.value } as Partial<PlatformSettingsData>);
  };

  const handleDiscardChanges = () => {
    setForm(mergedSettings);
    setHasLocalEdits(false);
    setFeedback(null);
  };

  const handleSave = async () => {
    if (supportEmailError || contactMapUrlError || taxRateError) {
      setFeedback({ type: 'error', message: 'Fix the highlighted fields before saving.' });
      return;
    }

    await saveSettingsMutation.mutateAsync({
      platformName: activeForm.platformName,
      supportEmail: activeForm.supportEmail,
      contactPhone: activeForm.contactPhone,
      contactAddress: activeForm.contactAddress,
      contactHours: activeForm.contactHours,
      contactMapUrl: activeForm.contactMapUrl,
      contactResponseTime: activeForm.contactResponseTime,
      logoUrl: activeForm.logoUrl,
      themeMode: activeForm.themeMode,
      provider: activeForm.provider,
      currency: activeForm.currency,
      taxRate: activeForm.taxRate,
      stripePublicKey: activeForm.stripePublicKey,
      smtpEnabled: activeForm.smtpEnabled,
      smtpHost: activeForm.smtpHost,
      smtpPort: activeForm.smtpPort,
      smtpUsername: activeForm.smtpUsername,
    });
  };

  const openLogoDialog = () => {
    setLogoDraft(activeForm.logoUrl || '');
    setLogoDialogOpen(true);
  };

  const saveLogoDraft = () => {
    if (logoDraftError) {
      return;
    }

    applyFormPatch({ logoUrl: logoDraft.trim() });
    setLogoDialogOpen(false);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 650, mx: 'auto', pb: hasLocalEdits ? 8 : 2 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: { xs: '1.45rem', md: '1.7rem' } }}>
          System Settings
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mt: 0.35, fontSize: '0.78rem' }}>
          Manage your platform&apos;s global configuration and preferences.
        </Typography>
      </Box>

      {feedback ? (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 2, borderRadius: 1 }}>
          {feedback.message}
        </Alert>
      ) : null}

      <Stack spacing={2.5}>
        <SettingsPanel title="Platform Branding" description="Customize the look and feel of your admin panel.">
          <Stack spacing={2.1}>
            <Box>
              <FieldLabel>Platform Logo</FieldLabel>
              <Box
                sx={{
                  mt: 0.8,
                  display: 'flex',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 1.5,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1.2,
                    border: '1px solid #DDE7F3',
                    bgcolor: '#F8FAFC',
                    display: 'grid',
                    placeItems: 'center',
                    color: BRAND.primary,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {logoPreviewUrl ? (
                    <Box
                      component="img"
                      src={logoPreviewUrl}
                      alt="Platform logo"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <SettingsOutlined sx={{ fontSize: 27 }} />
                  )}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="outlined" size="small" startIcon={<UploadOutlined />} onClick={openLogoDialog}>
                      Change Logo
                    </Button>
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      startIcon={<DeleteOutlined />}
                      onClick={() => applyFormPatch({ logoUrl: '' })}
                      disabled={!activeForm.logoUrl}
                    >
                      Remove
                    </Button>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748B', mt: 0.65, display: 'block', fontSize: '0.68rem' }}>
                    Recommended size: 512x512px. JPG, PNG or SVG.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Stack spacing={0.75}>
              <FieldLabel>Platform Name</FieldLabel>
              <TextField
                value={activeForm.platformName}
                onChange={handleFormChange('platformName')}
                size="small"
                disabled={isSaving}
                sx={inputSx}
              />
            </Stack>

            <Stack spacing={0.75}>
              <FieldLabel>Support Email</FieldLabel>
              <TextField
                value={activeForm.supportEmail}
                onChange={handleFormChange('supportEmail')}
                size="small"
                disabled={isSaving}
                error={supportEmailError}
                helperText={supportEmailError ? 'Use a valid email address.' : ' '}
                sx={{ ...inputSx, '& .MuiFormHelperText-root': { mx: 0, mt: 0.35, minHeight: 0 } }}
              />
            </Stack>
          </Stack>
        </SettingsPanel>

        <SettingsPanel
          title="Contact & Support"
          description="Control the public contact details shown on the marketing contact page."
        >
          <Stack spacing={1.7}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.75}>
                  <FieldLabel>Contact Phone</FieldLabel>
                  <TextField
                    value={activeForm.contactPhone}
                    onChange={handleFormChange('contactPhone')}
                    size="small"
                    disabled={isSaving}
                    sx={inputSx}
                  />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.75}>
                  <FieldLabel>Response Time</FieldLabel>
                  <TextField
                    value={activeForm.contactResponseTime}
                    onChange={handleFormChange('contactResponseTime')}
                    size="small"
                    disabled={isSaving}
                    sx={inputSx}
                  />
                </Stack>
              </Grid>
            </Grid>

            <Stack spacing={0.75}>
              <FieldLabel>Office Address</FieldLabel>
              <TextField
                value={activeForm.contactAddress}
                onChange={handleFormChange('contactAddress')}
                size="small"
                disabled={isSaving}
                sx={inputSx}
              />
            </Stack>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.75}>
                  <FieldLabel>Office Hours</FieldLabel>
                  <TextField
                    value={activeForm.contactHours}
                    onChange={handleFormChange('contactHours')}
                    size="small"
                    disabled={isSaving}
                    sx={inputSx}
                  />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.75}>
                  <FieldLabel>Map Embed URL</FieldLabel>
                  <TextField
                    value={activeForm.contactMapUrl}
                    onChange={handleFormChange('contactMapUrl')}
                    size="small"
                    disabled={isSaving}
                    error={contactMapUrlError}
                    helperText={contactMapUrlError ? 'Use a full http:// or https:// embed URL.' : ' '}
                    sx={{ ...inputSx, '& .MuiFormHelperText-root': { mx: 0, mt: 0.35, minHeight: 0 } }}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </SettingsPanel>

        <SettingsPanel title="Appearance" description="Choose the default theme for your users.">
          <Stack spacing={1.2}>
            <FieldLabel>Interface Theme</FieldLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
              {themeOptions.map((option) => (
                <ThemePreview
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  selected={activeForm.themeMode === option.value}
                  onSelect={() => applyFormPatch({ themeMode: option.value })}
                />
              ))}
            </Box>
          </Stack>
        </SettingsPanel>

        <SettingsPanel title="Payment Configuration" description="Configure payment gateways and currency settings.">
          <Stack spacing={1.7}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
                <FieldLabel>Active Provider</FieldLabel>
                <Button
                  variant="text"
                  size="small"
                  sx={{ fontSize: '0.68rem', minWidth: 0, p: 0 }}
                  onClick={() => setFeedback({ type: 'info', message: 'Payment provider connection flow is not configured yet.' })}
                >
                  Connect Now
                </Button>
              </Box>
              <FormControl fullWidth size="small" sx={selectSx}>
                <Select value={activeForm.provider || 'Stripe'} onChange={handleSelectChange('provider')}>
                  {providerOptions.map((provider) => (
                    <MenuItem key={provider} value={provider}>
                      {provider}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.75}>
                  <FieldLabel>Currency</FieldLabel>
                  <FormControl fullWidth size="small" sx={selectSx}>
                    <Select value={activeForm.currency || 'USD'} onChange={handleSelectChange('currency')}>
                      {currencyOptions.map((currency) => (
                        <MenuItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.75}>
                  <FieldLabel>Tax Rate (%)</FieldLabel>
                  <TextField
                    value={activeForm.taxRate}
                    onChange={handleFormChange('taxRate')}
                    size="small"
                    disabled={isSaving}
                    error={taxRateError}
                    sx={inputSx}
                  />
                </Stack>
              </Grid>
            </Grid>

            <Stack spacing={0.75}>
              <FieldLabel>Stripe Public Key</FieldLabel>
              <TextField
                value={activeForm.stripePublicKey}
                onChange={handleFormChange('stripePublicKey')}
                size="small"
                placeholder="pk_test_..."
                disabled={isSaving}
                sx={inputSx}
              />
            </Stack>

            <Stack spacing={0.75}>
              <FieldLabel>Stripe Secret Key</FieldLabel>
              <TextField
                value={maskSecret(activeForm.stripeSecretKey)}
                size="small"
                placeholder="sk_test_..."
                type="password"
                disabled={isSaving}
                slotProps={{ htmlInput: { readOnly: true } }}
                sx={inputSx}
              />
            </Stack>
          </Stack>
        </SettingsPanel>

        <SettingsPanel
          title="Email Settings"
          description="Configure SMTP for system emails."
          action={
            <Switch
              checked={activeForm.smtpEnabled}
              onChange={(_, checked) => applyFormPatch({ smtpEnabled: checked })}
              size="small"
            />
          }
        >
          <Stack spacing={1.7}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Stack spacing={0.75}>
                  <FieldLabel>SMTP Host</FieldLabel>
                  <TextField
                    value={activeForm.smtpHost}
                    onChange={handleFormChange('smtpHost')}
                    size="small"
                    disabled={isSaving || !activeForm.smtpEnabled}
                    sx={inputSx}
                  />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Stack spacing={0.75}>
                  <FieldLabel>Port</FieldLabel>
                  <TextField
                    value={activeForm.smtpPort}
                    onChange={handleFormChange('smtpPort')}
                    size="small"
                    disabled={isSaving || !activeForm.smtpEnabled}
                    sx={inputSx}
                  />
                </Stack>
              </Grid>
            </Grid>

            <Stack spacing={0.75}>
              <FieldLabel>Username</FieldLabel>
              <TextField
                value={activeForm.smtpUsername}
                onChange={handleFormChange('smtpUsername')}
                size="small"
                disabled={isSaving || !activeForm.smtpEnabled}
                sx={inputSx}
              />
            </Stack>

            <Stack spacing={0.75}>
              <FieldLabel>Password</FieldLabel>
              <TextField
                value={maskSecret(activeForm.smtpPassword)}
                size="small"
                type="password"
                placeholder="************"
                disabled={isSaving || !activeForm.smtpEnabled}
                slotProps={{ htmlInput: { readOnly: true } }}
                sx={inputSx}
              />
            </Stack>

            <Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<SendOutlined />}
                disabled={!activeForm.smtpEnabled}
                onClick={() => setFeedback({ type: 'info', message: 'Test email delivery is not connected to a backend endpoint yet.' })}
              >
                Send Test Email
              </Button>
            </Box>
          </Stack>
        </SettingsPanel>
      </Stack>

      {hasLocalEdits ? (
        <Box
          sx={{
            position: 'sticky',
            bottom: 16,
            zIndex: 5,
            mt: 2,
            borderRadius: 1,
            bgcolor: '#0B1220',
            color: '#FFFFFF',
            px: 1.25,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            boxShadow: '0 10px 24px rgba(15,23,42,0.22)',
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
          }}
        >
          <Typography variant="caption" sx={{ color: '#E2E8F0', fontWeight: 700, fontSize: '0.7rem' }}>
            Careful - you have unsaved changes.
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, ml: 'auto' }}>
            <Button
              size="small"
              variant="text"
              onClick={handleDiscardChanges}
              disabled={isSaving}
              sx={{ color: '#CBD5E1', '&:hover': { bgcolor: alpha('#FFFFFF', 0.08) } }}
            >
              Discard
            </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSave}
                disabled={isSaving || supportEmailError || contactMapUrlError || taxRateError}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#0F172A',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                },
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      ) : null}

      <Dialog open={logoDialogOpen} onClose={() => setLogoDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Change Logo</DialogTitle>
        <DialogContent>
          <Stack spacing={0.75} sx={{ mt: 1 }}>
            <FieldLabel>Logo URL</FieldLabel>
            <TextField
              value={logoDraft}
              onChange={(event) => setLogoDraft(event.target.value)}
              size="small"
              placeholder="https://example.com/logo.svg"
              error={logoDraftError}
              helperText={logoDraftError ? 'Use a full URL starting with http:// or https://.' : ' '}
              sx={inputSx}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveLogoDraft} disabled={logoDraftError}>
            Save Logo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
