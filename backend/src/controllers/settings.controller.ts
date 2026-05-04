import { Request, Response } from 'express';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';

interface PlatformSettings {
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
  trustPartners: string[];
  homepageFeatures: Array<{
    title: string;
    description: string;
    color: string;
  }>;
  pricingPlans: Array<{
    name: string;
    description: string;
    monthlyPrice: string;
    yearlyPrice: string;
    yearlyLabel: string;
    features: string[];
    featured?: boolean;
    cta: string;
    accent: string;
  }>;
  pricingComparison: Array<{
    label: string;
    free: string | boolean;
    pro: string | boolean;
    business: string | boolean;
  }>;
}

const defaultSettings: PlatformSettings = {
  platformName: 'LearnSpace',
  supportEmail: 'hello@learnspace.com',
  contactPhone: '+1 (555) 000-0000',
  contactAddress: '100 Smith Street, Collingwood VIC 3066',
  contactHours: 'Mon-Fri from 8am to 5pm EST.',
  contactMapUrl: 'https://www.google.com/maps?q=100+Smith+Street,+Collingwood+VIC+3066&output=embed',
  contactResponseTime: 'Within 24 hours',
  language: 'en',
  timezone: 'UTC',
  themeMode: 'light',
  provider: 'Stripe',
  currency: 'USD',
  taxRate: '0.00',
  stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  smtpEnabled: process.env.SMTP_ENABLED === 'true',
  smtpHost: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  smtpPort: process.env.SMTP_PORT || '587',
  smtpUsername: process.env.SMTP_USERNAME || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  trustPartners: ['ASU', 'Meta', 'Notion', 'Khan Academy', 'Udacity'],
  homepageFeatures: [
    {
      title: 'Drag & Drop Builder',
      description: 'Create lessons, modules, and landing pages with a flexible visual editor.',
      color: '#DBEAFE',
    },
    {
      title: 'Advanced Analytics',
      description: 'Track enrollments, completion rates, and revenue with clear reporting.',
      color: '#E0E7FF',
    },
    {
      title: 'Community Hub',
      description: 'Keep learners engaged with discussions, Q&A, and cohort updates.',
      color: '#DCFCE7',
    },
    {
      title: 'Mobile Ready',
      description: 'Deliver a polished experience on every screen, from desktop to phone.',
      color: '#FDE68A',
    },
    {
      title: 'Certification',
      description: 'Reward course completion with branded certificates that learners value.',
      color: '#FCE7F3',
    },
    {
      title: 'Seamless Payments',
      description: 'Collect one-time or subscription payments with flexible pricing options.',
      color: '#FFE4E6',
    },
  ],
  pricingPlans: [
    {
      name: 'Free',
      description: 'Best for exploring LearnSpace and launching your first course.',
      monthlyPrice: '$0',
      yearlyPrice: '$0',
      yearlyLabel: 'Forever',
      features: ['1 published course', 'Basic analytics', 'Community access', 'Email support'],
      cta: 'Start Free',
      accent: '#64748B',
    },
    {
      name: 'Pro',
      description: 'For creators who want better insights, more control, and faster growth.',
      monthlyPrice: '$29',
      yearlyPrice: '$24',
      yearlyLabel: '/mo billed yearly',
      features: ['Unlimited courses', 'Advanced analytics', 'Certificates', 'Payments', 'Priority support'],
      featured: true,
      cta: 'Get Pro',
      accent: '#0066FF',
    },
    {
      name: 'Business / Enterprise',
      description: 'For teams, academies, and organizations needing custom onboarding.',
      monthlyPrice: '$99',
      yearlyPrice: '$84',
      yearlyLabel: '/mo billed yearly',
      features: ['Everything in Pro', 'Team roles', 'Custom branding', 'Dedicated onboarding', 'SLA support'],
      cta: 'Talk to Sales',
      accent: '#6366F1',
    },
  ],
  pricingComparison: [
    { label: 'Published courses', free: '1', pro: 'Unlimited', business: 'Unlimited' },
    { label: 'Analytics dashboard', free: 'Basic', pro: 'Advanced', business: 'Advanced' },
    { label: 'Certificates', free: false, pro: true, business: true },
    { label: 'Payments', free: false, pro: true, business: true },
    { label: 'Team roles', free: false, pro: false, business: true },
    { label: 'Custom branding', free: false, pro: false, business: true },
    { label: 'Dedicated onboarding', free: false, pro: false, business: true },
    { label: 'Priority support', free: false, pro: true, business: true },
  ],
};

let platformSettings: PlatformSettings = { ...defaultSettings };

export const getPublicSettings = asyncHandler(async (_req: Request, res: Response) => {
  return res.json({
    settings: {
      platformName: platformSettings.platformName,
      supportEmail: platformSettings.supportEmail,
      contactPhone: platformSettings.contactPhone,
      contactAddress: platformSettings.contactAddress,
      contactHours: platformSettings.contactHours,
      contactMapUrl: platformSettings.contactMapUrl,
      contactResponseTime: platformSettings.contactResponseTime,
      trustPartners: platformSettings.trustPartners,
      homepageFeatures: platformSettings.homepageFeatures,
      pricingPlans: platformSettings.pricingPlans,
      pricingComparison: platformSettings.pricingComparison,
    },
  });
});

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user?.role === 'admin';

  if (!isAdmin) {
    throw new AppError('Unauthorized. Admin access required.', 403);
  }

  const safeSettings = {
    ...platformSettings,
    stripeSecretKey: platformSettings.stripeSecretKey ? '••••••••' : '',
    smtpPassword: platformSettings.smtpPassword ? '••••••••' : '',
  };

  return res.json({ settings: safeSettings });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user?.role === 'admin';

  if (!isAdmin) {
    throw new AppError('Unauthorized. Admin access required.', 403);
  }

  const updates = req.body as Partial<PlatformSettings>;
  const allowedFields = [
    'platformName',
    'supportEmail',
    'contactPhone',
    'contactAddress',
    'contactHours',
    'contactMapUrl',
    'contactResponseTime',
    'logoUrl',
    'language',
    'timezone',
    'themeMode',
    'provider',
    'currency',
    'taxRate',
    'stripePublicKey',
    'smtpEnabled',
    'smtpHost',
    'smtpPort',
    'smtpUsername',
    'trustPartners',
    'homepageFeatures',
    'pricingPlans',
    'pricingComparison',
  ];
  
  const protectedFields: (keyof PlatformSettings)[] = ['stripeSecretKey', 'smtpPassword'];
  for (const field of protectedFields) {
    if (field in updates && updates[field]) {
      delete updates[field];
    }
  }

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      platformSettings = {
        ...platformSettings,
        [key]: value,
      };
    }
  }

  return res.json({ settings: platformSettings, message: 'Settings updated successfully' });
});

export const resetSettings = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user?.role === 'admin';

  if (!isAdmin) {
    throw new AppError('Unauthorized. Admin access required.', 403);
  }

  platformSettings = { ...defaultSettings };
  return res.json({ settings: platformSettings, message: 'Settings reset to defaults' });
});
