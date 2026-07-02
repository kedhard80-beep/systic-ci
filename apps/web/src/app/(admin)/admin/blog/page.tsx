"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Search, RefreshCw, Clock, Eye, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient, { getApiError } from "@/lib/api/client";
import { AdminModal, inputCls, labelCls, btnPrimary, btnSecondary } from "@/components/admin/AdminModal";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  categories: string[];
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  views: number;
  author?: { firstName: string; lastName: string };
  _count?: { comments: number };
}

const EMPTY = { title: "", content: "", excerpt: "", categories: "", published: false };
function fmt(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}

export default function AdminBlogPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [pubFilter, setPubFilter] = useState<"" | "true" | "false">("");
  const [modal, setModal] = useState<"" | "create" | "edit" | "delete">("");
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-blog", search, pubFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: "100" });
      if (search) p.set("search", search);
      if (pubFilter !== "") p.set("published", pubFilter);
      const res = await apiClient.get<{ data: BlogPost[]; meta: { total: number } }>(`/blog?${p}`);
      return res.data;
    },
    staleTime: 30_000,
  });

  const posts = data?.data ?? [];
  const published = posts.filter(p => p.published).length;
  const drafts = posts.filter(p => !p.published).length;

  function openCreate() { setForm(EMPTY); setErr(""); setModal("create"); }
  function openEdit(p: BlogPost) {
    setSelected(p);
    setForm({ title: p.title, content: "", excerpt: "", categories: p.categories?.join(", ") ?? "", published: p.published });
    setErr(""); setModal("edit");
  }
  function openDelete(p: BlogPost) { setSelected(p); setErr(""); setModal("delete"); }

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = {
        title: form.title,
        content: form.content || " ",
        excerpt: form.excerpt || undefined,
        categories: form.categories ? form.categories.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        published: form.published,
      };
      if (modal === "create") await apiClient.post("/blog", payload);
      else if (modal === "edit" && selected) await apiClient.put(`/blog/${selected.id}`, payload);
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!selected) return; setSaving(true); setErr("");
    try {
      await apiClient.delete(`/blog/${selected.id}`);
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Blog</h1>
          <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">{data?.meta.total ?? 0} articles</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-grey-text dark:text-white/60 border border-border hover:border-primary hover:text-primary transition-all">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-primary text-white hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> Nouvel article
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{ label: "Total", value: posts.length, color: "text-primary" }, { label: "Publiés", value: published, color: "text-emerald-600" }, { label: "Brouillons", value: drafts, color: "text-amber-600" }].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-navy/40 rounded-2xl border border-border p-4">
            <p className={cn("text-2xl font-heading font-extrabold", color)}>{value}</p>
            <p className="text-xs text-grey-text dark:text-white/40 font-heading mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-text dark:text-white/40 pointer-events-none" />
          <input type="search" placeholder="Rechercher un article..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white placeholder:text-grey-text dark:placeholder:text-white/30 focus:outline-none focus:border-primary" />
        </div>
        <select value={pubFilter} onChange={e => setPubFilter(e.target.value as "" | "true" | "false")}
          className="px-3 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white focus:outline-none focus:border-primary">
          <option value="">Tous</option><option value="true">Publiés</option><option value="false">Brouillons</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-grey-text dark:text-white/50">{getApiError(error)}</div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><Megaphone className="w-8 h-8 text-primary" /></div>
          <p className="font-heading font-semibold text-grey-anthracite dark:text-white">Aucun article</p>
          <p className="text-sm text-grey-text dark:text-white/50">Créez votre premier article de blog.</p>
          <button onClick={openCreate} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-heading font-semibold hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Nouvel article
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-navy/40 rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-grey-light dark:bg-white/5">
                {["Titre", "Catégorie", "Auteur", "Vues", "Date", "Statut", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider text-grey-text dark:text-white/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-grey-light/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><Megaphone className="w-4 h-4 text-primary" /></div>
                      <span className="font-heading font-semibold text-grey-anthracite dark:text-white line-clamp-1 max-w-xs">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/50">{post.categories?.length ? post.categories[0] : "—"}</td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/60">{post.author ? `${post.author.firstName} ${post.author.lastName}` : "—"}</td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/50"><span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views ?? 0}</span></td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/40"><div className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmt(post.publishedAt ?? post.createdAt)}</div></td>
                  <td className="px-4 py-4">
                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-heading font-semibold", post.published ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40")}>
                      {post.published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(post)} className="p-1.5 rounded-lg hover:bg-primary/10 text-grey-text hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => openDelete(post)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-grey-text hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modal === "create" || modal === "edit"} onClose={() => setModal("")} title={modal === "create" ? "Nouvel article" : "Modifier l'article"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className={labelCls}>Titre *</label><input value={form.title} onChange={f("title")} required placeholder="Titre de l'article" className={inputCls} /></div>
          <div><label className={labelCls}>Contenu *</label><textarea value={form.content} onChange={f("content")} required rows={8} placeholder="Rédigez votre article..." className={inputCls + " resize-none"} /></div>
          <div><label className={labelCls}>Extrait</label><textarea value={form.excerpt} onChange={f("excerpt")} rows={2} placeholder="Résumé court (optionnel)..." className={inputCls + " resize-none"} /></div>
          <div><label className={labelCls}>Catégories (séparées par des virgules)</label><input value={form.categories} onChange={f("categories")} placeholder="Sécurité, Innovation..." className={inputCls} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="pub" checked={form.published} onChange={f("published")} className="w-4 h-4 rounded border-border text-primary" />
            <label htmlFor="pub" className="text-sm font-heading text-grey-anthracite dark:text-white cursor-pointer">Publier immédiatement</label>
          </div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Enregistrement..." : modal === "create" ? "Créer l'article" : "Enregistrer"}</button>
          </div>
        </form>
      </AdminModal>

      <AdminModal open={modal === "delete"} onClose={() => setModal("")} title="Supprimer l'article" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-grey-text dark:text-white/60">Supprimer <strong className="text-grey-anthracite dark:text-white">"{selected?.title}"</strong> ? Action irréversible.</p>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3">
            <button onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button onClick={handleDelete} disabled={saving} className="w-full py-2.5 rounded-xl bg-red-500 text-white font-heading font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50">{saving ? "Suppression..." : "Supprimer"}</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
