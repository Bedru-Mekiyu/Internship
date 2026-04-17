import type { Application } from 'express';
import type { Server } from 'socket.io';

export const emitToUser = (app: Application, userId: string, event: string, payload: unknown) => {
  if (!userId) {
    return;
  }

  try {
    const io = app.get('io') as Server | undefined;
    if (io && typeof io.to === 'function') {
      io.to(`user:${userId}`).emit(event, payload);
    }
  } catch {
    // Socket.io optional at runtime (e.g. some tests omit HTTP server).
  }
};
