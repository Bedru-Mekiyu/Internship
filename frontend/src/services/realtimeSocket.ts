import { io, type Socket } from 'socket.io-client';
import { resolveRealtimeUrl } from '../utils/apiBaseUrl';

export const getRealtimeBaseUrl = () => resolveRealtimeUrl();

/** One-shot authenticated Socket.io client using cookie-based auth only. */
export const createAuthenticatedSocket = (): Socket => {
  return io(getRealtimeBaseUrl(), {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect: false,
  });
};
