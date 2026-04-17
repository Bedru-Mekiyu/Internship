import { Request, Response } from 'express';
import {
  createLiveSession,
  updateLiveSessionStatus,
} from '../src/controllers/live-session.controller';

const saveMock = jest.fn();

jest.mock('../src/models/Course.model', () => ({
  Course: {
    findById: jest.fn(),
  },
}));

jest.mock('../src/models/Enrollment.model', () => ({
  Enrollment: {
    find: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../src/models/LiveSession.model', () => ({
  LiveSession: jest.fn().mockImplementation((payload) => ({
    ...payload,
    _id: 'session-1',
    save: saveMock,
  })),
}));

jest.mock('../src/models/Notification.model', () => ({
  Notification: {
    insertMany: jest.fn(),
  },
}));

const { Course } = jest.requireMock('../src/models/Course.model') as {
  Course: { findById: jest.Mock };
};
const { Enrollment } = jest.requireMock('../src/models/Enrollment.model') as {
  Enrollment: { find: jest.Mock; findOne: jest.Mock };
};
const { LiveSession } = jest.requireMock('../src/models/LiveSession.model') as {
  LiveSession: jest.Mock;
};
const { Notification } = jest.requireMock('../src/models/Notification.model') as {
  Notification: { insertMany: jest.Mock };
};

const createResponse = () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return response as unknown as Response;
};

describe('Live session controller notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    saveMock.mockResolvedValue(undefined);
  });

  it('creates notifications for enrolled students when live session is scheduled', async () => {
    Course.findById.mockResolvedValue({
      _id: 'course-1',
      instructor: { toString: () => 'instructor-1' },
    });

    Enrollment.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { userId: '507f191e810c19729de860ea' },
          { userId: '507f191e810c19729de860eb' },
        ]),
      }),
    });

    const request = {
      params: { courseId: 'course-1' },
      body: {
        title: 'Office Hours',
        description: 'Weekly help session',
        meetingUrl: 'https://meet.example.com/office-hours',
        provider: 'custom',
        startsAt: new Date(Date.now() + 60_000).toISOString(),
      },
      user: { _id: { toString: () => 'instructor-1' }, role: 'instructor' },
    } as unknown as Request;

    const response = createResponse();

    await new Promise<void>((resolve) => {
      createLiveSession(request, response, (error: unknown) => {
        expect(error).toBeUndefined();
        resolve();
      });
      setImmediate(() => resolve());
    });

    expect(LiveSession).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalled();
    expect(Notification.insertMany).toHaveBeenCalledTimes(1);
  });

  it('creates notifications when live session status changes to cancelled', async () => {
    const sessionSave = jest.fn().mockResolvedValue(undefined);
    const session = {
      _id: 'session-1',
      courseId: 'course-1',
      title: 'Office Hours',
      status: 'scheduled',
      save: sessionSave,
    };

    (LiveSession as any).findById = jest.fn().mockResolvedValue(session);

    Course.findById.mockResolvedValue({
      _id: 'course-1',
      instructor: { toString: () => 'instructor-1' },
    });

    Enrollment.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ userId: '507f191e810c19729de860ea' }]),
      }),
    });

    const request = {
      params: { sessionId: 'session-1' },
      body: { status: 'cancelled' },
      user: { _id: { toString: () => 'instructor-1' }, role: 'instructor' },
    } as unknown as Request;

    const response = createResponse();

    await new Promise<void>((resolve) => {
      updateLiveSessionStatus(request, response, (error: unknown) => {
        expect(error).toBeUndefined();
        resolve();
      });
      setImmediate(() => resolve());
    });

    expect(sessionSave).toHaveBeenCalled();
    expect(Notification.insertMany).toHaveBeenCalledTimes(1);
  });
});
