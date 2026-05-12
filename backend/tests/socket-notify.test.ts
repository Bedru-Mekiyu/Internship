import { describe, expect, it, jest } from '@jest/globals';
import type { Application } from 'express';
import { emitToUser } from '../src/utils/socket-notify';

describe('emitToUser', () => {
  it('returns early when userId is empty', () => {
    const get = jest.fn();
    const app = { get } as unknown as Application;

    emitToUser(app, '', 'notification', { ok: true });

    expect(get).not.toHaveBeenCalled();
  });

  it('does nothing when io is not configured', () => {
    const get = jest.fn().mockReturnValue(undefined);
    const app = { get } as unknown as Application;

    emitToUser(app, 'user-1', 'notification', { ok: true });

    expect(get).toHaveBeenCalledWith('io');
  });

  it('emits payload to user room when io is available', () => {
    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    const get = jest.fn().mockReturnValue({ to });
    const app = { get } as unknown as Application;
    const payload = { id: 'n-1' };

    emitToUser(app, 'user-1', 'notification', payload);

    expect(get).toHaveBeenCalledWith('io');
    expect(to).toHaveBeenCalledWith('user:user-1');
    expect(emit).toHaveBeenCalledWith('notification', payload);
  });

  it('swallows runtime errors from socket access', () => {
    const app = {
      get: jest.fn(() => {
        throw new Error('socket unavailable');
      }),
    } as unknown as Application;

    expect(() => emitToUser(app, 'user-1', 'notification', { ok: true })).not.toThrow();
  });
});
