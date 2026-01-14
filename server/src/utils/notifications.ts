import { NotificationType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { getIO, getUserRoom } from '../config/socket.js';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
}: CreateNotificationParams) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data || {},
    },
  });

  // Try to send real-time notification
  try {
    const io = getIO();
    io.to(getUserRoom(userId)).emit('notification', {
      id: notification.id,
      type,
      title,
      message,
      data,
      createdAt: notification.createdAt,
    });
  } catch {
    // Socket not initialized, notification will be fetched on next poll
  }

  return notification;
}

export async function markNotificationRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
    },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}
