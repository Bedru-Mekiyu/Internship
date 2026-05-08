export const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  const productionSecrets = new Set([
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_VERIFY_SECRET',
    'JWT_RESET_SECRET',
    'PAYMENT_WEBHOOK_SECRET',
  ]);

  if (process.env.NODE_ENV === 'production' && productionSecrets.has(name)) {
    const normalized = value.trim().toLowerCase();
    const isPlaceholder =
      normalized.startsWith('replace_with_')
      || normalized.startsWith('change_me')
      || normalized === 'your_secret'
      || normalized === 'secret';

    if (value.trim().length < 32 || isPlaceholder) {
      throw new Error(`Environment variable ${name} must be a strong production secret.`);
    }
  }

  return value;
};
