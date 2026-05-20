import dotenv from 'dotenv';

dotenv.config({ path: '.env.test', override: true });

process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_access_secret_min_32_chars_here';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret_min_32_chars_here';
process.env.JWT_VERIFY_SECRET = process.env.JWT_VERIFY_SECRET || 'test_verify_secret_min_32_chars_here';
process.env.JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || 'test_reset_secret_min_32_chars_here';
process.env.PAYMENT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'test_webhook_secret_min_32_chars';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

jest.setTimeout(30000);

afterAll(async () => {
  const mongoose = await import('mongoose');
  if (mongoose.default.connection.readyState === 1) {
    await mongoose.default.connection.close();
  }
});