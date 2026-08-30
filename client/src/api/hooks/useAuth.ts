import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { unwrap } from "../client";
import type { PublicUser } from "@devconnect/shared";

export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => unwrap<{ user: PublicUser }>(api.get("/auth/me")),
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      unwrap<{ user: PublicUser }>(api.post("/auth/login", payload)),
    onSuccess: (data) => qc.setQueryData(["auth", "me"], { user: data.user }),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      password: string;
      headline?: string;
    }) => unwrap<{ user: PublicUser }>(api.post("/auth/register", payload)),
    onSuccess: (data) => qc.setQueryData(["auth", "me"], { user: data.user }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap<null>(api.post("/auth/logout")),
    onSuccess: () => qc.setQueryData(["auth", "me"], { user: null }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<PublicUser>) =>
      unwrap<{ user: PublicUser }>(api.put("/users/me/profile", payload)),
    onSuccess: (data) => {
      qc.setQueryData(["auth", "me"], { user: data.user });
      qc.invalidateQueries({ queryKey: ["users", data.user.id] });
    },
  });
}
