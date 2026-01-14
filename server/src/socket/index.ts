import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { getUserRoom, getPartnershipRoom } from '../config/socket.js';
import type { JwtPayload } from '../middleware/auth.js';
import { setupPresenceHandler } from './presenceHandler.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: JwtPayload;
  partnershipId?: string;
}

// Online users map (userId -> socketId)
const onlineUsers = new Map<string, string>();

export function setupSocketHandlers(io: Server): void {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      socket.userId = decoded.userId;
      socket.user = decoded;

      // Get user's partnership
      const partnership = await prisma.partnership.findFirst({
        where: {
          status: 'ACTIVE',
          OR: [{ user1Id: decoded.userId }, { user2Id: decoded.userId }],
        },
      });

      if (partnership) {
        socket.partnershipId = partnership.id;
      }

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const partnershipId = socket.partnershipId;

    console.log(`User connected: ${userId}`);

    // Add to online users
    onlineUsers.set(userId, socket.id);

    // Join personal room
    socket.join(getUserRoom(userId));

    // Join partnership room if has partnership
    if (partnershipId) {
      socket.join(getPartnershipRoom(partnershipId));
    }

    // Update last seen
    await prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });

    // Setup handlers
    setupPresenceHandler(io, socket, onlineUsers);

    // Notify partner that user is online
    if (partnershipId) {
      const partnership = await prisma.partnership.findUnique({
        where: { id: partnershipId },
        select: { user1Id: true, user2Id: true },
      });

      if (partnership) {
        const partnerId = partnership.user1Id === userId
          ? partnership.user2Id
          : partnership.user1Id;

        io.to(getUserRoom(partnerId)).emit('partner:online', {
          userId,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      onlineUsers.delete(userId);

      // Update last seen
      await prisma.user.update({
        where: { id: userId },
        data: { lastSeenAt: new Date() },
      });

      // Notify partner that user went offline
      if (partnershipId) {
        const partnership = await prisma.partnership.findUnique({
          where: { id: partnershipId },
          select: { user1Id: true, user2Id: true },
        });

        if (partnership) {
          const partnerId = partnership.user1Id === userId
            ? partnership.user2Id
            : partnership.user1Id;

          io.to(getUserRoom(partnerId)).emit('partner:offline', {
            userId,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });
  });
}

export function getOnlineUsers(): Map<string, string> {
  return onlineUsers;
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}
