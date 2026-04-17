import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { baseApi } from '../store/api/baseApi';
import { createAuthenticatedSocket } from '../services/realtimeSocket';

/**
 * Subscribes to server `discussion:new` events for a course room and refreshes RTK Query cache.
 */
export const useDiscussionRealtime = (courseId: string | undefined) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!courseId?.trim()) {
      return;
    }

    const socket = createAuthenticatedSocket();
    if (!socket) {
      return;
    }

    const cid = courseId.trim();

    const onNew = () => {
      dispatch(baseApi.util.invalidateTags([{ type: 'Discussion', id: cid }]));
    };

    const onConnect = () => {
      socket.emit('discussion:join', cid);
    };

    socket.on('connect', onConnect);
    socket.on('discussion:new', onNew);
    socket.connect();

    return () => {
      socket.emit('discussion:leave', cid);
      socket.off('discussion:new', onNew);
      socket.off('connect', onConnect);
      socket.disconnect();
    };
  }, [courseId, dispatch]);
};
