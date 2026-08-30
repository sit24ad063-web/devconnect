import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { unwrap } from "../client";
import type { Connection, ConnectionStatus, DashboardData } from "@devconnect/shared";

export function useConnections(status?: ConnectionStatus) {
  return useQuery({
    queryKey: ["connections", status],
    queryFn: () =>
      unwrap<{ connections: Connection[] }>(
        api.get("/connections", { params: status ? { status } : {} })
      ),
  });
}

export function useSendConnectionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (addresseeId: string) =>
      unwrap<{ connection: Connection }>(api.post("/connections", { addresseeId })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });
}

export function useRespondConnectionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" }) =>
      unwrap<{ connection: Connection }>(api.put(`/connections/${id}`, { status })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => unwrap<DashboardData>(api.get("/dashboard")),
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("image", file);
      return unwrap<{ url: string }>(
        api.post("/uploads/image", form, { headers: { "Content-Type": "multipart/form-data" } })
      );
    },
  });
}
