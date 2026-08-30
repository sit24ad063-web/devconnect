import { Link } from "react-router-dom";
import { useDashboard } from "../api/hooks/useConnections";
import { useSendConnectionRequest } from "../api/hooks/useConnections";
import type { DashboardData, Post, PublicUser } from "@devconnect/shared";

type ActivityEntry = DashboardData["activityFeed"][number];

export default function Dashboard() {
  const { data, isLoading } = useDashboard();
  const sendRequest = useSendConnectionRequest();

  if (isLoading || !data) {
    return <div className="py-24 text-center text-gray-500">Loading dashboard...</div>;
  }

  const { stats, activityFeed, connectionSuggestions, trendingPosts } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Connections" value={stats.connectionCount} />
        <StatCard label="Projects" value={stats.projectCount} />
        <StatCard label="Posts" value={stats.postCount} />
        <StatCard label="Endorsements" value={stats.endorsementsReceived} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Activity feed */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold">Activity from your network</h2>
          <div className="mt-3 flex flex-col gap-3">
            {activityFeed.length === 0 && (
              <p className="text-sm text-gray-500">
                Nothing yet — connect with more developers to see their posts and projects here.
              </p>
            )}
            {activityFeed.map((entry: ActivityEntry) =>
              entry.type === "post" ? (
                <Link key={entry.item.id} to={`/blog/${entry.item.slug}`} className="card block hover:border-brand-300">
                  <span className="tag">New post</span>
                  <h3 className="mt-2 font-semibold">{entry.item.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">by {entry.item.author?.name}</p>
                </Link>
              ) : (
                <Link key={entry.item.id} to={`/projects`} className="card block hover:border-brand-300">
                  <span className="tag">New project</span>
                  <h3 className="mt-2 font-semibold">{entry.item.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">by {entry.item.owner?.name}</p>
                </Link>
              )
            )}
          </div>

          <h2 className="mt-8 text-lg font-semibold">Trending posts</h2>
          <div className="mt-3 flex flex-col gap-3">
            {trendingPosts.map((post: Post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="card block hover:border-brand-300">
                <h3 className="font-semibold">{post.title}</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {post.likeCount} likes · {post.commentCount} comments
                </p>
              </Link>
            ))}
            {trendingPosts.length === 0 && <p className="text-sm text-gray-500">No posts yet.</p>}
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <h2 className="text-lg font-semibold">People you may know</h2>
          <div className="mt-3 flex flex-col gap-3">
            {connectionSuggestions.map((u: PublicUser) => (
              <div key={u.id} className="card flex items-center justify-between gap-3">
                <Link to={`/profile/${u.id}`} className="min-w-0">
                  <p className="truncate font-medium">{u.name}</p>
                  <p className="truncate text-xs text-gray-500">{u.headline}</p>
                </Link>
                <button
                  className="btn-primary shrink-0 px-3 py-1.5 text-xs"
                  onClick={() => sendRequest.mutate(u.id)}
                  disabled={sendRequest.isPending}
                >
                  Connect
                </button>
              </div>
            ))}
            {connectionSuggestions.length === 0 && (
              <p className="text-sm text-gray-500">No suggestions right now.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <p className="text-2xl font-bold text-brand-600">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
