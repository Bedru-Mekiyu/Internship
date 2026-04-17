import { Request, Response } from 'express';
import { createDiscussionMessage } from '../src/controllers/discussion.controller';

const discussionSave = jest.fn();

jest.mock('../src/models/Discussion.model', () => {
  const MockDiscussion = jest.fn().mockImplementation((payload) => ({
    ...payload,
    _id: 'discussion-1',
    save: discussionSave,
  }));

  return {
    Discussion: Object.assign(MockDiscussion, {
      findById: jest.fn(),
      find: jest.fn(),
    }),
  };
});

jest.mock('../src/models/Enrollment.model', () => ({
  Enrollment: {
    findOne: jest.fn(),
  },
}));

jest.mock('../src/models/Course.model', () => ({
  Course: {
    findById: jest.fn(),
  },
}));

jest.mock('../src/models/Notification.model', () => ({
  Notification: {
    create: jest.fn(),
  },
}));

const { Discussion } = jest.requireMock('../src/models/Discussion.model') as {
  Discussion: jest.Mock & { findById: jest.Mock; find: jest.Mock };
};
const { Enrollment } = jest.requireMock('../src/models/Enrollment.model') as {
  Enrollment: { findOne: jest.Mock };
};
const { Course } = jest.requireMock('../src/models/Course.model') as {
  Course: { findById: jest.Mock };
};
const { Notification } = jest.requireMock('../src/models/Notification.model') as {
  Notification: { create: jest.Mock };
};

const createResponse = () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return response as unknown as Response;
};

describe('Discussion notification behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    discussionSave.mockResolvedValue(undefined);
  });

  it('notifies instructor when enrolled student posts a discussion message', async () => {
    Course.findById
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          instructor: { toString: () => '507f191e810c19729de860ea' },
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          instructor: '507f191e810c19729de860ea',
          title: 'MERN Mastery',
        }),
      });

    Enrollment.findOne.mockResolvedValue({ _id: 'enrollment-1' });

    Discussion.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: 'discussion-1',
        courseId: 'course-1',
        title: 'Discussion',
        content: 'Hello everyone',
        createdAt: new Date('2026-01-01T10:00:00Z'),
        userId: { _id: '507f191e810c19729de860eb', firstName: 'Student', lastName: 'One' },
      }),
    });

    Notification.create.mockResolvedValue({
      _id: 'notif-disc-1',
      type: 'discussion',
      title: 'New discussion message',
      message: 'A new message was posted in MERN Mastery.',
      isRead: false,
      createdAt: new Date(),
    });

    const request = {
      params: { courseId: 'course-1' },
      body: { content: 'Hello everyone' },
      user: { _id: { toString: () => '507f191e810c19729de860eb' }, role: 'student' },
      app: {
        get: jest.fn().mockReturnValue(null),
      },
    } as unknown as Request;

    const response = createResponse();

    await new Promise<void>((resolve) => {
      createDiscussionMessage(request, response, (error: unknown) => {
        expect(error).toBeUndefined();
        resolve();
      });
      setImmediate(() => resolve());
    });

    expect(Discussion).toHaveBeenCalled();
    expect(discussionSave).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'discussion',
        title: 'New discussion message',
      })
    );
  });
});
