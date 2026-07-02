"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, RefreshCw, Users, Clock, Award, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient, { getApiError } from "@/lib/api/client";
import { AdminModal, inputCls, labelCls, btnPrimary, btnSecondary } from "@/components/admin/AdminModal";

interface Course {
  id: string;
  title: string;
  description?: string;
  level?: string;
  duration?: number;
  price?: number;
  published: boolean;
  _count?: { enrollments: number };
}

const LEVEL_COLORS: Record<string, string> = {
  DEBUTANT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  INTERMEDIAIRE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  AVANCE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};
const LEVEL_LABELS: Record<string, string> = { DEBUTANT: "Débutant", INTERMEDIAIRE: "Intermédiaire", AVANCE: "Avancé" };

function fmtPrice(v?: number) {
  if (!v) return "Gratuit";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(v);
}

const EMPTY = { title: "", description: "", level: "DEBUTANT", duration: "", price: "", published: false };

export default function AdminAcademiePage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"" | "create" | "edit" | "delete">("");
  const [selected, setSelected] = useState<Course | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ["admin-academie-stats"],
    queryFn: async () => {
      const res = await apiClient.get<{ totalCourses: number; totalEnrollments: number; totalCertificates: number; activeStudents: number }>("/academie/stats");
      return res.data;
    },
    staleTime: 30_000,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-academie-courses"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Course[]; meta: { total: number } }>("/academie/admin/courses");
      return res.data;
    },
    staleTime: 30_000,
  });

  const courses = data?.data ?? [];

  function openCreate() { setForm(EMPTY); setErr(""); setModal("create"); }
  function openEdit(c: Course) {
    setSelected(c);
    setForm({ title: c.title, description: c.description ?? "", level: c.level ?? "DEBUTANT", duration: c.duration?.toString() ?? "", price: c.price?.toString() ?? "", published: c.published });
    setErr(""); setModal("edit");
  }
  function openDelete(c: Course) { setSelected(c); setErr(""); setModal("delete"); }

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        level: form.level,
        duration: form.duration ? Number(form.duration) : undefined,
        price: form.price ? Number(form.price) : 0,
        published: form.published,
      };
      if (modal === "create") await apiClient.post("/academie/admin/courses", payload);
      else if (modal === "edit" && selected) await apiClient.patch(`/academie/admin/courses/${selected.id}`, payload);
      qc.invalidateQueries({ queryKey: ["admin-academie-courses"] });
      qc.invalidateQueries({ queryKey: ["admin-academie-stats"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!selected) return; setSaving(true); setErr("");
    try {
      await apiClient.delete(`/academie/admin/courses/${selected.id}`);
      qc.invalidateQueries({ queryKey: ["admin-academie-courses"] });
      qc.invalidateQueries({ queryKey: ["admin-academie-stats"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Académie SYSTIC-CI</h1>
          <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">Gestion des formations et certifications</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { refetch(); refetchStats(); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-grey-text dark:text-white/60 border border-border hover:border-primary hover:text-primary transition-all">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-primary text-white hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> Nouvelle formation
          </button>
        </div>
      </div>

      {statsData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Formations", value: statsData.totalCourses, icon: BookOpen, color: "text-primary" },
            { label: "Inscrits", value: statsData.totalEnrollments, icon: Users, color: "text-blue-500" },
            { label: "Actifs", value: statsData.activeStudents, icon: Clock, color: "text-amber-500" },
            { label: "Certificats", value: statsData.totalCertificates, icon: Award, color: "text-emerald-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-navy/40 rounded-2xl border border-border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-grey-light dark:bg-white/5 flex items-center justify-center flex-shrink-0"><Icon className={cn("w-5 h-5", color)} /></div>
              <div>
                <p className="text-2xl font-heading font-extrabold text-grey-anthracite dark:text-white">{value}</p>
                <p className="text-xs text-grey-text dark:text-white/40 font-heading">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-grey-text dark:text-white/50">{getApiError(error)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><BookOpen className="w-8 h-8 text-primary" /></div>
              <p className="font-heading font-semibold text-grey-anthracite dark:text-white">Aucune formation</p>
              <p className="text-sm text-grey-text dark:text-white/50">Créez votre première formation.</p>
              <button onClick={openCreate} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-heading font-semibold hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Nouvelle formation
              </button>
            </div>
          ) : courses.map(c => (
            <div key={c.id} className="bg-white dark:bg-navy/40 rounded-2xl border border-border p-5 hover:border-primary/40 transition-all relative group">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><BookOpen className="w-5 h-5 text-primary" /></div>
                <span className={cn("px-2.5 py-1 rounded-lg text-xs font-heading font-semibold", c.published ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40")}>
                  {c.published ? "Publié" : "Brouillon"}
                </span>
              </div>
              <h3 className="font-heading font-bold text-grey-anthracite dark:text-white mb-1 line-clamp-2">{c.title}</h3>
              {c.description && <p className="text-xs text-grey-text dark:text-white/40 mb-3 line-clamp-2">{c.description}</p>}
              <div className="flex items-center gap-3 text-xs text-grey-text dark:text-white/50">
                {c.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.duration}h</span>}
                {c._count && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c._count.enrollments} inscrits</span>}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                {c.level && <span className={cn("px-2 py-0.5 rounded-md text-xs font-heading font-semibold", LEVEL_COLORS[c.level] ?? "bg-grey-light text-grey-text")}>{LEVEL_LABELS[c.level] ?? c.level}</span>}
                <span className="text-sm font-heading font-bold text-primary ml-auto">{fmtPrice(c.price)}</span>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg bg-white dark:bg-navy/80 border border-border hover:border-primary hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => openDelete(c)} className="p-1.5 rounded-lg bg-white dark:bg-navy/80 border border-border hover:border-red-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal open={modal === "create" || modal === "edit"} onClose={() => setModal("")} title={modal === "create" ? "Nouvelle formation" : "Modifier la formation"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className={labelCls}>Titre *</label><input value={form.title} onChange={f("title")} required placeholder="Titre de la formation" className={inputCls} /></div>
          <div><label className={labelCls}>Description</label><textarea value={form.description} onChange={f("description")} rows={3} placeholder="Objectifs et contenu de la formation..." className={inputCls + " resize-none"} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Niveau</label>
              <select value={form.level} onChange={f("level")} className={inputCls}>
                <option value="DEBUTANT">Débutant</option>
                <option value="INTERMEDIAIRE">Intermédiaire</option>
                <option value="AVANCE">Avancé</option>
              </select>
            </div>
            <div><label className={labelCls}>Durée (heures)</label><input type="number" value={form.duration} onChange={f("duration")} min="0" placeholder="Ex: 20" className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Prix (XOF) — laisser vide = Gratuit</label><input type="number" value={form.price} onChange={f("price")} min="0" placeholder="Ex: 50000" className={inputCls} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="cpub" checked={form.published} onChange={f("published")} className="w-4 h-4 rounded border-border text-primary" />
            <label htmlFor="cpub" className="text-sm font-heading text-grey-anthracite dark:text-white cursor-pointer">Publier immédiatement</label>
          </div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Enregistrement..." : modal === "create" ? "Créer la formation" : "Enregistrer"}</button>
          </div>
        </form>
      </AdminModal>

      <AdminModal open={modal === "delete"} onClose={() => setModal("")} title="Supprimer la formation" size="sm">
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
