import dotenv from 'dotenv';

dotenv.config({ path: '.env.test', override: true });

process.env.NODE_ENV = 'test';
// Don't override MONGODB_URL if already set (e.g. CI provides MongoDB service)
if (!process.env.MONGODB_URL) {
  process.env.MONGODB_URL = '';
}
process.env.AUTO_START_INMEMORY_MONGO = 'true';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_access_secret_min_32_chars_here';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret_min_32_chars_here';
process.env.JWT_VERIFY_SECRET = process.env.JWT_VERIFY_SECRET || 'test_verify_secret_min_32_chars_here';
process.env.JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || 'test_reset_secret_min_32_chars_here';
process.env.PAYMENT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'test_webhook_secret_min_32_chars';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

jest.setTimeout(60000); // Increase timeout for MongoDB connection

beforeAll(async () => {
  const { connectDB } = await import('../../src/config/database');
  const connected = await connectDB({ allowFailure: false, retryCount: 0 });
  if (!connected) {
    throw new Error('Failed to connect to MongoDB for tests');
  }
}, 30000);

afterAll(async () => {
  const mongoose = await import('mongoose');
  if (mongoose.default.connection.readyState === 1) {
    await mongoose.default.connection.dropDatabase();
    await mongoose.default.connection.close();
  }
});
