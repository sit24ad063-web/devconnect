import { Link } from "react-router-dom";
import { useProjects } from "../api/hooks/useProjects";
import { useAuthStore } from "../store/authStore";
import type { Project } from "@devconnect/shared";

export default function Projects() {
  const { user } = useAuthStore();
  const { data, isLoading } = useProjects();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        {user && (
          <Link to="/projects/new" className="btn-primary text-sm">
            + New Project
          </Link>
        )}
      </div>

      {isLoading ? (
        <p className="mt-8 text-center text-gray-500">Loading...</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.projects.map((p: Project) => (
            <div key={p.id} className="card">
              {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="mb-3 rounded-lg" />}
              <h3 className="font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{p.description}</p>
              {p.techStack && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.techStack.split(",").map((t: string) => (
                    <span key={t} className="tag">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex gap-3 text-sm">
                {p.repoUrl && (
                  <a href={p.repoUrl} target="_blank" rel="noreferrer" className="text-brand-600">
                    Code
                  </a>
                )}
                {p.demoUrl && (
                  <a href={p.demoUrl} target="_blank" rel="noreferrer" className="text-brand-600">
                    Demo
                  </a>
                )}
              </div>
              {p.owner && (
                <Link to={`/profile/${p.owner.id}`} className="mt-2 block text-xs text-gray-400">
                  by {p.owner.name}
                </Link>
              )}
            </div>
          ))}
          {data?.projects.length === 0 && <p className="text-gray-500">No projects yet.</p>}
        </div>
      )}
    </div>
  );
}
