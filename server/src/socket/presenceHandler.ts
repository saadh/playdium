import { Server, Socket } from 'socket.io';
import { prisma } from '../config/database.js';
import { getUserRoom } from '../config/socket.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  partnershipId?: string;
}

export function setupPresenceHandler(
  io: Server,
  socket: AuthenticatedSocket,
  onlineUsers: Map<string, string>
): void {
  const userId = socket.userId!;
  const partnershipId = socket.partnershipId;

  // Get partner's online status
  socket.on('presence:getPartnerStatus', async (callback) => {
    if (!partnershipId) {
      callback({ error: 'No partnership' });
      return;
    }

    try {
      const partnership = await prisma.partnership.findUnique({
        where: { id: partnershipId },
        select: {
          user1Id: true,
          user2Id: true,
          user1: { select: { lastSeenAt: true } },
          user2: { select: { lastSeenAt: true } },
        },
      });

      if (!partnership) {
        callback({ error: 'Partnership not found' });
        return;
      }

      const partnerId = partnership.user1Id === userId
        ? partnership.user2Id
        : partnership.user1Id;

      const partnerLastSeen = partnership.user1Id === userId
        ? partnership.user2.lastSeenAt
        : partnership.user1.lastSeenAt;

      const isOnline = onlineUsers.has(partnerId);

      callback({
        partnerId,
        isOnline,
        lastSeenAt: partnerLastSeen?.toISOString() || null,
      });
    } catch (error) {
      callback({ error: 'Failed to get partner status' });
    }
  });

  // Update activity (heartbeat)
  socket.on('presence:heartbeat', async () => {
    await prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
  });

  // Typing indicator
  socket.on('presence:typing', (data: { context: string; contextId?: string }) => {
    if (!partnershipId) return;

    // Get partner's socket and emit
    prisma.partnership
      .findUnique({
        where: { id: partnershipId },
        select: { user1Id: true, user2Id: true },
      })
      .then((partnership) => {
        if (!partnership) return;

        const partnerId = partnership.user1Id === userId
          ? partnership.user2Id
          : partnership.user1Id;

        io.to(getUserRoom(partnerId)).emit('partner:typing', {
          userId,
          context: data.context,
          contextId: data.contextId,
        });
      });
  });

  // Stop typing indicator
  socket.on('presence:stopTyping', () => {
    if (!partnershipId) return;

    prisma.partnership
      .findUnique({
        where: { id: partnershipId },
        select: { user1Id: true, user2Id: true },
      })
      .then((partnership) => {
        if (!partnership) return;

        const partnerId = partnership.user1Id === userId
          ? partnership.user2Id
          : partnership.user1Id;

        io.to(getUserRoom(partnerId)).emit('partner:stopTyping', { userId });
      });
  });
}
