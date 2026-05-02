import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logInfo, logWarn, logError } from '../utils/logger';

dotenv.config({ quiet: true });

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;
const DEFAULT_LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/mit_lms';
const SHOULD_AUTO_START_INMEMORY_MONGO =
  process.env.NODE_ENV !== 'production' && process.env.AUTO_START_INMEMORY_MONGO !== 'false';

type ConnectDBOptions = {
  retryCount?: number;
  allowFailure?: boolean;
};

const redactMongoUri = (uri: string): string => uri.replace(/\/\/[^@/]+@/, '//***:***@');

const getMongoUri = (): string =>
  process.env.MONGODB_URL || process.env.MONGODB_URI || process.env.MONGO_URI || DEFAULT_LOCAL_MONGO_URI;

const isLikelyLocalMongoUri = (uri: string): boolean => {
  try {
    const parsed = new URL(uri);
    const host = parsed.hostname.toLowerCase();
    return parsed.protocol === 'mongodb:' && (host === 'localhost' || host === '127.0.0.1');
  } catch {
    return /^mongodb:\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/i.test(uri);
  }
};

type InMemoryMongoServer = {
  stop: () => Promise<boolean>;
  getUri: () => string;
};

let inMemoryMongoServer: InMemoryMongoServer | null = null;

const connectInMemoryMongo = async (): Promise<boolean> => {
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    if (!inMemoryMongoServer) {
      inMemoryMongoServer = await MongoMemoryServer.create({
        instance: { dbName: 'mit_lms' },
      });
    }

    const server = inMemoryMongoServer;
    if (!server) {
      throw new Error('In-memory MongoDB server failed to initialize');
    }

    const inMemoryUri = server.getUri();
    await mongoose.connect(inMemoryUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    logWarn('mongodb_inmemory_started', { mongoUri: redactMongoUri(inMemoryUri) });
    return true;
  } catch (error) {
    logError('mongodb_inmemory_start_failed', { error: String(error) });
    return false;
  }
};

export const connectDB = async (options: ConnectDBOptions = {}): Promise<boolean> => {
  const { retryCount = 0, allowFailure = false } = options;
  const mongoUri = getMongoUri();
  const safeMongoUri = redactMongoUri(mongoUri);
  const isLikelyLocalMongo = isLikelyLocalMongoUri(mongoUri);
  const shouldPreferIpv4 = (() => {
    try {
      return new URL(mongoUri).hostname.toLowerCase() === 'localhost';
    } catch {
      return /^mongodb(\+srv)?:\/\/localhost(?=[:/]|$)/i.test(mongoUri);
    }
  })();

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      ...(shouldPreferIpv4 ? { family: 4 } : {}),
    });
    logInfo('mongodb_connected', { mongoUri: safeMongoUri });
    return true;
  } catch (error) {
    const errorText = String(error);
    logError('mongodb_connection_error', { error: errorText, retryCount, mongoUri: safeMongoUri });

    if (retryCount < MAX_RETRIES) {
      logInfo('mongodb_retry_attempt', { retryCount: retryCount + 1, maxRetries: MAX_RETRIES });
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB({ retryCount: retryCount + 1, allowFailure });
    }

    const mongoHint =
      'Set MONGODB_URL (preferred) or MONGO_URI. For local MongoDB, use mongodb://127.0.0.1:27017/mit_lms.';
    logError('mongodb_connection_failed', { error: errorText, mongoUri: safeMongoUri, hint: mongoHint });

    if (SHOULD_AUTO_START_INMEMORY_MONGO && isLikelyLocalMongo) {
      logWarn('mongodb_trying_inmemory_fallback', {
        message: 'Starting in-memory MongoDB for local development.',
      });
      const inMemoryConnected = await connectInMemoryMongo();
      if (inMemoryConnected) {
        return true;
      }
    }

    if (allowFailure) {
      return false;
    }

    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (inMemoryMongoServer) {
    await inMemoryMongoServer.stop();
    inMemoryMongoServer = null;
  }
  logInfo('mongodb_disconnected');
};
