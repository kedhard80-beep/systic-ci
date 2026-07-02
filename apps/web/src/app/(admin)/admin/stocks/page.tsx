"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Search, RefreshCw, AlertTriangle, Plus, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient, { getApiError } from "@/lib/api/client";
import { AdminModal, inputCls, labelCls, btnPrimary, btnSecondary } from "@/components/admin/AdminModal";

interface StockItem {
  id: string;
  quantity: number;
  warehouse?: string;
  product?: { id: string; name?: string; reference?: string; category?: string; unit?: string; minStock?: number };
}

interface Product { id: string; name: string; reference?: string; }

export default function AdminStocksPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"" | "adjust" | "transfer">("");
  const [form, setForm] = useState({ productId: "", quantity: "", reason: "", warehouse: "PRINCIPAL" });
  const [transfer, setTransfer] = useState({ productId: "", from: "PRINCIPAL", to: "SECONDAIRE", quantity: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const { data: productsData } = useQuery({
    queryKey: ["products-list"],
    queryFn: async () => { const res = await apiClient.get<{ data: Product[] }>("/products?limit=200"); return res.data.data; },
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-stocks", search],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (search) p.set("productId", search);
      const res = await apiClient.get<{ data: StockItem[]; meta: { total: number } }>(`/stocks?${p}`);
      return res.data;
    },
    staleTime: 30_000,
  });

  const stocks = data?.data ?? [];
  const lowStock = stocks.filter(s => s.product?.minStock && s.quantity <= s.product.minStock).length;

  function openAdjust() { setForm({ productId: "", quantity: "", reason: "", warehouse: "PRINCIPAL" }); setErr(""); setModal("adjust"); }
  function openTransfer() { setTransfer({ productId: "", from: "PRINCIPAL", to: "SECONDAIRE", quantity: "" }); setErr(""); setModal("transfer"); }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(prev => ({ ...prev, [k]: e.target.value }));
  const ft = (k: keyof typeof transfer) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setTransfer(prev => ({ ...prev, [k]: e.target.value }));

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      await apiClient.post("/stocks/adjust", { productId: form.productId, quantity: Number(form.quantity), warehouse: form.warehouse || "PRINCIPAL", reason: form.reason || undefined });
      qc.invalidateQueries({ queryKey: ["admin-stocks"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      await apiClient.post("/stocks/transfer", { productId: transfer.productId, fromWarehouse: transfer.from, toWarehouse: transfer.to, quantity: Number(transfer.quantity) });
      qc.invalidateQueries({ queryKey: ["admin-stocks"] });
      setModal("");
    } catch (e: any) { setErr(getApiError(e)); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Stocks</h1>
          <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">{data?.meta.total ?? 0} références</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-grey-text dark:text-white/60 border border-border hover:border-primary hover:text-primary transition-all">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <button onClick={openTransfer} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold border border-border text-grey-text dark:text-white/60 hover:border-primary hover:text-primary transition-all">
            <ArrowUpDown className="w-4 h-4" /> Transfert
          </button>
          <button onClick={openAdjust} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold bg-primary text-white hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> Ajuster stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Références", value: stocks.length, color: "text-primary" },
          { label: "Stock faible", value: lowStock, color: lowStock > 0 ? "text-red-500" : "text-emerald-500" },
          { label: "Entrepôts", value: [...new Set(stocks.map(s => s.warehouse))].length || 1, color: "text-blue-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-navy/40 rounded-2xl border border-border p-4">
            <p className={cn("text-2xl font-heading font-extrabold", color)}>{value}</p>
            <p className="text-xs text-grey-text dark:text-white/40 font-heading mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-text dark:text-white/40 pointer-events-none" />
        <input type="search" placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white placeholder:text-grey-text dark:placeholder:text-white/30 focus:outline-none focus:border-primary" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-grey-text dark:text-white/50">{getApiError(error)}</div>
      ) : stocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><Package className="w-8 h-8 text-primary" /></div>
          <p className="font-heading font-semibold text-grey-anthracite dark:text-white">Aucun stock</p>
          <p className="text-sm text-grey-text dark:text-white/50">Ajoutez des produits et ajustez leurs stocks.</p>
          <button onClick={openAdjust} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-heading font-semibold hover:bg-primary/90"><Plus className="w-4 h-4" /> Ajuster stock</button>
        </div>
      ) : (
        <div className="bg-white dark:bg-navy/40 rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-grey-light dark:bg-white/5">
                {["Produit", "Référence", "Catégorie", "Entrepôt", "Quantité", "Unité", "Alerte"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider text-grey-text dark:text-white/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stocks.map(s => {
                const isLow = s.product?.minStock != null && s.quantity <= s.product.minStock;
                return (
                  <tr key={s.id} className={cn("transition-colors", isLow ? "bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20" : "hover:bg-grey-light/50 dark:hover:bg-white/5")}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", isLow ? "bg-red-100 dark:bg-red-900/30" : "bg-primary/10")}>
                          <Package className={cn("w-4 h-4", isLow ? "text-red-500" : "text-primary")} />
                        </div>
                        <span className="font-heading font-semibold text-grey-anthracite dark:text-white">{s.product?.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-grey-text dark:text-white/50 font-mono">{s.product?.reference ?? "—"}</td>
                    <td className="px-4 py-4 text-xs text-grey-text dark:text-white/50">{s.product?.category ?? "—"}</td>
                    <td className="px-4 py-4 text-xs text-grey-text dark:text-white/50">{s.warehouse ?? "PRINCIPAL"}</td>
                    <td className="px-4 py-4">
                      <span className={cn("text-sm font-heading font-bold", isLow ? "text-red-500" : "text-grey-anthracite dark:text-white")}>{s.quantity}</span>
                    </td>
                    <td className="px-4 py-4 text-xs text-grey-text dark:text-white/50">{s.product?.unit ?? "u."}</td>
                    <td className="px-4 py-4">
                      {isLow && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-heading font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
                          <AlertTriangle className="w-3 h-3" /> Stock faible
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Stock Modal */}
      <AdminModal open={modal === "adjust"} onClose={() => setModal("")} title="Ajuster le stock">
        <form onSubmit={handleAdjust} className="space-y-4">
          <div>
            <label className={labelCls}>Produit *</label>
            <select value={form.productId} onChange={f("productId")} required className={inputCls}>
              <option value="">Sélectionner un produit...</option>
              {(productsData ?? []).map(p => <option key={p.id} value={p.id}>{p.name} {p.reference ? `(${p.reference})` : ""}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Entrepôt</label>
            <select value={form.warehouse} onChange={f("warehouse")} className={inputCls}>
              <option value="PRINCIPAL">Principal</option><option value="SECONDAIRE">Secondaire</option><option value="ATELIER">Atelier</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Quantité *</label>
            <input type="number" value={form.quantity} onChange={f("quantity")} required placeholder="Positif = entrée, Négatif = sortie" className={inputCls} />
            <p className="text-xs text-grey-text dark:text-white/40 mt-1">Ex: +50 pour ajouter, -10 pour retirer</p>
          </div>
          <div><label className={labelCls}>Motif</label><input value={form.reason} onChange={f("reason")} placeholder="Ex: Réapprovisionnement, Retour client..." className={inputCls} /></div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Mise à jour..." : "Ajuster"}</button>
          </div>
        </form>
      </AdminModal>

      {/* Transfer Modal */}
      <AdminModal open={modal === "transfer"} onClose={() => setModal("")} title="Transfert de stock">
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className={labelCls}>Produit *</label>
            <select value={transfer.productId} onChange={ft("productId")} required className={inputCls}>
              <option value="">Sélectionner un produit...</option>
              {(productsData ?? []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>De</label>
              <select value={transfer.from} onChange={ft("from")} className={inputCls}>
                <option value="PRINCIPAL">Principal</option><option value="SECONDAIRE">Secondaire</option><option value="ATELIER">Atelier</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Vers</label>
              <select value={transfer.to} onChange={ft("to")} className={inputCls}>
                <option value="SECONDAIRE">Secondaire</option><option value="PRINCIPAL">Principal</option><option value="ATELIER">Atelier</option>
              </select>
            </div>
          </div>
          <div><label className={labelCls}>Quantité *</label><input type="number" value={transfer.quantity} onChange={ft("quantity")} required min="1" placeholder="Ex: 10" className={inputCls} /></div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal("")} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Transfert..." : "Transférer"}</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
