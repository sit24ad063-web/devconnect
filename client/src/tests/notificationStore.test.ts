import { describe, it, expect, beforeEach } from "vitest";
import { useNotificationStore } from "../store/notificationStore";
import type { AppNotification } from "@devconnect/shared";

const sample: AppNotification = {
  id: "n1",
  type: "CONNECTION_REQUEST",
  message: "Alice sent you a connection request",
  read: false,
  actorId: "u1",
  createdAt: new Date().toISOString(),
};

describe("notificationStore", () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [], unreadCount: 0 });
  });

  it("adds a notification and increments unread count", () => {
    useNotificationStore.getState().addNotification(sample);
    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.unreadCount).toBe(1);
  });

  it("markAllRead clears unread count and marks every notification read", () => {
    useNotificationStore.getState().addNotification(sample);
    useNotificationStore.getState().addNotification({ ...sample, id: "n2" });
    useNotificationStore.getState().markAllRead();

    const state = useNotificationStore.getState();
    expect(state.unreadCount).toBe(0);
    expect(state.notifications.every((n) => n.read)).toBe(true);
  });

  it("setNotifications derives unreadCount from the read flag", () => {
    useNotificationStore.getState().setNotifications([sample, { ...sample, id: "n2", read: true }]);
    expect(useNotificationStore.getState().unreadCount).toBe(1);
  });
});
