import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { usePost, useAddComment, useTogglePostLike } from "../api/hooks/usePosts";
import { useAuthStore } from "../store/authStore";
import { apiErrorMessage } from "../api/client";
import MarkdownRenderer from "../components/MarkdownRenderer";
import type { Comment } from "@devconnect/shared";

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const { data, isLoading } = usePost(slug);
  const addComment = useAddComment(slug!);
  const toggleLike = useTogglePostLike(slug!);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");

  if (isLoading) return <p className="py-24 text-center text-gray-500">Loading...</p>;
  if (!data?.post) return <div className="mx-auto max-w-3xl px-4 py-8">Post not found.</div>;

  const post = data.post;

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync({ postId: post.id, content: commentText });
      setCommentText("");
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to add comment"));
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <article>
        <h1 className="text-3xl font-extrabold">{post.title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          by <Link to={`/profile/${post.author?.id}`} className="text-brand-600">{post.author?.name}</Link> ·{" "}
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
        {post.tags && (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.tags.split(",").map((t: string) => (
              <span key={t} className="tag">{t.trim()}</span>
            ))}
          </div>
        )}

        <div className="mt-6">
          <MarkdownRenderer content={post.content} />
        </div>

        <div className="mt-6">
          <button
            className="btn-secondary text-sm"
            onClick={() => toggleLike.mutate(post.id)}
            disabled={!user || toggleLike.isPending}
          >
            ❤ Like ({post.likeCount})
          </button>
        </div>
      </article>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Comments ({post.comments.length})</h2>

        {error && <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        {user ? (
          <form onSubmit={handleComment} className="mt-3 flex flex-col gap-2">
            <textarea
              rows={3}
              className="input"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button className="btn-primary self-start px-4 py-1.5 text-sm" disabled={addComment.isPending}>
              Comment
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-gray-500">
            <Link to="/login" className="text-brand-600">Log in</Link> to comment.
          </p>
        )}

        <div className="mt-4 flex flex-col divide-y divide-gray-100">
          {post.comments.map((c: Comment) => (
            <div key={c.id} className="py-3">
              <p className="text-sm font-semibold">{c.author?.name}</p>
              <p className="text-sm text-gray-700">{c.content}</p>
              <p className="mt-1 text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
