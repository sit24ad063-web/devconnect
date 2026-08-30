import { create } from "zustand";
import type { AppNotification } from "@devconnect/shared";

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  setNotifications: (list: AppNotification[]) => void;
  addNotification: (n: AppNotification) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (list) =>
    set({ notifications: list, unreadCount: list.filter((n) => !n.read).length }),
  addNotification: (n) =>
    set({
      notifications: [n, ...get().notifications].slice(0, 30),
      unreadCount: get().unreadCount + 1,
    }),
  markAllRead: () =>
    set({
      notifications: get().notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }),
}));
