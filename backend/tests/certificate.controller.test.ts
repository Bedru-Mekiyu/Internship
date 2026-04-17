import { Request, Response } from 'express';
import { downloadCertificatePage, generateCourseCertificate, renderCertificatePage } from '../src/controllers/certificate.controller';

const certificateSave = jest.fn();

jest.mock('../src/models/Course.model', () => ({
  Course: {
    findById: jest.fn(),
  },
}));

jest.mock('../src/models/Enrollment.model', () => ({
  Enrollment: {
    findOne: jest.fn(),
  },
}));

jest.mock('../src/models/Certificate.model', () => {
  const MockCertificate = jest.fn().mockImplementation((payload) => ({
    ...payload,
    _id: 'certificate-1',
    save: certificateSave,
    populate: jest.fn().mockResolvedValue(undefined),
  }));

  return {
    Certificate: Object.assign(MockCertificate, {
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
    }),
  };
});

jest.mock('../src/models/Notification.model', () => ({
  Notification: {
    create: jest.fn(),
  },
}));

const { Course } = jest.requireMock('../src/models/Course.model') as {
  Course: { findById: jest.Mock };
};
const { Enrollment } = jest.requireMock('../src/models/Enrollment.model') as {
  Enrollment: { findOne: jest.Mock };
};
const { Certificate } = jest.requireMock('../src/models/Certificate.model') as {
  Certificate: jest.Mock & { findOne: jest.Mock; findById: jest.Mock };
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

describe('Certificate controller notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    certificateSave.mockResolvedValue(undefined);
  });

  it('creates a notification when issuing a new certificate', async () => {
    Course.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'course-1', title: 'MERN Mastery' }),
    });
    Enrollment.findOne.mockResolvedValue({ _id: 'enrollment-1', status: 'completed', progress: 100 });
    Certificate.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });
    Notification.create.mockResolvedValue({
      _id: 'notif-cert-1',
      type: 'system',
      title: 'Certificate issued',
      message: 'Your certificate for MERN Mastery is now available.',
      isRead: false,
      createdAt: new Date(),
    });

    const request = {
      params: { courseId: 'course-1' },
      user: { _id: '507f191e810c19729de860ea', role: 'student' },
      app: { get: jest.fn().mockReturnValue(null) },
    } as unknown as Request;

    const response = createResponse();

    await new Promise<void>((resolve) => {
      generateCourseCertificate(request, response, (error: unknown) => {
        expect(error).toBeUndefined();
        resolve();
      });
      setImmediate(() => resolve());
    });

    expect(Certificate).toHaveBeenCalled();
    expect(certificateSave).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Certificate issued',
        type: 'system',
      })
    );
  });

  it('renders a server-generated certificate preview for the owner', async () => {
    const certificate = {
      _id: 'certificate-1',
      certificateNumber: 'MIT-COURSE-USER-1A2B3C',
      issuedAt: new Date('2026-04-07T00:00:00.000Z'),
      courseId: { title: 'MERN Mastery' },
      userId: { _id: '507f191e810c19729de860ea', firstName: 'Ava', lastName: 'Stone', email: 'ava@example.com' },
      populate: jest.fn().mockResolvedValue(undefined),
    };

    Certificate.findById.mockResolvedValue(certificate);

    const response = {
      status: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    const request = {
      params: { certificateId: 'certificate-1' },
      user: { _id: '507f191e810c19729de860ea', role: 'student' },
      protocol: 'https',
      get: jest.fn().mockReturnValue('learnspace.test'),
    } as unknown as Request;

    await new Promise<void>((resolve) => {
      renderCertificatePage(request, response as unknown as Response, (error: unknown) => {
        expect(error).toBeUndefined();
        resolve();
      });
      setImmediate(() => resolve());
    });

    expect(response.type).toHaveBeenCalledWith('html');
    expect(response.send).toHaveBeenCalledWith(expect.stringContaining('MERN Mastery'));
    expect(response.send).toHaveBeenCalledWith(expect.stringContaining('Ava Stone'));
    expect(response.send).toHaveBeenCalledWith(expect.stringContaining('/api/certificates/verify/certificate-1'));
  });

  it('streams a downloadable server-rendered certificate for the owner', async () => {
    const certificate = {
      _id: 'certificate-2',
      certificateNumber: 'MIT-COURSE-USER-4D5E6F',
      issuedAt: new Date('2026-04-07T00:00:00.000Z'),
      courseId: { title: 'Advanced Node.js' },
      userId: { _id: '507f191e810c19729de860ea', firstName: 'Ava', lastName: 'Stone', email: 'ava@example.com' },
      populate: jest.fn().mockResolvedValue(undefined),
    };

    Certificate.findById.mockResolvedValue(certificate);

    const response = {
      status: jest.fn().mockReturnThis(),
      attachment: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    const request = {
      params: { certificateId: 'certificate-2' },
      user: { _id: '507f191e810c19729de860ea', role: 'student' },
      protocol: 'https',
      get: jest.fn().mockReturnValue('learnspace.test'),
    } as unknown as Request;

    await new Promise<void>((resolve) => {
      downloadCertificatePage(request, response as unknown as Response, (error: unknown) => {
        expect(error).toBeUndefined();
        resolve();
      });
      setImmediate(() => resolve());
    });

    expect(response.attachment).toHaveBeenCalledWith('certificate-MIT-COURSE-USER-4D5E6F.html');
    expect(response.type).toHaveBeenCalledWith('html');
    expect(response.send).toHaveBeenCalledWith(expect.stringContaining('Advanced Node.js'));
  });
});
