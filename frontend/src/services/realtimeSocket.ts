import { io, type Socket } from 'socket.io-client';
import { resolveRealtimeUrl } from '../utils/apiBaseUrl';
import { getStoredAccessToken } from './api';

export const getRealtimeBaseUrl = () => resolveRealtimeUrl();

/** One-shot authenticated Socket.io client; disconnect when done to avoid stale tokens. */
export const createAuthenticatedSocket = (): Socket | null => {
  const token = getStoredAccessToken();
  if (!token) {
    return null;
  }

  return io(getRealtimeBaseUrl(), {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: { token },
    autoConnect: false,
  });
};
