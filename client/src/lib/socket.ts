import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): Socket {
  if (socket?.connected) {
    return socket;
  }

  const token = useAuthStore.getState().accessToken;

  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Reconnect with new token after refresh
export function reconnectSocket(): void {
  disconnectSocket();
  connectSocket();
}

// Emit with callback promise wrapper
export function emitWithAck<T>(event: string, data?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket not connected'));
      return;
    }

    socket.emit(event, data, (response: T | { error: string }) => {
      if (response && typeof response === 'object' && 'error' in response) {
        reject(new Error(response.error));
      } else {
        resolve(response as T);
      }
    });
  });
}

// Type-safe event listener
export function onSocketEvent<T>(event: string, callback: (data: T) => void): () => void {
  if (!socket) {
    console.warn('Socket not connected, cannot add listener');
    return () => {};
  }

  socket.on(event, callback);

  return () => {
    socket?.off(event, callback);
  };
}
