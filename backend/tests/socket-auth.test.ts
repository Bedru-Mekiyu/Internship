import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { createApp } from '../src/app';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';

function createToken(userId: string, type: string = 'access', tokenVersion: number = 1): string {
  return jwt.sign(
    { userId, type, tokenVersion },
    JWT_SECRET,
    { expiresIn: type === 'access' ? '15m' : '7d' }
  );
}

function createCookie(token: string): string {
  return `accessToken=${encodeURIComponent(token)}`;
}

describe('Socket.IO Authentication', () => {
  let io: Server;
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    app = createApp();
    io = app.get('io');
  });

  afterAll(() => {
    if (io) {
      io.close();
    }
  });

  describe('Connection Authentication', () => {
    it('connection without token is rejected', async () => {
      const response = await new Promise<{ status: string }>((resolve) => {
        const socket = require('socket.io-client').connect('http://127.0.0.1:5000', {
          transports: ['websocket'],
          forceNew: true,
          reconnection: false,
        });

        socket.on('connect', () => {
          resolve({ status: 'connected' });
          socket.disconnect();
        });

        socket.on('connect_error', (err: Error) => {
          resolve({ status: err.message });
          socket.disconnect();
        });

        setTimeout(() => resolve({ status: 'timeout' }), 5000);
      });

      expect(response.status).not.toBe('connected');
    });

    it('connection with valid token is accepted', async () => {
      const token = createToken('user-student-id', 'access', 1);
      const cookie = createCookie(token);

      const response = await new Promise<{ status: string; userId?: string }>((resolve) => {
        const socket = require('socket.io-client').connect('http://127.0.0.1:5000', {
          transports: ['websocket'],
          forceNew: true,
          reconnection: false,
          extraHeaders: {
            Cookie: cookie,
          },
        });

        socket.on('connect', () => {
          resolve({ status: 'connected', userId: socket.id });
          socket.disconnect();
        });

        socket.on('connect_error', (err: Error) => {
          resolve({ status: err.message });
          socket.disconnect();
        });

        setTimeout(() => resolve({ status: 'timeout' }), 5000);
      });

      expect(response.status).toBe('connected');
    });

    it('connection with expired token is rejected', async () => {
      const expiredToken = jwt.sign(
        { userId: 'user-student-id', type: 'access', tokenVersion: 1 },
        JWT_SECRET,
        { expiresIn: '-1s' }
      );
      const cookie = createCookie(expiredToken);

      const response = await new Promise<{ status: string }>((resolve) => {
        const socket = require('socket.io-client').connect('http://127.0.0.1:5000', {
          transports: ['websocket'],
          forceNew: true,
          reconnection: false,
          extraHeaders: {
            Cookie: cookie,
          },
        });

        socket.on('connect', () => {
          resolve({ status: 'connected' });
          socket.disconnect();
        });

        socket.on('connect_error', (err: Error) => {
          resolve({ status: err.message });
          socket.disconnect();
        });

        setTimeout(() => resolve({ status: 'timeout' }), 5000);
      });

      expect(response.status).not.toBe('connected');
    });

    it('connection with invalid token format is rejected', async () => {
      const cookie = createCookie('not-a-valid-jwt');

      const response = await new Promise<{ status: string }>((resolve) => {
        const socket = require('socket.io-client').connect('http://127.0.0.1:5000', {
          transports: ['websocket'],
          forceNew: true,
          reconnection: false,
          extraHeaders: {
            Cookie: cookie,
          },
        });

        socket.on('connect', () => {
          resolve({ status: 'connected' });
          socket.disconnect();
        });

        socket.on('connect_error', (err: Error) => {
          resolve({ status: err.message });
          socket.disconnect();
        });

        setTimeout(() => resolve({ status: 'timeout' }), 5000);
      });

      expect(response.status).not.toBe('connected');
    });

    it('connection with wrong token type (refresh as access) is rejected', async () => {
      const wrongTypeToken = createToken('user-student-id', 'refresh', 1);
      const cookie = createCookie(wrongTypeToken);

      const response = await new Promise<{ status: string }>((resolve) => {
        const socket = require('socket.io-client').connect('http://127.0.0.1:5000', {
          transports: ['websocket'],
          forceNew: true,
          reconnection: false,
          extraHeaders: {
            Cookie: cookie,
          },
        });

        socket.on('connect', () => {
          resolve({ status: 'connected' });
          socket.disconnect();
        });

        socket.on('connect_error', (err: Error) => {
          resolve({ status: err.message });
          socket.disconnect();
        });

        setTimeout(() => resolve({ status: 'timeout' }), 5000);
      });

      expect(response.status).not.toBe('connected');
    });

    it('connection with revoked token version is rejected', async () => {
      const revokedToken = createToken('user-student-id', 'access', 999);
      const cookie = createCookie(revokedToken);

      const response = await new Promise<{ status: string }>((resolve) => {
        const socket = require('socket.io-client').connect('http://127.0.0.1:5000', {
          transports: ['websocket'],
          forceNew: true,
          reconnection: false,
          extraHeaders: {
            Cookie: cookie,
          },
        });

        socket.on('connect', () => {
          resolve({ status: 'connected' });
          socket.disconnect();
        });

        socket.on('connect_error', (err: Error) => {
          resolve({ status: err.message });
          socket.disconnect();
        });

        setTimeout(() => resolve({ status: 'timeout' }), 5000);
      });

      expect(response.status).not.toBe('connected');
    });
  });

  describe('Socket Rate Limiting', () => {
    it('disconnects when rate limit is exceeded', async () => {
      let disconnected = false;

      await new Promise<void>((resolve) => {
        const socket = require('socket.io-client').connect('http://127.0.0.1:5000', {
          transports: ['websocket'],
          forceNew: true,
        });

        socket.on('connect', () => {
          for (let i = 0; i < 35; i++) {
            socket.emit('discussion:join', 'course-123');
          }

          setTimeout(() => {
            resolve();
          }, 500);
        });

        socket.on('disconnect', () => {
          disconnected = true;
        });
      });

      expect(disconnected).toBe(true);
    });
  });

  describe('Room Management', () => {
    it('allows joining discussion room', async () => {
      const token = createToken('user-student-id');
      const cookie = createCookie(token);

      const joined = await new Promise<boolean>((resolve) => {
        const socket = require('socket.io-client').connect('http://127.0.0.1:5000', {
          transports: ['websocket'],
          forceNew: true,
          extraHeaders: {
            Cookie: cookie,
          },
        });

        socket.on('connect', () => {
          socket.emit('discussion:join', 'course-123');

          setTimeout(() => {
            const rooms = socket.rooms;
            resolve(rooms.has('course:course-123'));
            socket.disconnect();
          }, 200);
        });
      });

      expect(joined).toBe(true);
    });

    it('allows leaving discussion room', async () => {
      const token = createToken('user-student-id');
      const cookie = createCookie(token);

      const left = await new Promise<boolean>((resolve) => {
        const socket = require('socket.io-client').connect('http://127.0.0.1:5000', {
          transports: ['websocket'],
          forceNew: true,
          extraHeaders: {
            Cookie: cookie,
          },
        });

        socket.on('connect', () => {
          socket.emit('discussion:join', 'course-123');

          setTimeout(() => {
            socket.emit('discussion:leave', 'course-123');

            setTimeout(() => {
              const rooms = socket.rooms;
              resolve(!rooms.has('course:course-123'));
              socket.disconnect();
            }, 200);
          }, 200);
        });
      });

      expect(left).toBe(true);
    });
  });

  describe('Personal Notification Room', () => {
    it('joins personal notification room on connection', async () => {
      const token = createToken('user-student-id');
      const cookie = createCookie(token);

      const joined = await new Promise<boolean>((resolve) => {
        const socket = require('socket.io-client').connect('http://127.0.0.1:5000', {
          transports: ['websocket'],
          forceNew: true,
          extraHeaders: {
            Cookie: cookie,
          },
        });

        socket.on('connect', () => {
          setTimeout(() => {
            const rooms = socket.rooms;
            resolve(rooms.has('user:user-student-id'));
            socket.disconnect();
          }, 200);
        });
      });

      expect(joined).toBe(true);
    });
  });
});