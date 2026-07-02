"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Search, RefreshCw, Plus, Pencil, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient, { getApiError } from "@/lib/api/client";
import { AdminModal, inputCls, labelCls, btnPrimary, btnSecondary } from "@/components/admin/AdminModal";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  client?: string;
  location?: string;
  date: string;
  description?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

function fmt(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}

const CATEGORIES = ["Vidéosurveillance", "Contrôle d'accès", "Alarme incendie", "Câblage réseau", "Domotique", "Énergie solaire", "Autre"];

const EMPTY = { title: "", category: "Vidéosurveillance", client: "", location: "", date: "", description: "", tags: "", featured: false, published: false };

export default function AdminPortfolioPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [modal, setModal] = useState<"" | "create" | "edit" | "delete">("");
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-portfolio", search, catFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: "100" });
      if (search) p.set("search", search);
      if (catFilter) p.set("category", catFilter);
      const res = await apiClient.get<{ data: PortfolioItem[]; meta: { total: number } }>(`/portfolio?${p}`);
      return res.data;
    },
    staleTime: 30_000,
  });

  const items = data?.data ?? [];
  const published = items.filter(i => i.isPublished).length;
  const featured = items.filter(i => i.isFeatured).length;

  function openCreate() { setForm(EMPTY); setErr(""); setModal("create"); }
  function openEdit(item: PortfolioItem) {
    setSelected(item);
    setForm({ title: item.title, category: item.category, client: item.client ?? "", location: item.location ?? "", date: item.date?.split("T")[0] ?? "", description: item.description ?? "", tags: item.tags?.join(", ") ?? "", featured: item.isFeatured ?? false, published: item.isPublished ?? false });
    setErr(""); setModal("edit");
  }
  function openDelete(item: PortfolioItem) { setSelected(item); setErr(""); setModal("delete"); }

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = {
        title: form.title,
        category: form.category,
        client: form.client || undefined,
        location: form.location || undefined,
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        description: form.description || undefined,
        tags: form.tags ? form.tags.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        featured: form.featured,
        isPublished: form.published,
      };
      if (modal === "create") await apiClient.post("/portfolio", payload);
      else if (modal === "edit" && selected) await apiClient.patch(`/portfolio/${selected.id}`, payload);
      qc.invalidateQueries({ queryKey: ["admin-portfolio"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!selected) return; setSaving(true); setErr("");
    try {
      await apiClient.delete(`/portfolio/${selected.id}`);
      qc.invalidateQueries({ queryKey: ["admin-portfolio"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function toggleFeatured(item: PortfolioItem) {
    try {
      await apiClient.patch(`/portfolio/${item.id}`, { featured: !item.isFeatured });
      qc.invalidateQueries({ queryKey: ["admin-portfolio"] });
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Portfolio</h1>
          <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">{data?.meta?.total ?? 0} réalisations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-grey-text dark:text-white/60 border border-border hover:border-primary hover:text-primary transition-all">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-primary text-white hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> Nouvelle réalisation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: items.length, color: "text-primary" },
          { label: "Publiés", value: published, color: "text-emerald-500" },
          { label: "En vedette", value: featured, color: "text-amber-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-navy/40 rounded-2xl border border-border p-4">
            <p className={cn("text-2xl font-heading font-extrabold", color)}>{value}</p>
            <p className="text-xs text-grey-text dark:text-white/40 font-heading mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-text dark:text-white/40 pointer-events-none" />
          <input type="search" placeholder="Rechercher une réalisation..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white placeholder:text-grey-text dark:placeholder:text-white/30 focus:outline-none focus:border-primary" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white focus:outline-none focus:border-primary">
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-grey-text dark:text-white/50">{getApiError(error)}</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><BarChart3 className="w-8 h-8 text-primary" /></div>
          <p className="font-heading font-semibold text-grey-anthracite dark:text-white">Aucune réalisation</p>
          <p className="text-sm text-grey-text dark:text-white/50">Ajoutez vos projets réalisés pour les présenter à vos clients.</p>
          <button onClick={openCreate} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-heading font-semibold hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Nouvelle réalisation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white dark:bg-navy/40 rounded-2xl border border-border overflow-hidden hover:border-primary/40 transition-all group relative">
              <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-primary/40" />
                {item.isFeatured && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white text-xs font-heading font-semibold">
                    <Star className="w-3 h-3" /> Vedette
                  </div>
                )}
                <div className={cn("absolute top-3 right-3 px-2 py-0.5 rounded-md text-xs font-heading font-semibold", item.isPublished ? "bg-emerald-500 text-white" : "bg-grey-light text-grey-text dark:bg-white/20 dark:text-white")}>
                  {item.isPublished ? "Publié" : "Brouillon"}
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-primary font-heading font-semibold mb-1">{item.category}</p>
                <h3 className="font-heading font-bold text-grey-anthracite dark:text-white mb-1 line-clamp-2">{item.title}</h3>
                {item.client && <p className="text-xs text-grey-text dark:text-white/50 mb-1">Client : {item.client}</p>}
                {item.location && <p className="text-xs text-grey-text dark:text-white/40">{item.location} · {fmt(item.date)}</p>}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 rounded-md bg-grey-light dark:bg-white/10 text-grey-text dark:text-white/40 text-xs">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                <button onClick={() => toggleFeatured(item)} title={item.isFeatured ? "Retirer de la vedette" : "Mettre en vedette"} className="p-1.5 rounded-lg bg-white dark:bg-navy/80 border border-border hover:border-amber-400 hover:text-amber-500 transition-colors">
                  <Star className={cn("w-3.5 h-3.5", item.isFeatured ? "fill-amber-400 text-amber-400" : "")} />
                </button>
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-white dark:bg-navy/80 border border-border hover:border-primary hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => openDelete(item)} className="p-1.5 rounded-lg bg-white dark:bg-navy/80 border border-border hover:border-red-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal open={modal === "create" || modal === "edit"} onClose={() => setModal("")} title={modal === "create" ? "Nouvelle réalisation" : "Modifier la réalisation"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className={labelCls}>Titre *</label><input value={form.title} onChange={f("title")} required placeholder="Ex: Installation CCTV — Hôtel Ivoire" className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Catégorie *</label>
              <select value={form.category} onChange={f("category")} className={inputCls}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Date de réalisation *</label><input type="date" value={form.date} onChange={f("date")} required className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Client</label><input value={form.client} onChange={f("client")} placeholder="Ex: Hôtel Ivoire" className={inputCls} /></div>
            <div><label className={labelCls}>Localisation</label><input value={form.location} onChange={f("location")} placeholder="Ex: Cocody, Abidjan" className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Description</label><textarea value={form.description} onChange={f("description")} rows={3} placeholder="Décrivez le projet, les défis et les solutions apportées..." className={inputCls + " resize-none"} /></div>
          <div><label className={labelCls}>Tags (séparés par des virgules)</label><input value={form.tags} onChange={f("tags")} placeholder="CCTV, IP, 4K, Hikvision..." className={inputCls} /></div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pfeat" checked={form.featured} onChange={f("featured")} className="w-4 h-4 rounded border-border text-primary" />
              <label htmlFor="pfeat" className="text-sm font-heading text-grey-anthracite dark:text-white cursor-pointer">Mettre en vedette</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ppub" checked={form.published} onChange={f("published")} className="w-4 h-4 rounded border-border text-primary" />
              <label htmlFor="ppub" className="text-sm font-heading text-grey-anthracite dark:text-white cursor-pointer">Publier</label>
            </div>
          </div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Enregistrement..." : modal === "create" ? "Créer la réalisation" : "Enregistrer"}</button>
          </div>
        </form>
      </AdminModal>

      <AdminModal open={modal === "delete"} onClose={() => setModal("")} title="Supprimer la réalisation" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-grey-text dark:text-white/60">Supprimer <strong className="text-grey-anthracite dark:text-white">"{selected?.title}"</strong> ? Action irréversible.</p>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3">
            <button onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button onClick={handleDelete} disabled={saving} className="w-full py-2.5 rounded-xl bg-red-500 text-white font-heading font-semibold text-sm hover:bg-red-600 disabled:opacity-50">{saving ? "Suppression..." : "Supprimer"}</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
