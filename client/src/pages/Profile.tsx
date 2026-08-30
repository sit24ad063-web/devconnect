import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useUserProfile, useUserSkills, useAddSkill, useRemoveSkill, useEndorseSkill, useUnendorseSkill } from "../api/hooks/useUsers";
import { useUpdateProfile } from "../api/hooks/useAuth";
import { useUploadImage } from "../api/hooks/useConnections";
import { useAuthStore } from "../store/authStore";
import { apiErrorMessage } from "../api/client";
import type { PublicUser, Project, Post, UserSkill } from "@devconnect/shared";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const { data, isLoading } = useUserProfile(id);
  const { data: skillsData } = useUserSkills(id);
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadImage();
  const addSkill = useAddSkill(id!);
  const removeSkill = useRemoveSkill(id!);
  const endorseSkill = useEndorseSkill(id!);
  const unendorseSkill = useUnendorseSkill(id!);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<PublicUser>>({});
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState("");

  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    if (data?.user) setForm(data.user);
    setEditing(false);
  }, [data]);

  if (isLoading || !data?.user) return <p className="py-24 text-center text-gray-500">Loading...</p>;

  const profile = data.user;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadImage.mutateAsync(file);
      await updateProfile.mutateAsync({ avatarUrl: url });
    } catch (err) {
      setError(apiErrorMessage(err, "Avatar upload failed"));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await updateProfile.mutateAsync(form);
      setEditing(false);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to update profile"));
    }
  }

  async function handleAddSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!newSkill.trim()) return;
    try {
      await addSkill.mutateAsync(newSkill.trim());
      setNewSkill("");
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to add skill"));
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="card flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="relative">
          <img
            src={profile.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`}
            alt={profile.name}
            className="h-24 w-24 rounded-full object-cover"
          />
          {isOwnProfile && (
            <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-brand-600 px-2 py-1 text-xs text-white">
              ✎
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{profile.name}</h1>
          <p className="text-sm text-gray-500">{profile.headline}</p>
          {profile.location && <p className="text-xs text-gray-400">📍 {profile.location}</p>}
        </div>
        {isOwnProfile && !editing && (
          <button className="btn-secondary text-sm" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {error && <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {editing ? (
        <form onSubmit={handleSave} className="card mt-4 flex flex-col">
          <label className="label">Name</label>
          <input className="input" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <label className="label">Headline</label>
          <input className="input" value={form.headline || ""} onChange={(e) => setForm({ ...form, headline: e.target.value })} />

          <label className="label">Bio</label>
          <textarea rows={4} className="input" value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} />

          <label className="label">Location</label>
          <input className="input" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />

          <label className="label">GitHub URL</label>
          <input className="input" value={form.githubUrl || ""} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />

          <label className="label">LinkedIn URL</label>
          <input className="input" value={form.linkedinUrl || ""} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />

          <label className="label">Website URL</label>
          <input className="input" value={form.websiteUrl || ""} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />

          <div className="mt-6 flex gap-3">
            <button className="btn-primary flex-1" disabled={updateProfile.isPending}>Save</button>
            <button type="button" className="btn-secondary flex-1" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          {profile.bio && <p className="mt-4 text-gray-700">{profile.bio}</p>}
          <div className="mt-2 flex gap-4 text-sm">
            {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-brand-600">GitHub</a>}
            {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-brand-600">LinkedIn</a>}
            {profile.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-600">Website</a>}
          </div>

          {/* Skills + endorsements */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {skillsData?.skills.map((s: UserSkill) => (
                <div key={s.id} className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm">
                  <span>{s.skill.name}</span>
                  <span className="text-xs text-gray-400">({s.endorsementCount})</span>
                  {isOwnProfile ? (
                    <button
                      className="ml-1 text-xs text-gray-400 hover:text-red-500"
                      onClick={() => removeSkill.mutate(s.id)}
                      title="Remove skill"
                    >
                      ✕
                    </button>
                  ) : currentUser ? (
                    <button
                      className={`ml-1 text-xs font-medium ${s.endorsedByMe ? "text-brand-600" : "text-gray-400 hover:text-brand-600"}`}
                      onClick={() =>
                        s.endorsedByMe ? unendorseSkill.mutate(s.id) : endorseSkill.mutate(s.id)
                      }
                      title={s.endorsedByMe ? "Remove endorsement" : "Endorse this skill"}
                    >
                      {s.endorsedByMe ? "✓ Endorsed" : "+ Endorse"}
                    </button>
                  ) : null}
                </div>
              ))}
              {(!skillsData || skillsData.skills.length === 0) && (
                <p className="text-sm text-gray-500">No skills added yet.</p>
              )}
            </div>

            {isOwnProfile && (
              <form onSubmit={handleAddSkill} className="mt-3 flex gap-2">
                <input
                  className="input"
                  placeholder="Add a skill (e.g. TypeScript)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <button className="btn-secondary px-4 text-sm" disabled={addSkill.isPending}>
                  Add
                </button>
              </form>
            )}
            {!isOwnProfile && !currentUser && (
              <p className="mt-2 text-xs text-gray-400">
                <Link to="/login" className="text-brand-600">Log in</Link> and connect with {profile.name} to endorse their skills.
              </p>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">Projects</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {profile.projects?.map((p: Project) => (
                <div key={p.id} className="card">
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{p.description}</p>
                </div>
              ))}
              {(!profile.projects || profile.projects.length === 0) && (
                <p className="text-sm text-gray-500">No projects yet.</p>
              )}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">Blog Posts</h2>
            <div className="mt-3 flex flex-col gap-2">
              {profile.posts?.map((post: Post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="card block hover:border-brand-300">
                  <h3 className="font-semibold">{post.title}</h3>
                </Link>
              ))}
              {(!profile.posts || profile.posts.length === 0) && (
                <p className="text-sm text-gray-500">No posts yet.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
