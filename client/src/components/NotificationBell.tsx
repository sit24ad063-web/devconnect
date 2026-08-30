import { useState } from "react";
import { useNotificationStore } from "../store/notificationStore";
import { useMarkAllNotificationsRead } from "../api/hooks/useNotifications";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead } = useNotificationStore();
  const markAllReadApi = useMarkAllNotificationsRead();

  function handleOpen() {
    setOpen((o) => !o);
    if (unreadCount > 0) {
      markAllRead();
      markAllReadApi.mutate();
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-4 py-2 font-semibold">Notifications</div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-500">No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <div key={n.id} className="border-b border-gray-50 px-4 py-3 text-sm last:border-0">
                <p>{n.message}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
