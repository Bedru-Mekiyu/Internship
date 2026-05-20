import mongoose from 'mongoose';
import { User } from '../../src/models/User.model';
import { Course } from '../../src/models/Course.model';
import { Enrollment } from '../../src/models/Enrollment.model';
import { Payment } from '../../src/models/Payment.model';
import { Discussion } from '../../src/models/Discussion.model';
import { Quiz } from '../../src/models/Quiz.model';
import { QuizAttempt } from '../../src/models/QuizAttempt.model';
import { Certificate } from '../../src/models/Certificate.model';

export interface CleanupOptions {
  dropCollections?: boolean;
  timeout?: number;
}

const DEFAULT_TIMEOUT = 10000;

export async function cleanupDatabase(options: CleanupOptions = {}): Promise<void> {
  const { dropCollections = false, timeout: _timeout = DEFAULT_TIMEOUT } = options;

  const collections = [
    User,
    Course,
    Enrollment,
    Payment,
    Discussion,
    Quiz,
    QuizAttempt,
    Certificate,
  ];

  const deletePromises = collections.map(async (model) => {
    try {
      await model.deleteMany({});
    } catch (error) {
      console.warn(`Failed to cleanup ${model.modelName}:`, error);
    }
  });

  await Promise.all(deletePromises);

  if (dropCollections) {
    const db = mongoose.connection.db;
    if (db) {
      for (const model of collections) {
        try {
          await db.collection(model.modelName.toLowerCase()).drop();
        } catch {
          // Collection may not exist, ignore
        }
      }
    }
  }
}

export async function waitForDatabase(_timeout: number = DEFAULT_TIMEOUT): Promise<void> {
  const start = Date.now();
  
  while (mongoose.connection.readyState !== 1) {
    if (Date.now() - start > 30000) {
      throw new Error('Database connection timeout');
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export async function createTestCourse(
  instructorId: mongoose.Types.ObjectId,
  overrides: Partial<{
    title: string;
    slug: string;
    description: string;
    status: string;
    category: string;
    level: string;
  }> = {}
): Promise<mongoose.Document> {
  return Course.create({
    title: overrides.title || `Test Course ${Date.now()}`,
    slug: overrides.slug || `test-course-${Date.now()}`,
    description: overrides.description || 'Test course description',
    instructor: instructorId,
    status: overrides.status || 'published',
    category: overrides.category || 'Development',
    level: overrides.level || 'beginner',
    pricing: { type: 'free', price: 0 },
  });
}

export async function createTestEnrollment(
  userId: mongoose.Types.ObjectId,
  courseId: mongoose.Types.ObjectId
): Promise<mongoose.Document> {
  return Enrollment.create({
    userId,
    courseId,
    status: 'active',
    completedLessons: [],
    progress: 0,
  });
}

export async function createTestPayment(
  userId: mongoose.Types.ObjectId,
  courseId: mongoose.Types.ObjectId,
  overrides: Partial<{
    amount: number;
    status: string;
    provider: string;
  }> = {}
): Promise<mongoose.Document> {
  return Payment.create({
    userId,
    courseId,
    amount: overrides.amount || 99.99,
    status: overrides.status || 'completed',
    provider: overrides.provider || 'stripe',
    externalPaymentId: `pay_test_${Date.now()}`,
  });
}

export async function seedTestUsers(): Promise<{
  studentId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
}> {
  const bcrypt = require('bcrypt');
  const BCRYPT_ROUNDS = 10;

  const studentId = new mongoose.Types.ObjectId();
  const instructorId = new mongoose.Types.ObjectId();
  const adminId = new mongoose.Types.ObjectId();

  const hashedPassword = await bcrypt.hash('TestPass123!', BCRYPT_ROUNDS);

  await User.insertMany([
    {
      _id: studentId,
      email: `student-${Date.now()}@test.com`,
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Student',
      role: 'student',
      isActive: true,
      isEmailVerified: true,
      tokenVersion: 0,
    },
    {
      _id: instructorId,
      email: `instructor-${Date.now()}@test.com`,
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Instructor',
      role: 'instructor',
      isActive: true,
      isEmailVerified: true,
      tokenVersion: 0,
    },
    {
      _id: adminId,
      email: `admin-${Date.now()}@test.com`,
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Admin',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      tokenVersion: 0,
    },
  ]);

  return { studentId, instructorId, adminId };
}

export function getTestConnectionString(): string {
  const envUri = process.env.MONGODB_URL || process.env.MONGODB_URI || process.env.MONGO_URI;
  if (envUri) {
    return envUri;
  }
  return 'mongodb://127.0.0.1:27017/test_mit_lms';
}

export async function resetDatabaseState(): Promise<void> {
  await cleanupDatabase();
  
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const name of Object.keys(collections)) {
      await collections[name].deleteMany({});
    }
  }
}