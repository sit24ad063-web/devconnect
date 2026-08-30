import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { unwrap } from "../client";
import type { Post, Comment } from "@devconnect/shared";

export function usePosts(params: { search?: string; tag?: string; authorId?: string } = {}) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => unwrap<{ posts: Post[] }>(api.get("/posts", { params })),
  });
}

export function usePost(slug: string | undefined) {
  return useQuery({
    queryKey: ["posts", slug],
    queryFn: () =>
      unwrap<{ post: Post & { comments: Comment[] } }>(api.get(`/posts/${slug}`)),
    enabled: Boolean(slug),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; content: string; tags?: string; coverImage?: string }) =>
      unwrap<{ post: Post }>(api.post("/posts", payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useAddComment(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      unwrap<{ comment: Comment }>(api.post(`/posts/${postId}/comments`, { content })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts", slug] }),
  });
}

export function useTogglePostLike(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      unwrap<{ liked: boolean }>(api.post(`/posts/${postId}/like`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts", slug] }),
  });
}
