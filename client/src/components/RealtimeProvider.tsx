import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { useNotifications } from "../api/hooks/useNotifications";
import type { AppNotification } from "@devconnect/shared";

/**
 * Mounted once near the root. Connects the Socket.io client whenever a
 * user is logged in, pushes incoming "notification" events into the
 * Zustand notification store, and disconnects on logout.
 */
export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const { data } = useNotifications();

  useEffect(() => {
    if (data?.notifications) setNotifications(data.notifications);
  }, [data, setNotifications]);

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();
    const handler = (notification: AppNotification) => addNotification(notification);
    socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
    };
  }, [user, addNotification]);

  return <>{children}</>;
}
