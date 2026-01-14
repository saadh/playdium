import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from './env.js';

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
}

// Socket room helpers
export function getUserRoom(userId: string): string {
  return `user:${userId}`;
}

export function getPartnershipRoom(partnershipId: string): string {
  return `partnership:${partnershipId}`;
}

export function getGameRoom(gameType: string, partnershipId: string): string {
  return `game:${gameType}:${partnershipId}`;
}
