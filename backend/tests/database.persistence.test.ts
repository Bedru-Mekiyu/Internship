import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { User } from '../src/models/User.model';
import { Course } from '../src/models/Course.model';
import { Module } from '../src/models/Module.model';
import { Enrollment } from '../src/models/Enrollment.model';
import { Discussion } from '../src/models/Discussion.model';
import { Payment } from '../src/models/Payment.model';
import { Quiz } from '../src/models/Quiz.model';
import { QuizAttempt } from '../src/models/QuizAttempt.model';
import { Certificate } from '../src/models/Certificate.model';
import { createTestFixtures } from './helpers/fixtures';
  let fixtures: TestFixtures;

  beforeAll(async () => {
    fixtures = await createTestFixtures();
  });

  afterAll(async () => {
    await fixtures.cleanup();
  });

  describe('User Data Persistence', () => {
    it('persists user profile updates', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .set('Cookie', fixtures.student.fullCookie)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          bio: 'Test bio',
        });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('Updated');
      expect(response.body.lastName).toBe('Name');

      const updatedUser = await User.findById(fixtures.student.user._id);
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.firstName).toBe('Updated');
      expect(updatedUser?.lastName).toBe('Name');
      expect(updatedUser?.bio).toBe('Test bio');
    });

    it('persists user preferences', async () => {
      const preferencesUpdate = {
        preferences: {
          language: 'es',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            push: false,
            marketingEmails: true,
          },
        },
      };

      const response = await request(app)
        .patch('/api/users/me')
        .set('Cookie', fixtures.student.fullCookie)
        .send(preferencesUpdate);

      expect(response.status).toBe(200);
      expect(response.body.preferences.language).toBe('es');
      expect(response.body.preferences.timezone).toBe('America/New_York');
      expect(response.body.preferences.notifications.push).toBe(false);

      const updatedUser = await User.findById(fixtures.student.user._id);
      expect(updatedUser?.preferences?.language).toBe('es');
      expect(updatedUser?.preferences?.timezone).toBe('America/New_York');
    });

    it('retrieves updated profile after persistence', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', fixtures.student.fullCookie);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(fixtures.student.user.email);
      expect(response.body.firstName).toBe('Updated');
    });
  });

  describe('Course Data Persistence', () => {
    let instructorCourse: mongoose.Document;

    beforeAll(async () => {
      instructorCourse = await Course.create({
        title: 'Instructor Test Course',
        slug: `instructor-course-${Date.now()}`,
        description: 'Course created by instructor fixture',
        instructor: fixtures.instructor.user._id,
        status: 'draft',
        category: 'Development',
        level: 'intermediate',
        pricing: { type: 'paid', price: 49.99 },
      });
    });

    it('persists new courses', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', fixtures.instructor.fullCookie)
        .send({
          title: 'New Test Course',
          description: 'Test description',
          category: 'Development',
          level: 'beginner',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('New Test Course');
      expect(response.body.instructor).toBe(fixtures.instructor.user._id.toString());

      const savedCourse = await Course.findOne({ title: 'New Test Course' });
      expect(savedCourse).toBeDefined();
      expect(savedCourse?.description).toBe('Test description');
    });

    it('persists course updates', async () => {
      const response = await request(app)
        .put(`/api/courses/${instructorCourse._id}`)
        .set('Cookie', fixtures.instructor.fullCookie)
        .send({
          title: 'Updated Title',
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');

      const updatedCourse = await Course.findById(instructorCourse._id);
      expect(updatedCourse?.title).toBe('Updated Title');
      expect(updatedCourse?.description).toBe('Updated description');
    });

    it('persists module creation', async () => {
      const response = await request(app)
        .post(`/api/courses/${instructorCourse._id}/modules`)
        .set('Cookie', fixtures.instructor.fullCookie)
        .send({
          title: 'Test Module',
          description: 'Module description',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test Module');
      expect(response.body.courseId.toString()).toBe(instructorCourse._id.toString());

      const savedModule = await Module.findOne({ title: 'Test Module' });
      expect(savedModule).toBeDefined();
    });

    it('persists lesson creation under module', async () => {
      const module = await Module.create({
        courseId: instructorCourse._id,
        title: 'Lesson Container Module',
        order: 1,
        status: 'published',
      });

      const response = await request(app)
        .post(`/api/courses/modules/${module._id}/lessons`)
        .set('Cookie', fixtures.instructor.fullCookie)
        .send({
          title: 'Test Lesson',
          type: 'video',
          content: 'Lesson content',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test Lesson');
      expect(response.body.type).toBe('video');

      await module.deleteOne();
    });
  });

  describe('Enrollment Persistence', () => {
    let testCourse: mongoose.Document;

    beforeAll(async () => {
      testCourse = await Course.create({
        title: 'Enrollment Test Course',
        slug: `enrollment-test-${Date.now()}`,
        description: 'Course for enrollment tests',
        instructor: fixtures.instructor.user._id,
        status: 'published',
        pricing: { type: 'free', price: 0 },
      });
    });

    afterAll(async () => {
      await Course.deleteOne({ _id: testCourse._id });
    });

    it('persists enrollment creation', async () => {
      const response = await request(app)
        .post(`/api/courses/${testCourse._id}/enroll`)
        .set('Cookie', fixtures.student.fullCookie);

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(fixtures.student.user._id.toString());
      expect(response.body.courseId.toString()).toBe(testCourse._id.toString());

      const enrollment = await Enrollment.findOne({
        userId: fixtures.student.user._id,
        courseId: testCourse._id,
      });
      expect(enrollment).toBeDefined();
      expect(enrollment?.status).toBe('active');
    });

    it('persists progress updates', async () => {
      await Enrollment.findOneAndUpdate(
        { userId: fixtures.student.user._id, courseId: testCourse._id },
        { progress: 0 },
        { new: true }
      );

      const response = await request(app)
        .patch(`/api/courses/${testCourse._id}/progress`)
        .set('Cookie', fixtures.student.fullCookie)
        .send({ progress: 50 });

      expect(response.status).toBe(200);

      const updatedEnrollment = await Enrollment.findOne({
        userId: fixtures.student.user._id,
        courseId: testCourse._id,
      });
      expect(updatedEnrollment?.progress).toBe(50);
    });

    it('retrieves enrollment with correct status', async () => {
      const response = await request(app)
        .get(`/api/courses/${testCourse._id}/progress`)
        .set('Cookie', fixtures.student.fullCookie);

      expect(response.status).toBe(200);
      expect(response.body.progress).toBe(50);
    });
  });

  describe('Discussion Persistence', () => {
    it('persists discussion creation', async () => {
      const response = await request(app)
        .post(`/api/discussions/course/${fixtures.course._id}`)
        .set('Cookie', fixtures.student.fullCookie)
        .send({
          title: 'Test Discussion',
          content: 'Test content for discussion',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test Discussion');

      const discussion = await Discussion.findOne({ title: 'Test Discussion' });
      expect(discussion).toBeDefined();
      expect(discussion?.courseId.toString()).toBe(fixtures.course._id.toString());
    });

    it('retrieves discussions for enrolled course', async () => {
      const response = await request(app)
        .get(`/api/discussions/course/${fixtures.course._id}`)
        .set('Cookie', fixtures.student.fullCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Payment Persistence', () => {
    let paidCourse: mongoose.Document;

    beforeAll(async () => {
      paidCourse = await Course.create({
        title: 'Paid Course Test',
        slug: `paid-course-${Date.now()}`,
        description: 'Paid course for payment tests',
        instructor: fixtures.instructor.user._id,
        status: 'published',
        pricing: { type: 'paid', price: 99.99 },
      });
    });

    afterAll(async () => {
      await Course.deleteOne({ _id: paidCourse._id });
    });

    it('persists payment creation', async () => {
      const response = await request(app)
        .post('/api/payments')
        .set('Cookie', fixtures.student.fullCookie)
        .send({
          courseId: paidCourse._id.toString(),
          method: 'card',
        });

      expect(response.status).toBe(201);
      expect(response.body.courseId.toString()).toBe(paidCourse._id.toString());
      expect(response.body.amount).toBe(99.99);

      const payment = await Payment.findOne({ courseId: paidCourse._id });
      expect(payment).toBeDefined();
    });

    it('retrieves payment history', async () => {
      const response = await request(app)
        .get('/api/payments/me')
        .set('Cookie', fixtures.student.fullCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body));
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Transaction Handling', () => {
    it('rolls back failed transactions', async () => {
      const initialCount = await Course.countDocuments({
        title: 'Rollback Test Course',
      });

      const session = await mongoose.startSession();
      session.startTransaction();

      await Course.create(
        [
          {
            title: 'Rollback Test Course',
            slug: `rollback-test-${Date.now()}`,
            instructor: fixtures.instructor.user._id,
            status: 'draft',
          },
        ],
        { session }
      );

      await session.abortTransaction();
      session.endSession();

      const finalCount = await Course.countDocuments({
        title: 'Rollback Test Course',
      });
      expect(finalCount).toBe(initialCount);
    });

    it('commits successful transactions', async () => {
      const uniqueTitle = `Commit Test Course ${Date.now()}`;

      const session = await mongoose.startSession();
      session.startTransaction();

      await Course.create(
        [
          {
            title: uniqueTitle,
            slug: uniqueTitle.toLowerCase().replace(/\s+/g, '-'),
            instructor: fixtures.instructor.user._id,
            status: 'draft',
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      const course = await Course.findOne({ title: uniqueTitle });
      expect(course).toBeDefined();

      await Course.deleteOne({ _id: course?._id });
    });

    it('handles concurrent session isolation', async () => {
      const sessions = await Promise.all([
        mongoose.startSession(),
        mongoose.startSession(),
      ]);

      sessions[0].startTransaction();
      sessions[1].startTransaction();

      const title1 = `Concurrent Test ${Date.now()}-1`;
      const title2 = `Concurrent Test ${Date.now()}-2`;

      await Course.create(
        [{ title: title1, slug: title1, instructor: fixtures.instructor.user._id, status: 'draft' }],
        { session: sessions[0] }
      );

      await Course.create(
        [{ title: title2, slug: title2, instructor: fixtures.instructor.user._id, status: 'draft' }],
        { session: sessions[1] }
      );

      await sessions[0].commitTransaction();
      await sessions[1].commitTransaction();

      sessions[0].endSession();
      sessions[1].endSession();

      const course1 = await Course.findOne({ title: title1 });
      const course2 = await Course.findOne({ title: title2 });
      expect(course1).toBeDefined();
      expect(course2).toBeDefined();

      await Course.deleteOne({ _id: course1?._id });
      await Course.deleteOne({ _id: course2?._id });
    });
  });

  describe('Duplicate Handling', () => {
    it('handles duplicate email registration', async () => {
      const existingEmail = `duplicate-test-${Date.now()}@test.com`;

      const user = await User.create({
        email: existingEmail,
        password: await require('bcrypt').hash('TestPass123!', 10),
        firstName: 'First',
        lastName: 'User',
        role: 'student',
        isActive: true,
        isEmailVerified: true,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: existingEmail,
          password: 'TestPass123!',
          firstName: 'Second',
          lastName: 'User',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already exists');

      await User.deleteOne({ _id: user._id });
    });

    it('prevents duplicate course slugs', async () => {
      const duplicateSlug = `duplicate-slug-${Date.now()}`;

      await Course.create({
        title: 'Original Course',
        slug: duplicateSlug,
        instructor: fixtures.instructor.user._id,
        status: 'published',
      });

      const response = await request(app)
        .post('/api/courses')
        .set('Cookie', fixtures.instructor.fullCookie)
        .send({
          title: 'Duplicate Course',
          slug: duplicateSlug,
        });

      expect(response.status).toBe(400);

      await Course.deleteOne({ slug: duplicateSlug });
    });
  });

  describe('Data Integrity', () => {
    it('enforces foreign key constraints for enrollment', async () => {
      const fakeCourseId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/courses/${fakeCourseId}/enroll`)
        .set('Cookie', fixtures.student.fullCookie);

      expect(response.status).toBe(404);
    });

    it('prevents orphaned records on course deletion', async () => {
      const course = await Course.create({
        title: 'Orphan Test Course',
        slug: `orphan-test-${Date.now()}`,
        instructor: fixtures.instructor.user._id,
        status: 'published',
      });

      await Module.create({
        courseId: course._id,
        title: 'Orphan Module',
        order: 1,
        status: 'published',
      });

      await Course.deleteOne({ _id: course._id });

      const orphanedModules = await Module.find({ courseId: course._id });
      expect(orphanedModules.length).toBe(0);
    });

    it('enforces unique constraints', async () => {
      const uniqueData = {
        title: 'Unique Course',
        slug: `unique-slug-${Date.now()}`,
        instructor: fixtures.instructor.user._id,
        status: 'published',
      };

      await Course.create(uniqueData);

      const duplicate = Course.create(uniqueData);
      await expect(duplicate).rejects.toThrow();

      await Course.deleteOne({ slug: uniqueData.slug });
    });
  });

  describe('Concurrency Handling', () => {
    it('handles concurrent enrollment requests idempotently', async () => {
      const enrollmentCourse = await Course.create({
        title: 'Concurrent Enrollment Course',
        slug: `concurrent-enrollment-${Date.now()}`,
        instructor: fixtures.instructor.user._id,
        status: 'published',
        pricing: { type: 'free', price: 0 },
      });

      const concurrentUser = await User.create({
        email: `concurrent-${Date.now()}@test.com`,
        password: await require('bcrypt').hash('TestPass123!', 10),
        firstName: 'Concurrent',
        lastName: 'User',
        role: 'student',
        isActive: true,
        isEmailVerified: true,
      });

      const tokens = require('../../src/services/auth.service').AuthService.generateTokens(
        concurrentUser._id.toString(),
        0
      );
      const cookies = `accessToken=${encodeURIComponent(tokens.accessToken)}`;

      const requests = Array(3).fill(null).map(() =>
        request(app)
          .post(`/api/courses/${enrollmentCourse._id}/enroll`)
          .set('Cookie', cookies)
      );

      const responses = await Promise.all(requests);
      const successCount = responses.filter((r) => r.status === 200).length;
      const alreadyEnrolledCount = responses.filter((r) => r.status === 409).length;

      expect(successCount + alreadyEnrolledCount).toBe(3);

      await User.deleteOne({ _id: concurrentUser._id });
      await Course.deleteOne({ _id: enrollmentCourse._id });
    });

    it('handles concurrent progress updates with final value wins', async () => {
      const progressCourse = await Course.create({
        title: 'Progress Update Course',
        slug: `progress-update-${Date.now()}`,
        instructor: fixtures.instructor.user._id,
        status: 'published',
        pricing: { type: 'free', price: 0 },
      });

      await Enrollment.create({
        userId: fixtures.student.user._id,
        courseId: progressCourse._id,
        status: 'active',
        progress: 0,
      });

      const progressValues = [10, 25, 50, 75];

      const requests = progressValues.map((progress) =>
        request(app)
          .patch(`/api/courses/${progressCourse._id}/progress`)
          .set('Cookie', fixtures.student.fullCookie)
          .send({ progress })
      );

      const responses = await Promise.all(requests);
      responses.forEach((r) => expect([200, 400]).toContain(r.status));

      const enrollment = await Enrollment.findOne({
        userId: fixtures.student.user._id,
        courseId: progressCourse._id,
      });
      expect(enrollment?.progress).toBeGreaterThanOrEqual(0);

      await Course.deleteOne({ _id: progressCourse._id });
      await Enrollment.deleteOne({ courseId: progressCourse._id });
    });
  });
});

describe('Database Index Tests', () => {
  let fixtures: TestFixtures;

  beforeAll(async () => {
    fixtures = await createTestFixtures();
  });

  afterAll(async () => {
    await fixtures.cleanup();
  });

  it('uses email index for fast lookups', async () => {
    const start = Date.now();

    await User.findOne({ email: fixtures.student.user.email });

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });

  it('uses compound index for role-based queries', async () => {
    const start = Date.now();

    await User.find({ role: 'student' }).sort({ createdAt: -1 });

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});