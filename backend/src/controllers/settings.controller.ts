import { Request, Response } from 'express';
import { AppError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';

interface PlatformSettings {
  platformName: string;
  supportEmail: string;
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

const defaultSettings: PlatformSettings = {
  platformName: 'LearnSpace',
  supportEmail: 'support@learnspace.com',
  language: 'en',
  timezone: 'UTC',
  themeMode: 'light',
  provider: 'Stripe',
  currency: 'USD',
  taxRate: '0.00',
  stripePublicKey: '',
  stripeSecretKey: '',
  smtpEnabled: false,
  smtpHost: 'smtp.mailtrap.io',
  smtpPort: '587',
  smtpUsername: '',
  smtpPassword: '',
};

let platformSettings: PlatformSettings = { ...defaultSettings };

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user?.role === 'admin';

  if (!isAdmin) {
    throw new AppError('Unauthorized. Admin access required.', 403);
  }

  return res.json({ settings: platformSettings });
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
    'logoUrl',
    'language',
    'timezone',
    'themeMode',
    'provider',
    'currency',
    'taxRate',
    'stripePublicKey',
    'stripeSecretKey',
    'smtpEnabled',
    'smtpHost',
    'smtpPort',
    'smtpUsername',
    'smtpPassword',
  ];

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
