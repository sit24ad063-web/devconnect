import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { unwrap } from "../client";
import type { PaginatedResult, PublicUser, Project, Post, UserSkill } from "@devconnect/shared";

export interface UserSearchParams {
  search?: string;
  skill?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}

export function useUserSearch(params: UserSearchParams) {
  return useQuery({
    queryKey: ["users", "search", params],
    queryFn: () =>
      unwrap<PaginatedResult<PublicUser>>(api.get("/users", { params })),
    placeholderData: (prev) => prev,
  });
}

export function useUserProfile(id: string | undefined) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () =>
      unwrap<{ user: PublicUser & { projects: Project[]; posts: Post[] } }>(
        api.get(`/users/${id}`)
      ),
    enabled: Boolean(id),
  });
}

export function useUserSkills(userId: string | undefined) {
  return useQuery({
    queryKey: ["users", userId, "skills"],
    queryFn: () => unwrap<{ skills: UserSkill[] }>(api.get(`/users/${userId}/skills`)),
    enabled: Boolean(userId),
  });
}

export function useAddSkill(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      unwrap<{ skill: UserSkill }>(api.post("/users/me/skills", { name })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users", userId, "skills"] }),
  });
}

export function useRemoveSkill(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userSkillId: string) =>
      unwrap<null>(api.delete(`/users/me/skills/${userSkillId}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users", userId, "skills"] }),
  });
}

export function useEndorseSkill(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userSkillId: string) =>
      unwrap<{ skill: UserSkill }>(api.post(`/skills/${userSkillId}/endorse`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users", userId, "skills"] }),
  });
}

export function useUnendorseSkill(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userSkillId: string) =>
      unwrap<null>(api.delete(`/skills/${userSkillId}/endorse`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users", userId, "skills"] }),
  });
}
