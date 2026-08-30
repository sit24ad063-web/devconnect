import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { unwrap } from "../client";
import type { Project } from "@devconnect/shared";

export function useProjects(params: { userId?: string; featured?: boolean } = {}) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => unwrap<{ projects: Project[] }>(api.get("/projects", { params })),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Project>) =>
      unwrap<{ project: Project }>(api.post("/projects", payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unwrap<null>(api.delete(`/projects/${id}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}
