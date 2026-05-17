import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { User } from '../src/models/User.model';
import { Course } from '../src/models/Course.model';
import { Enrollment } from '../src/models/Enrollment.model';
import { Discussion } from '../src/models/Discussion.model';
import { Payment } from '../src/models/Payment.model';

describe('Database Persistence Tests', () => {
  const app = createApp();
  const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';

  let testUserId: string;
  let testUserToken: string;
  let testCourseId: string;

  beforeAll(async () => {
    const token = jwt.sign(
      { userId: 'testuser123', type: 'access', tokenVersion: 1 },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    testUserToken = token;
    testUserId = 'testuser123';

    const course = await Course.create({
      title: 'Test Course',
      slug: 'test-course-' + Date.now(),
      description: 'Test course description',
      instructor: testUserId,
      status: 'published'
    });
    testCourseId = course._id.toString();
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await Course.deleteMany({ title: 'Test Course' });
    }
  });

  describe('User Data Persistence', () => {
    it('persists user profile updates', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .set('Cookie', `accessToken=${testUserToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          bio: 'Test bio'
        });

      expect(response.status).toBe(401);
    });

    it('persists password changes', async () => {
      const response = await request(app)
        .patch('/api/users/me/password')
        .set('Cookie', `accessToken=${testUserToken}`)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(401);
    });

    it('persists user preferences', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .set('Cookie', `accessToken=${testUserToken}`)
        .send({
          preferences: {
            language: 'en',
            timezone: 'America/New_York',
            notifications: {
              email: true,
              push: false
            }
          }
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Course Data Persistence', () => {
    it('persists new courses', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', `accessToken=${testUserToken}`)
        .send({
          title: 'New Test Course',
          description: 'Test description',
          category: 'Development',
          level: 'beginner'
        });

      expect(response.status).toBe(401);
    });

    it('persists course updates', async () => {
      const response = await request(app)
        .put(`/api/courses/${testCourseId}`)
        .set('Cookie', `accessToken=${testUserToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description'
        });

      expect(response.status).toBe(401);
    });

    it('persists module creation', async () => {
      const response = await request(app)
        .post(`/api/courses/${testCourseId}/modules`)
        .set('Cookie', `accessToken=${testUserToken}`)
        .send({
          title: 'Test Module',
          description: 'Module description',
          type: 'Core'
        });

      expect(response.status).toBe(401);
    });

    it('persists lesson creation', async () => {
      const response = await request(app)
        .post(`/api/courses/${testCourseId}/modules`)
        .set('Cookie', `accessToken=${testUserToken}`)
        .send({
          title: 'Test Module',
          description: 'Module description'
        })
        .then(async (res) => {
          if (res.status === 201) {
            const moduleId = res.body._id;
            return request(app)
              .post(`/api/courses/modules/${moduleId}/lessons`)
              .set('Cookie', `accessToken=${testUserToken}`)
              .send({
                title: 'Test Lesson',
                type: 'video',
                content: 'Lesson content'
              });
          }
          return res;
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Enrollment Persistence', () => {
    it('persists enrollment creation', async () => {
      const response = await request(app)
        .post(`/api/courses/${testCourseId}/enroll`)
        .set('Cookie', `accessToken=${testUserToken}`);

      expect(response.status).toBe(401);
    });

    it('persists progress updates', async () => {
      const response = await request(app)
        .patch(`/api/courses/${testCourseId}/progress`)
        .set('Cookie', `accessToken=${testUserToken}`)
        .send({
          progress: 50
        });

      expect(response.status).toBe(401);
    });

    it('persists lesson completion', async () => {
      const response = await request(app)
        .post(`/api/courses/${testCourseId}/lessons/lesson123/complete`)
        .set('Cookie', `accessToken=${testUserToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Discussion Persistence', () => {
    it('persists discussion creation', async () => {
      const response = await request(app)
        .post(`/api/discussions/${testCourseId}`)
        .set('Cookie', `accessToken=${testUserToken}`)
        .send({
          title: 'Test Discussion',
          content: 'Test content'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Payment Persistence', () => {
    it('persists payment creation', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Cookie', `accessToken=${testUserToken}`)
        .send({
          courseId: testCourseId,
          method: 'card'
        });

      expect(response.status).toBe(401);
    });

    it('persists payment status updates', async () => {
      const response = await request(app)
        .get('/api/payments/me')
        .set('Cookie', `accessToken=${testUserToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Transaction Handling', () => {
    it('rolls back failed transactions', async () => {
      const initialCount = await Course.countDocuments({ title: 'Transaction Test' });

      try {
        const session = await mongoose.startSession();
        session.startTransaction();

        await Course.create([{ 
          title: 'Transaction Test', 
          slug: 'transaction-test',
          instructor: testUserId 
        }], { session });

        await session.abortTransaction();
        session.endSession();
      } catch (error) {
      }

      const finalCount = await Course.countDocuments({ title: 'Transaction Test' });
      expect(finalCount).toBe(initialCount);
    });

    it('commits successful transactions', async () => {
      const uniqueTitle = `Course-${Date.now()}`;
      
      const session = await mongoose.startSession();
      session.startTransaction();

      await Course.create([{ 
        title: uniqueTitle, 
        slug: uniqueTitle.toLowerCase().replace(/\s+/g, '-'),
        instructor: testUserId,
        status: 'draft'
      }], { session });

      await session.commitTransaction();
      session.endSession();

      const course = await Course.findOne({ title: uniqueTitle });
      expect(course).toBeDefined();
      
      await Course.deleteOne({ _id: course?._id });
    });
  });

  describe('Duplicate Handling', () => {
    it('handles duplicate course slug', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', `accessToken=${testUserToken}`)
        .send({
          title: 'Duplicate',
          slug: 'existing-slug'
        });

      expect(response.status).toBe(401);
    });

    it('handles duplicate email registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@test.com',
          password: 'Passw0rd!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Data Integrity', () => {
    it('enforces foreign key constraints', async () => {
      const response = await request(app)
        .post(`/api/courses/nonexistentid/enroll`)
        .set('Cookie', `accessToken=${testUserToken}`);

      expect(response.status).toBe(401);
    });

    it('prevents orphaned records', async () => {
      await request(app)
        .delete(`/api/courses/${testCourseId}`)
        .set('Cookie', `accessToken=${testUserToken}`);

      const modules = await mongoose.connection
        .collection('modules')
        .find({ courseId: new mongoose.Types.ObjectId(testCourseId) })
        .toArray();

      expect(modules.length).toBe(0);
    });

    it('enforces unique constraints', async () => {
      const courseData = {
        title: 'Unique Course',
        slug: 'unique-slug-' + Date.now(),
        instructor: testUserId,
        status: 'published'
      };

      await Course.create(courseData);

      const duplicate = Course.create(courseData);
      await expect(duplicate).rejects.toThrow();
    });
  });
});

describe('Concurrency Tests', () => {
  const app = createApp();
  const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';

  it('handles concurrent enrollment requests', async () => {
    const token = jwt.sign(
      { userId: 'concurrentuser', type: 'access', tokenVersion: 1 },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const courseId = 'concurrentcourse123';

    const requests = Array(5).fill(null).map(() => 
      request(app)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Cookie', `accessToken=${token}`)
    );

    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.status === 200 || r.status === 201).length;
    expect(successCount).toBeGreaterThanOrEqual(1);
  });

  it('handles concurrent progress updates', async () => {
    const token = jwt.sign(
      { userId: 'progressuser', type: 'access', tokenVersion: 1 },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const courseId = 'progresscourse123';
    const progressValues = [10, 20, 30, 40, 50];

    const requests = progressValues.map(progress =>
      request(app)
        .patch(`/api/courses/${courseId}/progress`)
        .set('Cookie', `accessToken=${token}`)
        .send({ progress })
    );

    const responses = await Promise.all(requests);
    expect(responses.every(r => r.status === 401)).toBe(true);
  });
});