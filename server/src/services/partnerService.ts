import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateInviteCode } from '../utils/generateCode.js';
import { createNotification } from '../utils/notifications.js';

const INVITE_EXPIRY_DAYS = 7;

export async function createInvite(userId: string) {
  // Check if user already has an active partnership
  const existingPartnership = await prisma.partnership.findFirst({
    where: {
      status: 'ACTIVE',
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
  });

  if (existingPartnership) {
    throw new AppError(400, 'You already have an active partnership');
  }

  // Check if user has a pending invite
  const existingInvite = await prisma.inviteCode.findFirst({
    where: {
      createdById: userId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (existingInvite) {
    return { code: existingInvite.code, expiresAt: existingInvite.expiresAt };
  }

  // Generate new invite code
  let code: string;
  let attempts = 0;
  do {
    code = generateInviteCode();
    const exists = await prisma.inviteCode.findUnique({ where: { code } });
    if (!exists) break;
    attempts++;
  } while (attempts < 10);

  if (attempts >= 10) {
    throw new AppError(500, 'Failed to generate unique invite code');
  }

  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const invite = await prisma.inviteCode.create({
    data: {
      code,
      createdById: userId,
      expiresAt,
    },
  });

  return { code: invite.code, expiresAt: invite.expiresAt };
}

export async function joinWithInvite(userId: string, inviteCode: string) {
  // Find the invite
  const invite = await prisma.inviteCode.findUnique({
    where: { code: inviteCode.toUpperCase() },
    include: {
      createdBy: {
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!invite) {
    throw new AppError(404, 'Invalid invite code');
  }

  if (invite.usedAt) {
    throw new AppError(400, 'This invite code has already been used');
  }

  if (invite.expiresAt < new Date()) {
    throw new AppError(400, 'This invite code has expired');
  }

  if (invite.createdById === userId) {
    throw new AppError(400, 'You cannot join your own invite');
  }

  // Check if user already has an active partnership
  const existingPartnership = await prisma.partnership.findFirst({
    where: {
      status: 'ACTIVE',
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
  });

  if (existingPartnership) {
    throw new AppError(400, 'You already have an active partnership');
  }

  // Create partnership
  const partnership = await prisma.$transaction(async (tx) => {
    // Mark invite as used
    await tx.inviteCode.update({
      where: { id: invite.id },
      data: {
        usedById: userId,
        usedAt: new Date(),
      },
    });

    // Create partnership
    const newPartnership = await tx.partnership.create({
      data: {
        user1Id: invite.createdById,
        user2Id: userId,
        inviteCode: invite.code,
        status: 'ACTIVE',
        acceptedAt: new Date(),
      },
      include: {
        user1: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
        user2: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create shared garden for the partnership
    await tx.sharedGarden.create({
      data: {
        partnershipId: newPartnership.id,
      },
    });

    // Create treasure map for the partnership
    await tx.treasureMap.create({
      data: {
        partnershipId: newPartnership.id,
      },
    });

    // Create doodle gallery for the partnership
    await tx.doodleGallery.create({
      data: {
        partnershipId: newPartnership.id,
      },
    });

    return newPartnership;
  });

  // Get the joiner's info for notification
  const joiner = await prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true },
  });

  // Notify the invite creator
  await createNotification({
    userId: invite.createdById,
    type: 'PARTNER_JOINED',
    title: 'New Partner!',
    message: `${joiner?.displayName} has joined as your partner!`,
    data: { partnershipId: partnership.id },
  });

  return partnership;
}

export async function getCurrentPartnership(userId: string) {
  const partnership = await prisma.partnership.findFirst({
    where: {
      status: 'ACTIVE',
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: {
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
          lastSeenAt: true,
        },
      },
      user2: {
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
          lastSeenAt: true,
        },
      },
      sharedGarden: {
        select: {
          id: true,
          name: true,
          gardenLevel: true,
          totalPlants: true,
        },
      },
      treasureMap: {
        select: {
          id: true,
          currentWorld: true,
          totalTreasures: true,
        },
      },
      doodleGallery: {
        select: {
          id: true,
          drawingIds: true,
        },
      },
      _count: {
        select: {
          sharedAchievements: true,
          activityFeed: true,
        },
      },
    },
  });

  if (!partnership) {
    return null;
  }

  // Determine partner based on current user
  const partner = partnership.user1Id === userId ? partnership.user2 : partnership.user1;

  return {
    id: partnership.id,
    partner,
    createdAt: partnership.createdAt,
    acceptedAt: partnership.acceptedAt,
    sharedGarden: partnership.sharedGarden,
    treasureMap: partnership.treasureMap,
    doodleGallery: partnership.doodleGallery,
    stats: {
      sharedAchievements: partnership._count.sharedAchievements,
      activityFeedItems: partnership._count.activityFeed,
    },
  };
}

export async function getActivityFeed(
  partnershipId: string,
  limit = 20,
  cursor?: string
) {
  const items = await prisma.activityFeedItem.findMany({
    where: {
      partnershipId,
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
  });

  const hasMore = items.length > limit;
  const feedItems = hasMore ? items.slice(0, -1) : items;

  return {
    items: feedItems,
    nextCursor: hasMore ? feedItems[feedItems.length - 1].createdAt.toISOString() : null,
  };
}

export async function createActivityFeedItem(
  partnershipId: string,
  userId: string,
  type: 'GAME_PLAYED' | 'GIFT_SENT' | 'ACHIEVEMENT_UNLOCKED' | 'ITEM_CREATED' | 'MESSAGE_SENT' | 'DISCOVERY_MADE',
  title: string,
  description: string,
  game?: string,
  data?: Record<string, unknown>
) {
  return prisma.activityFeedItem.create({
    data: {
      partnershipId,
      userId,
      type,
      title,
      description,
      game,
      data: data || {},
    },
  });
}
