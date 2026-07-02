"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Search, RefreshCw, Plus, Pencil, Trash2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient, { getApiError } from "@/lib/api/client";
import { AdminModal, inputCls, labelCls, btnPrimary, btnSecondary } from "@/components/admin/AdminModal";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  DIRECTION: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  COMMERCIAL: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  TECHNICIEN: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  FORMATEUR: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  ETUDIANT: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  CLIENT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function fmt(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}

const EMPTY = { firstName: "", lastName: "", email: "", password: "", role: "COMMERCIAL", phone: "" };

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modal, setModal] = useState<"" | "create" | "edit" | "delete">("");
  const [selected, setSelected] = useState<User | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-users", search, roleFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: "100" });
      if (search) p.set("search", search);
      if (roleFilter) p.set("role", roleFilter);
      const res = await apiClient.get<{ data: User[]; meta: { total: number } }>(`/users?${p}`);
      return res.data;
    },
    staleTime: 30_000,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-users-stats"],
    queryFn: async () => {
      const res = await apiClient.get<{ total: number; active: number; byRole: Record<string, number> }>("/users/stats");
      return res.data;
    },
  });

  const users = data?.data ?? [];

  function openCreate() { setForm(EMPTY); setErr(""); setModal("create"); }
  function openEdit(u: User) {
    setSelected(u);
    setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, password: "", role: u.role, phone: u.phone ?? "" });
    setErr(""); setModal("edit");
  }
  function openDelete(u: User) { setSelected(u); setErr(""); setModal("delete"); }

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      if (modal === "create") {
        await apiClient.post("/users", {
          firstName: form.firstName, lastName: form.lastName, email: form.email,
          password: form.password, role: form.role, phone: form.phone || undefined,
        });
      } else if (modal === "edit" && selected) {
        const payload: Record<string, string> = { firstName: form.firstName, lastName: form.lastName, role: form.role };
        if (form.phone) payload.phone = form.phone;
        await apiClient.patch(`/users/${selected.id}`, payload);
      }
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-users-stats"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!selected) return; setSaving(true); setErr("");
    try {
      await apiClient.delete(`/users/${selected.id}`);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Utilisateurs</h1>
          <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">{data?.meta.total ?? 0} utilisateurs</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-grey-text dark:text-white/60 border border-border hover:border-primary hover:text-primary transition-all">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-primary text-white hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> Nouvel utilisateur
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-primary" },
            { label: "Actifs", value: stats.active, color: "text-emerald-500" },
            { label: "Techniciens", value: stats.byRole?.TECHNICIEN ?? 0, color: "text-amber-500" },
            { label: "Clients", value: stats.byRole?.CLIENT ?? 0, color: "text-blue-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-navy/40 rounded-2xl border border-border p-4">
              <p className={cn("text-2xl font-heading font-extrabold", color)}>{value}</p>
              <p className="text-xs text-grey-text dark:text-white/40 font-heading mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-text dark:text-white/40 pointer-events-none" />
          <input type="search" placeholder="Rechercher un utilisateur..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white placeholder:text-grey-text dark:placeholder:text-white/30 focus:outline-none focus:border-primary" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white focus:outline-none focus:border-primary">
          <option value="">Tous les rôles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="DIRECTION">Direction</option>
          <option value="COMMERCIAL">Commercial</option>
          <option value="TECHNICIEN">Technicien</option>
          <option value="FORMATEUR">Formateur</option>
          <option value="ETUDIANT">Étudiant</option>
          <option value="CLIENT">Client</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-grey-text dark:text-white/50">{getApiError(error)}</div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><Users className="w-8 h-8 text-primary" /></div>
          <p className="font-heading font-semibold text-grey-anthracite dark:text-white">Aucun utilisateur</p>
          <button onClick={openCreate} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-heading font-semibold hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Nouvel utilisateur
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-navy/40 rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-grey-light dark:bg-white/5">
                {["Utilisateur", "Email", "Téléphone", "Rôle", "Statut", "Depuis", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider text-grey-text dark:text-white/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-grey-light/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 font-heading font-bold text-primary text-sm">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <span className="font-heading font-semibold text-grey-anthracite dark:text-white">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/60">{u.email}</td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/50">{u.phone ?? "—"}</td>
                  <td className="px-4 py-4">
                    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-heading font-semibold", ROLE_COLORS[u.role] ?? "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40")}>
                      <Shield className="w-3 h-3" />{u.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-heading font-semibold", u.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40")}>
                      {u.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/40">{fmt(u.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-primary/10 text-grey-text hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => openDelete(u)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-grey-text hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modal === "create" || modal === "edit"} onClose={() => setModal("")} title={modal === "create" ? "Nouvel utilisateur" : "Modifier l'utilisateur"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Prénom *</label><input value={form.firstName} onChange={f("firstName")} required placeholder="Jean" className={inputCls} /></div>
            <div><label className={labelCls}>Nom *</label><input value={form.lastName} onChange={f("lastName")} required placeholder="Kouassi" className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Email *</label><input type="email" value={form.email} onChange={f("email")} required placeholder="jean.kouassi@systic-ci.com" className={inputCls} /></div>
          {modal === "create" && (
            <div><label className={labelCls}>Mot de passe *</label><input type="password" value={form.password} onChange={f("password")} required minLength={8} placeholder="Minimum 8 caractères" className={inputCls} /></div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Rôle *</label>
              <select value={form.role} onChange={f("role")} className={inputCls}>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="DIRECTION">Direction</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="TECHNICIEN">Technicien</option>
                <option value="FORMATEUR">Formateur</option>
                <option value="ETUDIANT">Étudiant</option>
                <option value="CLIENT">Client</option>
              </select>
            </div>
            <div><label className={labelCls}>Téléphone</label><input value={form.phone} onChange={f("phone")} placeholder="+225 07 00 00 00" className={inputCls} /></div>
          </div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Enregistrement..." : modal === "create" ? "Créer l'utilisateur" : "Enregistrer"}</button>
          </div>
        </form>
      </AdminModal>

      <AdminModal open={modal === "delete"} onClose={() => setModal("")} title="Supprimer l'utilisateur" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-grey-text dark:text-white/60">Supprimer <strong className="text-grey-anthracite dark:text-white">{selected?.firstName} {selected?.lastName}</strong> ? Cette action est irréversible.</p>
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
