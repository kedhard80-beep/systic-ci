"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, RefreshCw, MapPin, Clock, Users, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient, { getApiError } from "@/lib/api/client";
import { AdminModal, inputCls, labelCls, btnPrimary, btnSecondary } from "@/components/admin/AdminModal";

interface Job {
  id: string;
  titre: string;
  departement: string;
  localisation: string;
  typeContrat: string;
  experience?: string;
  remuneration?: string;
  published: boolean;
  createdAt: string;
  _count?: { applications: number };
}

function fmt(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}

const EMPTY = { titre: "", description: "", departement: "", localisation: "Abidjan, Côte d'Ivoire", typeContrat: "CDI", experience: "", remuneration: "", published: false };

export default function AdminCarrieresPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"" | "create" | "edit" | "delete">("");
  const [selected, setSelected] = useState<Job | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-carrieres"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Job[]; meta: { total: number; active: number; totalApplications: number } }>("/careers/admin/jobs");
      return res.data;
    },
    staleTime: 30_000,
  });

  const jobs = data?.data ?? [];

  function openCreate() { setForm(EMPTY); setErr(""); setModal("create"); }
  function openEdit(j: Job) {
    setSelected(j);
    setForm({ titre: j.titre, description: "", departement: j.departement, localisation: j.localisation, typeContrat: j.typeContrat, experience: j.experience ?? "", remuneration: j.remuneration ?? "", published: j.published });
    setErr(""); setModal("edit");
  }
  function openDelete(j: Job) { setSelected(j); setErr(""); setModal("delete"); }

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = { titre: form.titre, description: form.description || "À définir", departement: form.departement, localisation: form.localisation, typeContrat: form.typeContrat, experience: form.experience || undefined, remuneration: form.remuneration || undefined, published: form.published };
      if (modal === "create") await apiClient.post("/careers/admin/jobs", payload);
      else if (modal === "edit" && selected) await apiClient.put(`/careers/admin/jobs/${selected.id}`, payload);
      qc.invalidateQueries({ queryKey: ["admin-carrieres"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!selected) return; setSaving(true); setErr("");
    try {
      await apiClient.delete(`/careers/admin/jobs/${selected.id}`);
      qc.invalidateQueries({ queryKey: ["admin-carrieres"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function togglePublish(j: Job) {
    try {
      await apiClient.put(`/careers/admin/jobs/${j.id}`, { published: !j.published });
      qc.invalidateQueries({ queryKey: ["admin-carrieres"] });
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Carrières</h1>
          <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">{data?.meta.total ?? 0} offres d'emploi</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-grey-text dark:text-white/60 border border-border hover:border-primary hover:text-primary transition-all">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-primary text-white hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> Nouvelle offre
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Offres actives", value: data?.meta.active ?? 0, color: "text-emerald-600" },
          { label: "Total offres", value: data?.meta.total ?? 0, color: "text-primary" },
          { label: "Candidatures", value: data?.meta.totalApplications ?? 0, color: "text-blue-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-navy/40 rounded-2xl border border-border p-4">
            <p className={cn("text-2xl font-heading font-extrabold", color)}>{value}</p>
            <p className="text-xs text-grey-text dark:text-white/40 font-heading mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-grey-text dark:text-white/50">{getApiError(error)}</div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><Briefcase className="w-8 h-8 text-primary" /></div>
          <p className="font-heading font-semibold text-grey-anthracite dark:text-white">Aucune offre</p>
          <button onClick={openCreate} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-heading font-semibold hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Nouvelle offre
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(j => (
            <div key={j.id} className="bg-white dark:bg-navy/40 rounded-2xl border border-border p-5 flex items-center gap-4 hover:border-primary/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Briefcase className="w-5 h-5 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-bold text-grey-anthracite dark:text-white">{j.titre}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-grey-light dark:bg-white/10 text-grey-text dark:text-white/50">{j.typeContrat}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-grey-text dark:text-white/50 mt-1">
                  <span>{j.departement}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{j.localisation}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmt(j.createdAt)}</span>
                  {j._count && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{j._count.applications} candidature(s)</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => togglePublish(j)} title={j.published ? "Désactiver" : "Activer"} className={cn("p-1.5 rounded-lg transition-colors", j.published ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : "text-grey-text hover:bg-grey-light dark:hover:bg-white/10")}>
                  {j.published ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <span className={cn("px-2.5 py-1 rounded-lg text-xs font-heading font-semibold", j.published ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40")}>
                  {j.published ? "Active" : "Inactive"}
                </span>
                <button onClick={() => openEdit(j)} className="p-1.5 rounded-lg hover:bg-primary/10 text-grey-text hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => openDelete(j)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-grey-text hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal open={modal === "create" || modal === "edit"} onClose={() => setModal("")} title={modal === "create" ? "Nouvelle offre d'emploi" : "Modifier l'offre"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className={labelCls}>Titre du poste *</label><input value={form.titre} onChange={f("titre")} required placeholder="Ex: Technicien Vidéosurveillance" className={inputCls} /></div>
          <div><label className={labelCls}>Description *</label><textarea value={form.description} onChange={f("description")} rows={5} placeholder="Décrivez les missions, profil recherché..." className={inputCls + " resize-none"} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Département *</label><input value={form.departement} onChange={f("departement")} required placeholder="Ex: Technique" className={inputCls} /></div>
            <div><label className={labelCls}>Localisation *</label><input value={form.localisation} onChange={f("localisation")} required placeholder="Ex: Abidjan, CI" className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Type de contrat *</label>
              <select value={form.typeContrat} onChange={f("typeContrat")} className={inputCls}>
                <option value="CDI">CDI</option><option value="CDD">CDD</option><option value="Stage">Stage</option><option value="Freelance">Freelance</option>
              </select>
            </div>
            <div><label className={labelCls}>Expérience requise</label><input value={form.experience} onChange={f("experience")} placeholder="Ex: 2 ans minimum" className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Rémunération</label><input value={form.remuneration} onChange={f("remuneration")} placeholder="Ex: 300 000 – 500 000 XOF / mois" className={inputCls} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="jpub" checked={form.published} onChange={f("published")} className="w-4 h-4 rounded border-border text-primary" />
            <label htmlFor="jpub" className="text-sm font-heading text-grey-anthracite dark:text-white cursor-pointer">Publier immédiatement</label>
          </div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Enregistrement..." : modal === "create" ? "Créer l'offre" : "Enregistrer"}</button>
          </div>
        </form>
      </AdminModal>

      <AdminModal open={modal === "delete"} onClose={() => setModal("")} title="Supprimer l'offre" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-grey-text dark:text-white/60">Supprimer <strong className="text-grey-anthracite dark:text-white">"{selected?.titre}"</strong> ? Action irréversible.</p>
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
