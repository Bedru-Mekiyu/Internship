import type { Request, Response } from 'express';
import {
  assignContactMessage,
  createContactMessage,
  getContactMessages,
  updateContactMessageStatus,
} from '../src/controllers/contact.controller';

const waitForAsyncHandlers = async (delayMs = 20) => {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
};

jest.mock('../src/models/ContactMessage.model', () => ({
  ContactMessage: {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
  },
}));

const { ContactMessage } = jest.requireMock('../src/models/ContactMessage.model') as {
  ContactMessage: {
    create: jest.Mock;
    find: jest.Mock;
    countDocuments: jest.Mock;
    findById: jest.Mock;
  };
};

const createResponse = () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return response as unknown as Response;
};

type FindChain = {
  sort: jest.Mock;
  skip: jest.Mock;
  limit: jest.Mock;
  populate: jest.Mock;
};

const createFindChain = (result: unknown[]): FindChain => {
  const chain = {
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    populate: jest.fn(),
  } as unknown as FindChain;
  chain.sort.mockReturnValue(chain);
  chain.skip.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.populate.mockImplementation((path: string) => {
    if (path === 'reviewedBy') {
      return chain;
    }

    return Promise.resolve(result);
  });

  return chain;
};

describe('contact.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a contact message with normalized fields', async () => {
    ContactMessage.create.mockResolvedValue({ _id: '507f191e810c19729de860ea' });

    const request = {
      body: {
        fullName: '  Jane Doe  ',
        email: '  JANE@Example.com ',
        phone: '  +251900000000 ',
        message: '  Need help with enrollment  ',
      },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn();

    createContactMessage(request, response, next);
    await waitForAsyncHandlers();

    expect(next).not.toHaveBeenCalled();
    expect(ContactMessage.create).toHaveBeenCalledWith({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+251900000000',
      message: 'Need help with enrollment',
      status: 'new',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      id: '507f191e810c19729de860ea',
      message: 'Contact message received',
    });
  });

  it('validates required fields for contact creation', async () => {
    const request = {
      body: { email: 'user@example.com', message: 'hello' },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn();

    createContactMessage(request, response, next);
    await waitForAsyncHandlers();

    const error = next.mock.calls[0][0] as { message: string; statusCode: number };
    expect(error).toMatchObject({ message: 'fullName is required', statusCode: 400 });
    expect(ContactMessage.create).not.toHaveBeenCalled();
  });

  it('filters and paginates contact messages', async () => {
    const queryResult = [{ _id: 'm1' }, { _id: 'm2' }];
    const chain = createFindChain(queryResult);
    ContactMessage.find.mockReturnValue(chain);
    ContactMessage.countDocuments.mockResolvedValue(250);

    const request = {
      query: {
        q: 'alice',
        status: 'resolved',
        mine: 'true',
        limit: '500',
        page: '2',
      },
      user: { _id: '507f191e810c19729de860eb' },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn();

    getContactMessages(request, response, next);
    await waitForAsyncHandlers();

    expect(next).not.toHaveBeenCalled();
    expect(ContactMessage.find).toHaveBeenCalledWith({
      status: 'resolved',
      assignedTo: '507f191e810c19729de860eb',
      $or: [
        { fullName: { $regex: 'alice', $options: 'i' } },
        { email: { $regex: 'alice', $options: 'i' } },
        { message: { $regex: 'alice', $options: 'i' } },
      ],
    });
    expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(chain.skip).toHaveBeenCalledWith(100);
    expect(chain.limit).toHaveBeenCalledWith(100);
    expect(chain.populate).toHaveBeenNthCalledWith(1, 'reviewedBy', 'firstName lastName email');
    expect(chain.populate).toHaveBeenNthCalledWith(2, 'assignedTo', 'firstName lastName email');
    expect(response.json).toHaveBeenCalledWith({
      data: queryResult,
      pagination: {
        page: 2,
        limit: 100,
        total: 250,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      },
    });
  });

  it('uses safe defaults when pagination or status values are invalid', async () => {
    const chain = createFindChain([]);
    ContactMessage.find.mockReturnValue(chain);
    ContactMessage.countDocuments.mockResolvedValue(0);

    const request = {
      query: {
        status: 'unknown',
        limit: '0',
        page: '-5',
      },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn();

    getContactMessages(request, response, next);
    await waitForAsyncHandlers();

    expect(next).not.toHaveBeenCalled();
    expect(ContactMessage.find).toHaveBeenCalledWith({});
    expect(chain.skip).toHaveBeenCalledWith(0);
    expect(chain.limit).toHaveBeenCalledWith(20);
    expect(response.json).toHaveBeenCalledWith({
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
  });

  it('caps requested page size at the maximum limit of 100', async () => {
    const chain = createFindChain([]);
    ContactMessage.find.mockReturnValue(chain);
    ContactMessage.countDocuments.mockResolvedValue(0);

    const request = {
      query: {
        limit: '101',
        page: '1',
      },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn();

    getContactMessages(request, response, next);
    await waitForAsyncHandlers();

    expect(next).not.toHaveBeenCalled();
    expect(chain.limit).toHaveBeenCalledWith(100);
  });

  it('rejects invalid ids when updating status', async () => {
    const request = {
      params: { contactMessageId: 'invalid-id' },
      body: { status: 'resolved' },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn();

    updateContactMessageStatus(request, response, next);
    await waitForAsyncHandlers();

    const error = next.mock.calls[0][0] as { message: string; statusCode: number };
    expect(error).toMatchObject({ message: 'Invalid contact message id', statusCode: 400 });
    expect(ContactMessage.findById).not.toHaveBeenCalled();
  });

  it('rejects invalid statuses when updating a contact message', async () => {
    const request = {
      params: { contactMessageId: '507f191e810c19729de860ea' },
      body: { status: 'invalid' },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn();

    updateContactMessageStatus(request, response, next);
    await waitForAsyncHandlers();

    const error = next.mock.calls[0][0] as { message: string; statusCode: number };
    expect(error).toMatchObject({ message: 'Valid status is required', statusCode: 400 });
    expect(ContactMessage.findById).not.toHaveBeenCalled();
  });

  it('returns not found when updating status for missing contact message', async () => {
    ContactMessage.findById.mockResolvedValue(null);

    const request = {
      params: { contactMessageId: '507f191e810c19729de860ea' },
      body: { status: 'resolved' },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn();

    updateContactMessageStatus(request, response, next);
    await waitForAsyncHandlers();

    const error = next.mock.calls[0][0] as { message: string; statusCode: number };
    expect(error).toMatchObject({ message: 'Contact message not found', statusCode: 404 });
  });

  it('updates status, review metadata and trimmed review notes', async () => {
    const document = {
      status: 'new',
      reviewNotes: '',
      reviewedBy: undefined,
      reviewedAt: undefined,
      updatedAt: undefined,
      save: jest.fn().mockResolvedValue(undefined),
      populate: jest.fn().mockResolvedValue(undefined),
    };
    ContactMessage.findById.mockResolvedValue(document);

    const request = {
      params: { contactMessageId: '507f191e810c19729de860ea' },
      body: { status: 'in_progress', reviewNotes: '  investigating now  ' },
      user: { _id: '507f191e810c19729de860eb' },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn();

    updateContactMessageStatus(request, response, next);
    await waitForAsyncHandlers();

    expect(next).not.toHaveBeenCalled();
    expect(document.status).toBe('in_progress');
    expect(document.reviewNotes).toBe('investigating now');
    expect(document.reviewedBy).toBe('507f191e810c19729de860eb');
    expect(document.reviewedAt).toBeInstanceOf(Date);
    expect(document.updatedAt).toBeInstanceOf(Date);
    expect(document.save).toHaveBeenCalledTimes(1);
    expect(document.populate).toHaveBeenNthCalledWith(1, 'reviewedBy', 'firstName lastName email');
    expect(document.populate).toHaveBeenNthCalledWith(2, 'assignedTo', 'firstName lastName email');
    expect(response.json).toHaveBeenCalledWith(document);
  });

  it('rejects invalid assignedTo values when assigning a contact message', async () => {
    ContactMessage.findById.mockResolvedValue({});

    const request = {
      params: { contactMessageId: '507f191e810c19729de860ea' },
      body: { assignedTo: 'bad-id' },
      user: { _id: '507f191e810c19729de860eb' },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn();

    assignContactMessage(request, response, next);
    await waitForAsyncHandlers();

    const error = next.mock.calls[0][0] as { message: string; statusCode: number };
    expect(error).toMatchObject({ message: 'Invalid assignedTo value', statusCode: 400 });
  });

  it('assigns to the authenticated user when assignedTo is omitted', async () => {
    const document = {
      assignedTo: undefined,
      assignedAt: undefined,
      updatedAt: undefined,
      save: jest.fn().mockResolvedValue(undefined),
      populate: jest.fn().mockResolvedValue(undefined),
    };
    ContactMessage.findById.mockResolvedValue(document);

    const request = {
      params: { contactMessageId: '507f191e810c19729de860ea' },
      body: {},
      user: { _id: '507f191e810c19729de860eb' },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn();

    assignContactMessage(request, response, next);
    await waitForAsyncHandlers();

    expect(next).not.toHaveBeenCalled();
    expect(document.assignedTo).toBeDefined();
    expect(String(document.assignedTo)).toBe('507f191e810c19729de860eb');
    expect(document.assignedAt).toBeInstanceOf(Date);
    expect(document.updatedAt).toBeInstanceOf(Date);
    expect(document.save).toHaveBeenCalledTimes(1);
    expect(document.populate).toHaveBeenNthCalledWith(1, 'assignedTo', 'firstName lastName email');
    expect(document.populate).toHaveBeenNthCalledWith(2, 'reviewedBy', 'firstName lastName email');
    expect(response.json).toHaveBeenCalledWith(document);
  });
});
