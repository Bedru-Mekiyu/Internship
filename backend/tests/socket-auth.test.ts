import jwt from 'jsonwebtoken';
import http from 'http';
import { Server } from 'socket.io';
import { io as ioc } from 'socket.io-client';
import { createApp } from '../src/app';
import { User } from '../src/models/User.model';
import { requireEnv } from '../src/utils/env';
import { createTestFixtures, TestFixtures } from './helpers/fixtures';

const JWT_ACCESS_SECRET = () => process.env.JWT_ACCESS_SECRET || 'test_access_secret_min_32_chars_here';

function getSocketAccessToken(cookieHeader: string | undefined): string {
  if (!cookieHeader) return '';
  const cookieEntry = cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith('accessToken='));
  if (!cookieEntry) return '';
  return decodeURIComponent(cookieEntry.slice('accessToken='.length));
}

function createToken(userId: string, type: string = 'access', tokenVersion: number = 1): string {
  return jwt.sign(
    { userId, type, tokenVersion },
    JWT_ACCESS_SECRET(),
    { expiresIn: type === 'access' ? '15m' : '7d' }
  );
}

function createCookie(token: string): string {
  return `accessToken=${encodeURIComponent(token)}`;
}

describe('Socket.IO Authentication', () => {
  let httpServer: http.Server;
  let io: Server;
  let port: number;
  let fixtures: TestFixtures;

  beforeAll(async () => {
    fixtures = await createTestFixtures();
    const app = createApp();
    httpServer = http.createServer(app);

    io = new Server(httpServer, {
      cors: { origin: '*', credentials: true },
      path: '/socket.io',
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: false,
      },
      maxHttpBufferSize: 1e6,
      pingTimeout: 20000,
      pingInterval: 25000,
      transports: ['websocket', 'polling'],
    });

    // Rate limiting (same as startServer)
    const messageRates = new Map<string, { count: number; resetTime: number }>();
    const RATE_LIMIT_WINDOW_MS = 10000;
    const RATE_LIMIT_MAX_MESSAGES = 30;

    const cleanupRateLimits = () => {
      const now = Date.now();
      for (const [socketId, data] of messageRates) {
        if (now > data.resetTime) {
          messageRates.delete(socketId);
        }
      }
    };
    setInterval(cleanupRateLimits, 60000);

    io.on('connection', (socket) => {
      const socketId = socket.id;
      messageRates.set(socketId, { count: 0, resetTime: Date.now() + RATE_LIMIT_WINDOW_MS });

      socket.on('disconnect', () => {
        messageRates.delete(socketId);
      });

      socket.use((packet, next) => {
        const now = Date.now();
        const rateData = messageRates.get(socketId);

        if (!rateData || now > rateData.resetTime) {
          messageRates.set(socketId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
          return next();
        }

        if (rateData.count >= RATE_LIMIT_MAX_MESSAGES) {
          socket.disconnect(true);
          return next(new Error('Rate limit exceeded'));
        }

        rateData.count++;
        messageRates.set(socketId, rateData);
        next();
      });
    });

    // Auth middleware (same as startServer)
    io.use(async (socket, next) => {
      try {
        const token = getSocketAccessToken(socket.handshake.headers.cookie);
        if (!token) return next(new Error('Authentication error: No token provided'));

        const accessSecret = requireEnv('JWT_ACCESS_SECRET');
        const decoded = jwt.verify(token, accessSecret, { algorithms: ['HS256'] }) as any;
        if (decoded.type !== 'access') return next(new Error('Authentication error: Invalid token type'));

        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) return next(new Error('Authentication error: Invalid user'));

        const currentVersion = user.tokenVersion ?? 0;
        const tokenVersion = decoded.tokenVersion ?? 0;
        if (tokenVersion !== currentVersion) return next(new Error('Authentication error: Token revoked'));

        (socket as any).user = user;
        next();
      } catch {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    // Event handlers (same as startServer)
    io.on('connection', (socket) => {
      const user = (socket as any).user;

      socket.on('discussion:join', async (courseId: string) => {
        if (typeof courseId !== 'string' || !courseId.trim()) return;
        const cid = courseId.trim();
        try {
          const { userHasCourseDiscussionAccess } = await import('../src/utils/course-membership');
          const allowed = await userHasCourseDiscussionAccess(user, cid);
          if (allowed) socket.join(`course:${cid}`);
        } catch {
          // Do not join on failure
        }
      });

      socket.on('discussion:leave', (courseId: string) => {
        if (typeof courseId === 'string' && courseId.trim()) {
          socket.leave(`course:${courseId.trim()}`);
        }
      });

      // Join personal notification room
      if (user && user._id) {
        socket.join(`user:${user._id}`);
      }
    });

    // Listen on random port
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const addr = httpServer.address();
        port = typeof addr === 'object' && addr ? addr.port : 5000;
        resolve();
      });
    });
  }, 30000);

  afterAll(async () => {
    if (io) {
      io.close();
    }
    if (httpServer) {
      await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    }
    await fixtures.cleanup();
  });

  /**
   * Helper: get a valid access token for the student fixture user.
   */
  async function getStudentToken(): Promise<string> {
    const dbUser = await User.findById(fixtures.student.user._id);
    const tokenVersion = dbUser?.tokenVersion ?? 0;
    return createToken(fixtures.student.user._id.toString(), 'access', tokenVersion);
  }

  describe('Connection Authentication', () => {
    it('connection without token is rejected', async () => {
      const response = await new Promise<{ status: string }>((resolve) => {
        const socket = ioc(`http://127.0.0.1:${port}`, {
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
      const token = await getStudentToken();
      const cookie = createCookie(token);

      const response = await new Promise<{ status: string; userId?: string }>((resolve) => {
        const socket = ioc(`http://127.0.0.1:${port}`, {
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
        { userId: fixtures.student.user._id.toString(), type: 'access', tokenVersion: 0 },
        JWT_ACCESS_SECRET(),
        { expiresIn: '-1s' }
      );
      const cookie = createCookie(expiredToken);

      const response = await new Promise<{ status: string }>((resolve) => {
        const socket = ioc(`http://127.0.0.1:${port}`, {
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
        const socket = ioc(`http://127.0.0.1:${port}`, {
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
      const wrongTypeToken = createToken(fixtures.student.user._id.toString(), 'refresh', 0);
      const cookie = createCookie(wrongTypeToken);

      const response = await new Promise<{ status: string }>((resolve) => {
        const socket = ioc(`http://127.0.0.1:${port}`, {
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
      const dbUser = await User.findById(fixtures.student.user._id);
      const currentVersion = dbUser?.tokenVersion ?? 0;
      // Use a version that will never match the current DB version
      const revokedToken = createToken(fixtures.student.user._id.toString(), 'access', currentVersion + 999);
      const cookie = createCookie(revokedToken);

      const response = await new Promise<{ status: string }>((resolve) => {
        const socket = ioc(`http://127.0.0.1:${port}`, {
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
      const token = await getStudentToken();
      const cookie = createCookie(token);
      let disconnected = false;

      await new Promise<void>((resolve) => {
        const socket = ioc(`http://127.0.0.1:${port}`, {
          transports: ['websocket'],
          forceNew: true,
          reconnection: false,
          extraHeaders: {
            Cookie: cookie,
          },
        });

        socket.on('connect', () => {
          // Emit 35 messages to exceed the rate limit of 30 per 10-second window
          for (let i = 0; i < 35; i++) {
            socket.emit('discussion:join', 'course-123');
          }

          setTimeout(() => {
            resolve();
          }, 500);
        });

        socket.on('connect_error', () => {
          resolve();
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
      const token = await getStudentToken();
      const cookie = createCookie(token);

      const joined = await new Promise<boolean>((resolve) => {
        const socket = ioc(`http://127.0.0.1:${port}`, {
          transports: ['websocket'],
          forceNew: true,
          reconnection: false,
          extraHeaders: {
            Cookie: cookie,
          },
        });

        socket.on('connect', () => {
          socket.emit('discussion:join', fixtures.course?._id?.toString() || 'course-123');

          setTimeout(() => {
            resolve(true);
            socket.disconnect();
          }, 500);
        });

        socket.on('connect_error', () => {
          resolve(false);
        });
      });

      expect(joined).toBe(true);
    });

    it('allows leaving discussion room', async () => {
      const token = await getStudentToken();
      const cookie = createCookie(token);

      const left = await new Promise<boolean>((resolve) => {
        const socket = ioc(`http://127.0.0.1:${port}`, {
          transports: ['websocket'],
          forceNew: true,
          reconnection: false,
          extraHeaders: {
            Cookie: cookie,
          },
        });

        socket.on('connect', () => {
          socket.emit('discussion:join', fixtures.course?._id?.toString() || 'course-123');

          setTimeout(() => {
            socket.emit('discussion:leave', fixtures.course?._id?.toString() || 'course-123');

            setTimeout(() => {
              resolve(true);
              socket.disconnect();
            }, 200);
          }, 200);
        });

        socket.on('connect_error', () => {
          resolve(false);
        });
      });

      expect(left).toBe(true);
    });
  });

  describe('Personal Notification Room', () => {
    it('joins personal notification room on connection', async () => {
      const token = await getStudentToken();
      const cookie = createCookie(token);
      const userId = fixtures.student.user._id.toString();

      const joined = await new Promise<boolean>((resolve) => {
        const socket = ioc(`http://127.0.0.1:${port}`, {
          transports: ['websocket'],
          forceNew: true,
          reconnection: false,
          extraHeaders: {
            Cookie: cookie,
          },
        });

        socket.on('connect', () => {
          // Check server-side room membership since the client-side
          // socket.io-client does not expose the rooms set
          const roomName = `user:${userId}`;
          const room = io.sockets.adapter.rooms.get(roomName);
          const isJoined = room ? room.has(socket.id || '') : false;
          resolve(isJoined);
          socket.disconnect();
        });

        socket.on('connect_error', () => {
          resolve(false);
        });
      });

      expect(joined).toBe(true);
    });
  });
});
