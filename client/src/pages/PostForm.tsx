import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePost } from "../api/hooks/usePosts";
import { apiErrorMessage } from "../api/client";
import MarkdownRenderer from "../components/MarkdownRenderer";

export default function PostForm() {
  const navigate = useNavigate();
  const createPost = useCreatePost();
  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { post } = await createPost.mutateAsync(form);
      navigate(`/blog/${post.slug}`);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to publish post"));
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Write a Post</h1>
      <p className="mt-1 text-sm text-gray-500">Supports Markdown, including fenced code blocks with syntax highlighting.</p>

      <form onSubmit={handleSubmit} className="card mt-4 flex flex-col">
        {error && <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <label className="label">Title</label>
        <input required className="input" value={form.title} onChange={(e) => update("title", e.target.value)} />

        <div className="mt-4 flex items-center justify-between">
          <label className="label mt-0">Content (Markdown)</label>
          <button type="button" className="text-xs font-medium text-brand-600" onClick={() => setPreview((p) => !p)}>
            {preview ? "Edit" : "Preview"}
          </button>
        </div>

        {preview ? (
          <div className="min-h-[280px] rounded-lg border border-gray-200 p-4">
            <MarkdownRenderer content={form.content || "*Nothing to preview yet.*"} />
          </div>
        ) : (
          <textarea
            required
            rows={14}
            className="input font-mono text-sm"
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            placeholder={"## Heading\n\nWrite in **Markdown**...\n\n```js\nconsole.log('hello');\n```"}
          />
        )}

        <label className="label">Tags (comma separated)</label>
        <input placeholder="javascript, react, career" className="input" value={form.tags} onChange={(e) => update("tags", e.target.value)} />

        <button className="btn-primary mt-6" disabled={createPost.isPending}>
          {createPost.isPending ? "Publishing..." : "Publish Post"}
        </button>
      </form>
    </div>
  );
}
