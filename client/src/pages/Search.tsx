import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserSearch } from "../api/hooks/useUsers";
import type { PublicUser } from "@devconnect/shared";

export default function Search() {
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useUserSearch({ search, skill, location, page, pageSize: 9 });

  function resetToFirstPage() {
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Discover Developers</h1>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          className="input"
          placeholder="Search by name or headline..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetToFirstPage();
          }}
        />
        <input
          className="input"
          placeholder="Filter by skill (e.g. React)"
          value={skill}
          onChange={(e) => {
            setSkill(e.target.value);
            resetToFirstPage();
          }}
        />
        <input
          className="input"
          placeholder="Filter by location"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            resetToFirstPage();
          }}
        />
      </div>

      {isLoading ? (
        <p className="mt-8 text-center text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.items.map((u: PublicUser) => (
              <Link key={u.id} to={`/profile/${u.id}`} className="card block hover:border-brand-300">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                    alt={u.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{u.name}</p>
                    <p className="truncate text-xs text-gray-500">{u.headline}</p>
                  </div>
                </div>
                {u.location && <p className="mt-2 text-xs text-gray-400">📍 {u.location}</p>}
              </Link>
            ))}
            {data?.items.length === 0 && <p className="text-gray-500">No developers found.</p>}
          </div>

          {data && data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <button
                className="btn-secondary px-3 py-1.5"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="text-gray-500">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                className="btn-secondary px-3 py-1.5"
                disabled={page >= data.totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
