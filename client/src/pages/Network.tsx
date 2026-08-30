import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useConnections, useRespondConnectionRequest } from "../api/hooks/useConnections";
import type { Connection } from "@devconnect/shared";

export default function Network() {
  const { user } = useAuthStore();
  const { data, isLoading } = useConnections();
  const respond = useRespondConnectionRequest();

  if (isLoading || !data) return <p className="py-24 text-center text-gray-500">Loading...</p>;
  if (!user) return null;

  const pendingReceived = data.connections.filter(
    (c: Connection) => c.status === "PENDING" && c.addresseeId === user.id
  );
  const accepted = data.connections.filter((c: Connection) => c.status === "ACCEPTED");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">Network</h1>

      {pendingReceived.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Connection Requests</h2>
          <div className="mt-3 flex flex-col gap-2">
            {pendingReceived.map((c) => (
              <div key={c.id} className="card flex items-center justify-between">
                <div>
                  <Link to={`/profile/${c.requester?.id}`} className="font-medium">
                    {c.requester?.name}
                  </Link>
                  <p className="text-xs text-gray-500">{c.requester?.headline}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn-primary px-3 py-1.5 text-xs"
                    onClick={() => respond.mutate({ id: c.id, status: "ACCEPTED" })}
                  >
                    Accept
                  </button>
                  <button
                    className="btn-secondary px-3 py-1.5 text-xs"
                    onClick={() => respond.mutate({ id: c.id, status: "DECLINED" })}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Your Connections ({accepted.length})</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {accepted.map((c: Connection) => {
            const other = c.requesterId === user.id ? c.addressee : c.requester;
            return (
              <Link key={c.id} to={`/profile/${other?.id}`} className="card flex items-center gap-3 hover:border-brand-300">
                <img
                  src={other?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${other?.name}`}
                  alt={other?.name}
                  className="h-10 w-10 rounded-full"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium">{other?.name}</p>
                  <p className="truncate text-xs text-gray-500">{other?.headline}</p>
                </div>
              </Link>
            );
          })}
          {accepted.length === 0 && (
            <p className="text-sm text-gray-500">
              No connections yet — head to <Link to="/search" className="text-brand-600">Discover</Link> to find developers.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
