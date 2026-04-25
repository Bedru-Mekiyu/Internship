import mongoose from 'mongoose';
import dotenv from 'dotenv';
<<<<<<< HEAD
import { logInfo, logError } from '../utils/logger';

dotenv.config({ quiet: true });

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export const connectDB = async (retryCount = 0): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mit-lms';
  
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    logInfo('mongodb_connected');
  } catch (error) {
    logError('mongodb_connection_error', { error: String(error), retryCount });
    
    if (retryCount < MAX_RETRIES) {
      logInfo('mongodb_retry_attempt', { retryCount: retryCount + 1, maxRetries: MAX_RETRIES });
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retryCount + 1);
    }
    
    logError('mongodb_connection_failed', { error: String(error) });
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logInfo('mongodb_disconnected');
=======

dotenv.config({ quiet: true });

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mit-lms');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
};