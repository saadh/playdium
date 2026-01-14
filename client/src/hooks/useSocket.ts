import { useEffect, useCallback, useRef } from 'react';
import { getSocket, connectSocket, onSocketEvent, emitWithAck } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';

export function useSocket() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const socketRef = useRef(getSocket());

  useEffect(() => {
    if (isAuthenticated && !socketRef.current?.connected) {
      socketRef.current = connectSocket();
    }

    return () => {
      // Don't disconnect on unmount - let MainLayout handle that
    };
  }, [isAuthenticated]);

  const emit = useCallback(<T>(event: string, data?: unknown): Promise<T> => {
    return emitWithAck<T>(event, data);
  }, []);

  const on = useCallback(<T>(event: string, callback: (data: T) => void): () => void => {
    return onSocketEvent<T>(event, callback);
  }, []);

  const isConnected = socketRef.current?.connected ?? false;

  return { emit, on, isConnected };
}
