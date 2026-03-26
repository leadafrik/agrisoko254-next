"use client";

import { useEffect, useState } from "react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", tags: "", featured: false });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const fetchPosts = () => {
    adminApiRequest(API_ENDPOINTS.blog.admin.list)
      .then((d) => setPosts(d?.posts ?? d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, []);

  const save = async () => {
    setSaving(true);
    const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    const url = editing ? API_ENDPOINTS.blog.admin.update(editing) : API_ENDPOINTS.blog.admin.create;
    const method = editing ? "PUT" : "POST";
    await adminApiRequest(url, { method, body: JSON.stringify(payload) }).catch(() => {});
    setSaving(false);
    setEditing(null);
    setForm({ title: "", excerpt: "", content: "", tags: "", featured: false });
    fetchPosts();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await adminApiRequest(API_ENDPOINTS.blog.admin.delete(id), { method: "DELETE" }).catch(() => {});
    fetchPosts();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Blog</h1>

      {/* Form */}
      <div className="bg-white rounded-xl border border-stone-100 p-6 mb-8 space-y-4">
        <h2 className="font-semibold text-stone-800">{editing ? "Edit Post" : "New Post"}</h2>
        {[
          { key: "title", label: "Title", multiline: false },
          { key: "excerpt", label: "Excerpt", multiline: false },
          { key: "tags", label: "Tags (comma separated)", multiline: false },
        ].map((f) => (
          <div key={f.key}>
            <label className="text-sm font-medium text-stone-700 block mb-1">{f.label}</label>
            <input type="text" value={(form as any)[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" />
          </div>
        ))}
        <div>
          <label className="text-sm font-medium text-stone-700 block mb-1">Content</label>
          <textarea rows={6} value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-terra-400" />
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          Featured post
        </label>
        <div className="flex gap-3">
          <button onClick={save} disabled={saving}
            className="bg-stone-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-800 disabled:opacity-50">
            {saving ? "Saving..." : editing ? "Update" : "Publish"}
          </button>
          {editing && <button onClick={() => { setEditing(null); setForm({ title: "", excerpt: "", content: "", tags: "", featured: false }); }}
            className="border border-stone-200 text-stone-600 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-50">Cancel</button>}
        </div>
      </div>

      {/* List */}
      {loading ? <p className="text-stone-400">Loading...</p> : (
        <div className="space-y-3">
          {posts.map((p: any) => (
            <div key={p._id} className="bg-white rounded-xl border border-stone-100 p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-stone-800">{p.title}</p>
                <p className="text-xs text-stone-400">{p.slug}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setEditing(p._id); setForm({ title: p.title, excerpt: p.excerpt ?? "", content: p.content ?? "", tags: (p.tags ?? []).join(", "), featured: !!p.featured }); }}
                  className="text-terra-600 text-xs hover:underline font-medium">Edit</button>
                <button onClick={() => del(p._id)} className="text-red-500 text-xs hover:underline font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
