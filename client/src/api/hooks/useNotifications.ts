import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { unwrap } from "../client";
import type { AppNotification } from "@devconnect/shared";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => unwrap<{ notifications: AppNotification[] }>(api.get("/notifications")),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap<null>(api.put("/notifications/read-all")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
