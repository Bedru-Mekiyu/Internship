import type { Request, Response } from 'express';
import { deleteMedia, getMedia } from '../src/controllers/content.controller';

jest.mock('fs/promises', () => ({
  rm: jest.fn().mockResolvedValue(undefined),
}));

type MockMediaRecord = {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: Date;
};

let mediaRecords: MockMediaRecord[] = [];

jest.mock('../src/models/Media.model', () => ({
  Media: {
    find: jest.fn(() => ({
      sort: jest.fn().mockImplementation(async () => [...mediaRecords]),
    })),
    findById: jest.fn((id: string) => Promise.resolve(mediaRecords.find((item) => item._id === id) || null)),
    deleteOne: jest.fn(({ _id }: { _id: string }) => {
      const initialLength = mediaRecords.length;
      mediaRecords = mediaRecords.filter((item) => item._id !== _id);
      return Promise.resolve({ deletedCount: initialLength - mediaRecords.length });
    }),
  },
}));

const { Media } = jest.requireMock('../src/models/Media.model') as {
  Media: {
    find: jest.Mock;
    findById: jest.Mock;
    deleteOne: jest.Mock;
  };
};

const createResponse = () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return response as unknown as Response;
};

const flushAsync = async (delayMs = 20) => {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
};

describe('Content controller media deletion persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STORAGE_TYPE = 'local';
    mediaRecords = [
      {
        _id: '507f191e810c19729de860ea',
        filename: 'old-file.jpg',
        originalName: 'old-file.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        url: '/uploads/old-file.jpg',
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
      },
      {
        _id: '507f191e810c19729de860eb',
        filename: 'new-file.jpg',
        originalName: 'new-file.jpg',
        mimetype: 'image/jpeg',
        size: 2048,
        url: '/uploads/new-file.jpg',
        createdAt: new Date('2026-01-02T10:00:00.000Z'),
      },
    ];
  });

  it('deletes media permanently and excludes it from subsequent reads', async () => {
    const deleteResponse = createResponse();
    const deleteNext = jest.fn();
    const deleteRequest = {
      params: { id: '507f191e810c19729de860ea' },
    } as unknown as Request;

    deleteMedia(deleteRequest, deleteResponse, deleteNext);
    await flushAsync();

    expect(deleteNext).not.toHaveBeenCalled();
    expect(Media.deleteOne).toHaveBeenCalledWith({ _id: '507f191e810c19729de860ea' });
    expect(deleteResponse.json).toHaveBeenCalledWith({
      message: 'Media deleted',
      id: '507f191e810c19729de860ea',
    });

    const listResponse = createResponse();
    const listNext = jest.fn();
    const listRequest = {} as Request;
    getMedia(listRequest, listResponse, listNext);
    await flushAsync();

    expect(listNext).not.toHaveBeenCalled();

    const returnedMedia = (listResponse.json as jest.Mock).mock.calls[0][0] as MockMediaRecord[];
    expect(returnedMedia.map((item) => item._id)).toEqual(['507f191e810c19729de860eb']);
    expect(mediaRecords.map((item) => item._id)).toEqual(['507f191e810c19729de860eb']);
  });

  it('rejects invalid media ids before attempting deletion', async () => {
    const response = createResponse();
    const next = jest.fn();
    const request = {
      params: { id: 'not-a-valid-id' },
    } as unknown as Request;

    deleteMedia(request, response, next);
    await flushAsync();

    const error = next.mock.calls[0][0] as { message: string; statusCode: number };
    expect(error).toMatchObject({ message: 'Invalid media id', statusCode: 400 });
    expect(Media.findById).not.toHaveBeenCalled();
    expect(Media.deleteOne).not.toHaveBeenCalled();
  });

  it('handles concurrent delete attempts without restoring removed records', async () => {
    let deleted = false;
    Media.deleteOne.mockImplementation(async ({ _id }: { _id: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      if (deleted) {
        return { deletedCount: 0 };
      }
      deleted = true;
      mediaRecords = mediaRecords.filter((item) => item._id !== _id);
      return { deletedCount: 1 };
    });

    const firstResponse = createResponse();
    const secondResponse = createResponse();
    const firstNext = jest.fn();
    const secondNext = jest.fn();
    const firstRequest = { params: { id: '507f191e810c19729de860ea' } } as unknown as Request;
    const secondRequest = { params: { id: '507f191e810c19729de860ea' } } as unknown as Request;

    deleteMedia(firstRequest, firstResponse, firstNext);
    deleteMedia(secondRequest, secondResponse, secondNext);
    await flushAsync(50);

    const errors = [firstNext, secondNext]
      .map((next) => next.mock.calls[0]?.[0])
      .filter(Boolean) as Array<{ message: string; statusCode: number }>;
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ message: 'Media not found', statusCode: 404 });
    expect(mediaRecords.map((item) => item._id)).toEqual(['507f191e810c19729de860eb']);
  });
});
