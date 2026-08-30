import type { Post } from "@devconnect/shared";
import { useState } from "react";
import { Link } from "react-router-dom";
import { usePosts } from "../api/hooks/usePosts";
import { useAuthStore } from "../store/authStore";

export default function Blog() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const { data, isLoading } = usePosts(search ? { search } : {});

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog</h1>
        {user && (
          <Link to="/blog/new" className="btn-primary text-sm">
            + Write Post
          </Link>
        )}
      </div>

      <input
        className="input mt-4"
        placeholder="Search posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading ? (
        <p className="mt-8 text-center text-gray-500">Loading...</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {data?.posts.map((post: Post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="card block hover:border-brand-300">
              <h3 className="font-semibold">{post.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{post.content.replace(/[#*`_>-]/g, "")}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                <span>by {post.author?.name}</span>
                <span>{post.likeCount} likes · {post.commentCount} comments</span>
              </div>
              {post.tags && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {post.tags.split(",").map((t: string) => (
                    <span key={t} className="tag">{t.trim()}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
          {data?.posts.length === 0 && <p className="text-gray-500">No posts found.</p>}
        </div>
      )}
    </div>
  );
}
