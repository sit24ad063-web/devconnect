import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProject } from "../api/hooks/useProjects";
import { useUploadImage } from "../api/hooks/useConnections";
import { apiErrorMessage } from "../api/client";

export default function ProjectForm() {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const uploadImage = useUploadImage();
  const [form, setForm] = useState({
    title: "",
    description: "",
    repoUrl: "",
    demoUrl: "",
    imageUrl: "",
    techStack: "",
    featured: false,
  });
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage.mutateAsync(file);
      update("imageUrl", url);
    } catch (err) {
      setError(apiErrorMessage(err, "Image upload failed"));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createProject.mutateAsync(form);
      navigate("/projects");
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to create project"));
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold">New Project</h1>
      <form onSubmit={handleSubmit} className="card mt-4 flex flex-col">
        {error && <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <label className="label">Title</label>
        <input required className="input" value={form.title} onChange={(e) => update("title", e.target.value)} />

        <label className="label">Description</label>
        <textarea required rows={4} className="input" value={form.description} onChange={(e) => update("description", e.target.value)} />

        <label className="label">Tech stack (comma separated)</label>
        <input placeholder="React, Node.js, PostgreSQL" className="input" value={form.techStack} onChange={(e) => update("techStack", e.target.value)} />

        <label className="label">Repository URL</label>
        <input className="input" value={form.repoUrl} onChange={(e) => update("repoUrl", e.target.value)} />

        <label className="label">Live demo URL</label>
        <input className="input" value={form.demoUrl} onChange={(e) => update("demoUrl", e.target.value)} />

        <label className="label">Cover image (max 2MB, uploaded to Cloudinary)</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
        {uploadImage.isPending && <p className="mt-1 text-xs text-gray-400">Uploading...</p>}
        {form.imageUrl && <img src={form.imageUrl} alt="preview" className="mt-2 h-32 rounded-lg object-cover" />}

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
          Feature this project on the dashboard
        </label>

        <button className="btn-primary mt-6" disabled={createProject.isPending}>
          {createProject.isPending ? "Saving..." : "Create Project"}
        </button>
      </form>
    </div>
  );
}
