import { create } from 'zustand';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

interface NotificationActions {
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  (set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async () => {
      set({ isLoading: true });
      try {
        const response = await api.get('/notifications');
        const notifications = response.data.notifications || [];
        set({
          notifications,
          unreadCount: notifications.filter((n: Notification) => !n.isRead).length,
          isLoading: false,
        });
      } catch {
        set({ isLoading: false });
      }
    },

    addNotification: (notification: Notification) => {
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
      }));
    },

    markAsRead: async (notificationId: string) => {
      try {
        await api.patch(`/notifications/${notificationId}/read`);
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      } catch {
        // Ignore error
      }
    },

    markAllAsRead: async () => {
      try {
        await api.patch('/notifications/read-all');
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      } catch {
        // Ignore error
      }
    },

    clearNotifications: () => {
      set({ notifications: [], unreadCount: 0 });
    },
  })
);
