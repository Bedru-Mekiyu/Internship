import express from 'express';
import dotenv from 'dotenv';
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

  app.use(errorMiddleware);

  return app;
};

const app = createApp();

const startServer = async () => {
  try {
    await connectDB();
    const parsedPort = Number(process.env.PORT);
    const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export default app;