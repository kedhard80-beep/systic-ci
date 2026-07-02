"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Receipt, Search, RefreshCw, CalendarDays, Plus, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient, { getApiError } from "@/lib/api/client";
import { AdminModal, inputCls, labelCls, btnPrimary, btnSecondary } from "@/components/admin/AdminModal";

interface Invoice {
  id: string;
  reference?: string;
  client?: { nom: string };
  totalHT?: number;
  totalTTC?: number;
  status?: string;
  issueDate?: string;
  dueDate?: string;
}

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}
function fmtMoney(v?: number) {
  if (!v) return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(v);
}

const STATUS_COLORS: Record<string, string> = {
  BROUILLON: "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40",
  ENVOYEE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  EN_ATTENTE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  ENCAISSEE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  EN_RETARD: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  ANNULEE: "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40",
};

interface InvoiceItem { description: string; quantity: number; unitPrice: number; }

export default function AdminFacturesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState<"" | "create" | "pay">("");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [form, setForm] = useState({ clientId: "", dueDate: "", notes: "", tvaRate: "18" });
  const [payRef, setPayRef] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const { data: clientsData } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => { const res = await apiClient.get<{ data: { id: string; nom: string }[] }>("/clients?limit=200"); return res.data.data; },
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-factures", search, statusFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: "100" });
      if (search) p.set("search", search);
      if (statusFilter) p.set("status", statusFilter);
      const res = await apiClient.get<{ data: Invoice[]; meta: { total: number } }>(`/invoices?${p}`);
      return res.data;
    },
    staleTime: 30_000,
  });

  const invoices = data?.data ?? [];
  const encaissees = invoices.filter(i => i.status === "ENCAISSEE").length;
  const enAttente = invoices.filter(i => i.status === "EN_ATTENTE" || i.status === "ENVOYEE").length;
  const enRetard = invoices.filter(i => i.status === "EN_RETARD").length;

  function openCreate() {
    setForm({ clientId: "", dueDate: "", notes: "", tvaRate: "18" });
    setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
    setErr(""); setModal("create");
  }
  function openPay(inv: Invoice) { setSelected(inv); setPayRef(""); setErr(""); setModal("pay"); }

  const ff = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  function updateItem(i: number, k: keyof InvoiceItem, v: string) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [k]: k === "description" ? v : Number(v) } : item));
  }
  function addItem() { setItems(prev => [...prev, { description: "", quantity: 1, unitPrice: 0 }]); }
  function removeItem(i: number) { setItems(prev => prev.filter((_, idx) => idx !== i)); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      await apiClient.post("/invoices", { clientId: form.clientId, items, dueDate: form.dueDate || undefined, notes: form.notes || undefined, tvaRate: Number(form.tvaRate) });
      qc.invalidateQueries({ queryKey: ["admin-factures"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function handleSend(inv: Invoice) {
    try {
      await apiClient.patch(`/invoices/${inv.id}/send`);
      qc.invalidateQueries({ queryKey: ["admin-factures"] });
    } catch {}
  }

  async function handlePay() {
    if (!selected) return; setSaving(true); setErr("");
    try {
      await apiClient.patch(`/invoices/${selected.id}/pay`, { paymentRef: payRef || undefined });
      qc.invalidateQueries({ queryKey: ["admin-factures"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Factures</h1>
          <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">{data?.meta.total ?? 0} factures</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-grey-text dark:text-white/60 border border-border hover:border-primary hover:text-primary transition-all">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-primary text-white hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> Nouvelle facture
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Encaissé", value: encaissees, color: "text-emerald-600" },
          { label: "En attente", value: enAttente, color: "text-blue-500" },
          { label: "En retard", value: enRetard, color: "text-red-500" },
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
          <input type="search" placeholder="Rechercher une facture..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white placeholder:text-grey-text dark:placeholder:text-white/30 focus:outline-none focus:border-primary" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white focus:outline-none focus:border-primary">
          <option value="">Tous les statuts</option>
          <option value="BROUILLON">Brouillon</option><option value="ENVOYEE">Envoyée</option><option value="EN_ATTENTE">En attente</option><option value="ENCAISSEE">Encaissée</option><option value="EN_RETARD">En retard</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-grey-text dark:text-white/50">{getApiError(error)}</div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><Receipt className="w-8 h-8 text-primary" /></div>
          <p className="font-heading font-semibold text-grey-anthracite dark:text-white">Aucune facture</p>
          <button onClick={openCreate} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-heading font-semibold hover:bg-primary/90"><Plus className="w-4 h-4" /> Nouvelle facture</button>
        </div>
      ) : (
        <div className="bg-white dark:bg-navy/40 rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-grey-light dark:bg-white/5">
                {["Numéro", "Client", "Montant TTC", "Émission", "Échéance", "Statut", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider text-grey-text dark:text-white/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-grey-light/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><Receipt className="w-4 h-4 text-primary" /></div>
                      <span className="font-heading font-semibold text-grey-anthracite dark:text-white text-xs">{inv.reference ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/60">{inv.client?.nom ?? "—"}</td>
                  <td className="px-4 py-4 text-xs font-heading font-semibold text-grey-anthracite dark:text-white">{fmtMoney(inv.totalTTC)}</td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/40"><div className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{fmt(inv.issueDate)}</div></td>
                  <td className="px-4 py-4 text-xs text-grey-text dark:text-white/40">{fmt(inv.dueDate)}</td>
                  <td className="px-4 py-4">
                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-heading font-semibold", STATUS_COLORS[inv.status ?? ""] ?? "bg-grey-light text-grey-text dark:bg-white/10 dark:text-white/40")}>
                      {inv.status?.replace(/_/g, " ") ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {(inv.status === "BROUILLON" || inv.status === "EN_ATTENTE") && (
                        <button onClick={() => handleSend(inv)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-grey-text hover:text-blue-500 transition-colors" title="Envoyer">
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {(inv.status === "ENVOYEE" || inv.status === "EN_ATTENTE" || inv.status === "EN_RETARD") && (
                        <button onClick={() => openPay(inv)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-grey-text hover:text-emerald-500 transition-colors" title="Marquer payée">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Invoice Modal */}
      <AdminModal open={modal === "create"} onClose={() => setModal("")} title="Nouvelle facture" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className={labelCls}>Client *</label>
            <select value={form.clientId} onChange={ff("clientId")} required className={inputCls}>
              <option value="">Sélectionner un client...</option>
              {(clientsData ?? []).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Lignes de facture</label>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input placeholder="Description" value={item.description} onChange={e => updateItem(i, "description", e.target.value)} className={inputCls + " col-span-6"} />
                  <input type="number" placeholder="Qté" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} min="1" className={inputCls + " col-span-2"} />
                  <input type="number" placeholder="Prix unit." value={item.unitPrice} onChange={e => updateItem(i, "unitPrice", e.target.value)} min="0" className={inputCls + " col-span-3"} />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="col-span-1 text-red-400 hover:text-red-600 text-sm">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-xs text-primary hover:underline">+ Ajouter une ligne</button>
            </div>
            <p className="text-xs text-grey-text dark:text-white/50 mt-2">Total HT : {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(total)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Date d'échéance</label><input type="date" value={form.dueDate} onChange={ff("dueDate")} className={inputCls} /></div>
            <div><label className={labelCls}>TVA (%)</label><input type="number" value={form.tvaRate} onChange={ff("tvaRate")} min="0" max="100" className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>Notes</label><textarea value={form.notes} onChange={ff("notes")} rows={2} placeholder="Conditions de paiement, notes..." className={inputCls + " resize-none"} /></div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Création..." : "Créer la facture"}</button>
          </div>
        </form>
      </AdminModal>

      {/* Mark Paid Modal */}
      <AdminModal open={modal === "pay"} onClose={() => setModal("")} title="Marquer comme payée" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-grey-text dark:text-white/60">Facture <strong className="text-grey-anthracite dark:text-white">{selected?.reference}</strong></p>
          <div><label className={labelCls}>Référence de paiement</label><input value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Ex: VIR-2024-001 (optionnel)" className={inputCls} /></div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3">
            <button onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button onClick={handlePay} disabled={saving} className={btnPrimary}>{saving ? "Mise à jour..." : "Confirmer le paiement"}</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
