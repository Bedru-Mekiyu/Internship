import express from 'express';
import dotenv from 'dotenv';
<<<<<<< HEAD
import http from 'http';
import helmet from 'helmet';
import compression from 'compression';
import cors, { CorsOptions } from 'cors';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectDB } from './config/database';
import { getHelmetOptions } from './config/security-headers';
import { User } from './models/User.model';
import { requireEnv } from './utils/env';
import { logInfo, logError } from './utils/logger';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import contentRoutes from './routes/content.routes';
import dashboardRoutes from './routes/dashboard.routes';
import paymentRoutes from './routes/payment.routes';
import discussionRoutes from './routes/discussion.routes';
import assignmentRoutes from './routes/assignment.routes';
import quizRoutes from './routes/quiz.routes';
import certificateRoutes from './routes/certificate.routes';
import liveSessionRoutes from './routes/live-session.routes';
import notificationRoutes from './routes/notification.routes';
import userRoutes from './routes/user.routes';
import contactRoutes from './routes/contact.routes';
import settingsRoutes from './routes/settings.routes';
import { csrfProtection } from './middlewares/csrf.middleware';
import { sanitizeMiddleware } from './middlewares/sanitize.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { requestIdMiddleware } from './middlewares/request-id.middleware';
import { httpLogMiddleware } from './middlewares/http-log.middleware';
import {
  metricsBearerGuard,
  metricsHandler,
  prometheusHttpMiddleware,
} from './middlewares/prometheus.middleware';
import { globalApiRateLimiter } from './middlewares/global-api-rate-limit.middleware';
import { userHasCourseDiscussionAccess } from './utils/course-membership';

dotenv.config({ quiet: true });

const getAllowedOrigins = () => (
  (process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

export const createApp = () => {
  const app = express();

  const allowedOrigins = getAllowedOrigins();

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  };

  app.disable('x-powered-by');
  const trustProxyEnv = process.env.TRUST_PROXY;
  const trustProxy =
    trustProxyEnv === '0' || trustProxyEnv === 'false'
      ? 0
      : Number.parseInt(trustProxyEnv || '1', 10) || 1;
  app.set('trust proxy', trustProxy);

  app.use(requestIdMiddleware);
  app.use(httpLogMiddleware);
  app.use(prometheusHttpMiddleware);
  app.use(compression({ threshold: 1024 }));
  app.use(helmet(getHelmetOptions()));
  app.use(cors(corsOptions));
  app.use(cookieParser());

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(sanitizeMiddleware);
  app.use('/uploads', express.static('uploads'));
  app.use(csrfProtection);

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/readyz', (_req, res) => {
    const mongoOk = mongoose.connection.readyState === 1;
    res.status(mongoOk ? 200 : 503).json({
      status: mongoOk ? 'ready' : 'not_ready',
      mongo: mongoOk ? 'connected' : 'disconnected',
    });
  });

  app.get('/metrics', metricsBearerGuard, metricsHandler);

  app.use('/api', globalApiRateLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/discussions', discussionRoutes);
  app.use('/api/assignments', assignmentRoutes);
  app.use('/api/quizzes', quizRoutes);
  app.use('/api/certificates', certificateRoutes);
  app.use('/api/live-sessions', liveSessionRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/settings', settingsRoutes);
=======
import { connectDB } from './config/database';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import contentRoutes from './routes/content.routes';
import { errorMiddleware } from './middlewares/error.middleware';

dotenv.config({ quiet: true });
export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use('/uploads', express.static('uploads'));

  app.use('/api/auth', authRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/content', contentRoutes);
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede

  app.use(errorMiddleware);

  return app;
};

const app = createApp();

const startServer = async () => {
  try {
    await connectDB();
    const parsedPort = Number(process.env.PORT);
    const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 5000;
<<<<<<< HEAD

    const httpServer = http.createServer(app);
    const allowedOrigins = getAllowedOrigins();

    const io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
      path: '/socket.io',
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
      },
      maxHttpBufferSize: 1e6,
      pingTimeout: 20000,
      pingInterval: 25000,
      transports: ['websocket', 'polling'],
    });

    io.use((socket, next) => {
      const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
      if (userId && typeof userId === 'string') {
        socket.data.userId = userId;
      }
      next();
    });

    const messageRates = new Map<string, { count: number; resetTime: number }>();
    const RATE_LIMIT_WINDOW_MS = 10000;
    const RATE_LIMIT_MAX_MESSAGES = 30;

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
          logError('socket_rate_limit_exceeded', { socketId });
          socket.disconnect(true);
          return next(new Error('Rate limit exceeded'));
        }

        rateData.count++;
        messageRates.set(socketId, rateData);
        next();
      });
    });

    const redisUrl = process.env.REDIS_URL?.trim();
    if (redisUrl) {
      try {
        const { createClient } = await import('redis');
        const { createAdapter } = await import('@socket.io/redis-adapter');
        const pubClient = createClient({ url: redisUrl });
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        logInfo('socket_io_redis_adapter_enabled');
      } catch (error) {
        logInfo('socket_io_redis_adapter_skipped', { error: String(error) });
      }
    }

    const getSocketAccessToken = (cookieHeader: string | undefined) => {
      if (!cookieHeader) {
        return '';
      }

      const cookieEntry = cookieHeader
        .split(';')
        .map((entry) => entry.trim())
        .find((entry) => entry.startsWith('accessToken='));

      if (!cookieEntry) {
        return '';
      }

      return decodeURIComponent(cookieEntry.slice('accessToken='.length));
    };

    io.use(async (socket, next) => {
      try {
        const token = getSocketAccessToken(socket.handshake.headers.cookie);
        if (!token) return next(new Error('Authentication error: No token provided'));

        const accessSecret = requireEnv('JWT_ACCESS_SECRET');
        const decoded = jwt.verify(token, accessSecret) as any;
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

    io.on('connection', (socket) => {
      const user = (socket as any).user;

      socket.on('discussion:join', async (courseId: string) => {
        if (typeof courseId !== 'string' || !courseId.trim()) {
          return;
        }
        const cid = courseId.trim();
        try {
          const allowed = await userHasCourseDiscussionAccess(user, cid);
          if (allowed) {
            socket.join(`course:${cid}`);
          }
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

    app.set('io', io);

    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    const shutdown = async (signal: string) => {
      logInfo('server_shutdown', { signal });
      await new Promise<void>((resolve) => {
        httpServer.close(() => resolve());
      });
      try {
        io.close();
      } catch {
        /* ignore */
      }
      try {
        await mongoose.disconnect();
      } catch {
        /* ignore */
      }
      process.exit(0);
    };

    process.once('SIGTERM', () => void shutdown('SIGTERM'));
    process.once('SIGINT', () => void shutdown('SIGINT'));
=======
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

<<<<<<< HEAD
export default app;
=======
export default app;
>>>>>>> 31387e7bb68b73d2fb420b5f160e50993bcbdede
