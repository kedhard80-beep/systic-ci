"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText, User, Phone, Mail, Building2, Clock,
  ChevronDown, Search, RefreshCw, Eye, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient, { getApiError } from "@/lib/api/client";
import { AdminModal, inputCls, labelCls, btnPrimary, btnSecondary } from "@/components/admin/AdminModal";

// ── Types ────────────────────────────────────────────────────────────────────

type LeadStage = "PROSPECT" | "CONTACT" | "DEVIS" | "NEGOCIATION" | "GAGNE" | "PERDU";

interface Lead {
  id: string;
  nom: string;
  email?: string;
  telephone?: string;
  entreprise?: string;
  stage: LeadStage;
  source: string;
  notes?: string;
  montant?: number;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<LeadStage, string> = {
  PROSPECT: "Prospect",
  CONTACT: "Contacté",
  DEVIS: "Devis envoyé",
  NEGOCIATION: "Négociation",
  GAGNE: "Gagné",
  PERDU: "Perdu",
};

const STAGE_COLORS: Record<LeadStage, string> = {
  PROSPECT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  CONTACT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  DEVIS: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  NEGOCIATION: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  GAGNE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  PERDU: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const STAGES: LeadStage[] = ["PROSPECT", "CONTACT", "DEVIS", "NEGOCIATION", "GAGNE", "PERDU"];
const CONVERTIBLE_STAGES: LeadStage[] = ["DEVIS", "NEGOCIATION", "GAGNE"];

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

function extractServices(notes?: string): string[] {
  if (!notes) return [];
  const match = notes.match(/Services demandés : ([^\n]+)/);
  if (!match) return [];
  return match[1].split(", ").map((s) => s.trim());
}

const CONVERT_EMPTY = {
  clientId: "", titre: "", typeContrat: "INSTALLATION",
  startDate: "", endDate: "", montantHT: "", description: "",
};

// ── Stage badge + dropdown ────────────────────────────────────────────────────

function StageSelector({ lead, onStageChange }: { lead: Lead; onStageChange: (id: string, stage: LeadStage) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-heading font-semibold transition-all", STAGE_COLORS[lead.stage])}
      >
        {STAGE_LABELS[lead.stage]}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-8 z-20 w-44 bg-white dark:bg-navy rounded-xl shadow-xl border border-border overflow-hidden">
            {STAGES.map((s) => (
              <button key={s} onClick={() => { onStageChange(lead.id, s); setOpen(false); }}
                className={cn("w-full text-left px-3 py-2 text-xs font-heading font-semibold hover:bg-grey-light dark:hover:bg-white/5 transition-colors",
                  lead.stage === s ? "text-primary" : "text-grey-anthracite dark:text-white/80")}>
                {STAGE_LABELS[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Detail modal ─────────────────────────────────────────────────────────────

function LeadModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const services = extractServices(lead.notes);
  const notesBody = lead.notes ? lead.notes.replace(/Services demandés : [^\n]+\n?/, "").trim() : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-navy rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="font-heading font-bold text-xl text-grey-anthracite dark:text-white">{lead.nom}</h2>
          {lead.entreprise && <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">{lead.entreprise}</p>}
        </div>
        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {lead.email && (
              <div className="flex items-center gap-2 text-grey-text dark:text-white/60">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`mailto:${lead.email}`} className="hover:text-primary truncate">{lead.email}</a>
              </div>
            )}
            {lead.telephone && (
              <div className="flex items-center gap-2 text-grey-text dark:text-white/60">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`tel:${lead.telephone}`} className="hover:text-primary">{lead.telephone}</a>
              </div>
            )}
          </div>
          {services.length > 0 && (
            <div>
              <p className="text-xs font-heading font-bold uppercase tracking-wider text-grey-text dark:text-white/40 mb-2">Services demandés</p>
              <div className="flex flex-wrap gap-1.5">
                {services.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-heading font-semibold">{s}</span>
                ))}
              </div>
            </div>
          )}
          {notesBody && (
            <div>
              <p className="text-xs font-heading font-bold uppercase tracking-wider text-grey-text dark:text-white/40 mb-2">Détails du projet</p>
              <p className="text-sm text-grey-anthracite dark:text-white/80 whitespace-pre-wrap leading-relaxed bg-grey-light dark:bg-white/5 rounded-xl p-4">{notesBody}</p>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-grey-text dark:text-white/40">
            <Clock className="w-3.5 h-3.5" />
            Reçu le {formatDate(lead.createdAt)}
          </div>
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-heading font-semibold text-grey-anthracite dark:text-white bg-grey-light dark:bg-white/10 hover:bg-grey-200 dark:hover:bg-white/20 transition-colors">
            Fermer
          </button>
          {lead.email && (
            <a href={`mailto:${lead.email}?subject=Votre demande de devis SYSTIC-CI`}
              className="px-4 py-2 rounded-xl text-sm font-heading font-semibold text-white bg-primary hover:bg-primary/90 transition-colors">
              Répondre par email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminDevisPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<LeadStage | "">("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const queryClient = useQueryClient();

  // Convert-to-contract state
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [convertForm, setConvertForm] = useState(CONVERT_EMPTY);
  const [convertSaving, setConvertSaving] = useState(false);
  const [convertErr, setConvertErr] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-devis", stageFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams({ source: "SITE_WEB", limit: "100" });
      if (stageFilter) params.set("stage", stageFilter);
      if (search) params.set("search", search);
      const res = await apiClient.get<{ data: Lead[]; meta: { total: number } }>(`/crm/leads?${params}`);
      return res.data;
    },
    retry: 1,
    staleTime: 30_000,
  });

  const { data: clientsData } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { id: string; nom: string }[] }>("/clients?limit=200");
      return res.data.data;
    },
  });

  const moveStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: LeadStage }) =>
      apiClient.patch(`/crm/leads/${id}/stage`, { stage }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-devis"] }),
  });

  const leads = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  function openConvert(lead: Lead) {
    const services = extractServices(lead.notes);
    const notesBody = lead.notes ? lead.notes.replace(/Services demandés : [^\n]+\n?/, "").trim() : "";
    setConvertLead(lead);
    setConvertForm({
      clientId: "",
      titre: `Contrat — ${lead.entreprise || lead.nom}`,
      typeContrat: "INSTALLATION",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      montantHT: lead.montant ? String(lead.montant) : "",
      description: [services.length > 0 ? `Services : ${services.join(", ")}` : "", notesBody]
        .filter(Boolean).join("\n").trim(),
    });
    setConvertErr("");
    setConvertOpen(true);
  }

  const fc = (k: keyof typeof CONVERT_EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setConvertForm(prev => ({ ...prev, [k]: e.target.value }));

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    setConvertSaving(true);
    setConvertErr("");
    try {
      await apiClient.post("/contracts", {
        clientId: convertForm.clientId,
        titre: convertForm.titre,
        typeContrat: convertForm.typeContrat,
        startDate: convertForm.startDate,
        endDate: convertForm.endDate || undefined,
        montantHT: convertForm.montantHT ? Number(convertForm.montantHT) : undefined,
        description: convertForm.description || undefined,
      });
      // Automatically advance lead to GAGNE
      if (convertLead && convertLead.stage !== "GAGNE") {
        await apiClient.patch(`/crm/leads/${convertLead.id}/stage`, { stage: "GAGNE" }).catch(() => {});
      }
      queryClient.invalidateQueries({ queryKey: ["admin-devis"] });
      setConvertOpen(false);
    } catch (err: any) {
      setConvertErr(getApiError(err));
    } finally {
      setConvertSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Demandes de devis</h1>
          <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">Formulaires reçus depuis le site web ({total} au total)</p>
        </div>
        <button onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-grey-text dark:text-white/60 border border-border hover:border-primary hover:text-primary transition-all">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-text dark:text-white/40 pointer-events-none" />
          <input type="search" placeholder="Rechercher par nom, email, entreprise..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white placeholder:text-grey-text dark:placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors" />
        </div>
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value as LeadStage | "")}
          className="px-3 py-2.5 text-sm rounded-xl border border-border bg-white dark:bg-navy/40 text-grey-anthracite dark:text-white focus:outline-none focus:border-primary transition-colors">
          <option value="">Tous les statuts</option>
          {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-2">
        {STAGES.slice(0, 4).map((s) => {
          const count = leads.filter((l) => l.stage === s).length;
          return (
            <button key={s} onClick={() => setStageFilter(stageFilter === s ? "" : s)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all border",
                stageFilter === s ? STAGE_COLORS[s] + " border-transparent" : "text-grey-text dark:text-white/50 border-border hover:border-primary/40")}>
              {STAGE_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <p className="text-sm text-grey-text dark:text-white/50">{getApiError(error)}</p>
          <button onClick={() => refetch()} className="text-xs text-primary hover:underline font-heading font-semibold">Réessayer</button>
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-heading font-semibold text-grey-anthracite dark:text-white">Aucune demande de devis</p>
            <p className="text-sm text-grey-text dark:text-white/50 mt-1">
              {search || stageFilter ? "Aucun résultat pour ces filtres." : "Les demandes soumises depuis le formulaire apparaîtront ici."}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-navy/40 rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-grey-light dark:bg-white/5">
                <th className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider text-grey-text dark:text-white/40">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider text-grey-text dark:text-white/40 hidden md:table-cell">Services</th>
                <th className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider text-grey-text dark:text-white/40 hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider text-grey-text dark:text-white/40">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads.map((lead) => {
                const services = extractServices(lead.notes);
                const canConvert = CONVERTIBLE_STAGES.includes(lead.stage);
                return (
                  <tr key={lead.id} className="hover:bg-grey-light/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-heading font-semibold text-grey-anthracite dark:text-white truncate">{lead.nom}</p>
                          {lead.entreprise && (
                            <p className="text-xs text-grey-text dark:text-white/40 flex items-center gap-1 truncate">
                              <Building2 className="w-3 h-3 flex-shrink-0" />{lead.entreprise}
                            </p>
                          )}
                          {lead.email && (
                            <p className="text-xs text-grey-text dark:text-white/40 flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 flex-shrink-0" />{lead.email}
                            </p>
                          )}
                          {lead.telephone && (
                            <p className="text-xs text-grey-text dark:text-white/40 flex items-center gap-1">
                              <Phone className="w-3 h-3 flex-shrink-0" />{lead.telephone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {services.slice(0, 3).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-heading font-semibold">{s}</span>
                        ))}
                        {services.length > 3 && (
                          <span className="text-[11px] text-grey-text dark:text-white/40 font-heading self-center">+{services.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-grey-text dark:text-white/50 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{formatDate(lead.createdAt)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <StageSelector lead={lead} onStageChange={(id, stage) => moveStageMutation.mutate({ id, stage })} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        {canConvert && (
                          <button
                            onClick={() => openConvert(lead)}
                            title="Convertir en contrat"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-heading font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all border border-emerald-200 dark:border-emerald-700/50"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            Contrat
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-1.5 rounded-lg text-grey-text dark:text-white/40 hover:text-primary hover:bg-primary/10 transition-all"
                          aria-label="Voir le détail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLead && <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}

      {/* Convert to Contract Modal */}
      <AdminModal open={convertOpen} onClose={() => setConvertOpen(false)} title="Convertir en contrat" size="lg">
        {convertLead && (
          <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-xs font-heading font-semibold text-primary">Devis de {convertLead.nom}</p>
            {convertLead.entreprise && <p className="text-xs text-grey-text dark:text-white/50 mt-0.5">{convertLead.entreprise}</p>}
          </div>
        )}
        <form onSubmit={handleConvert} className="space-y-4">
          <div>
            <label className={labelCls}>Client (compte existant) *</label>
            <select value={convertForm.clientId} onChange={fc("clientId")} required className={inputCls}>
              <option value="">Sélectionner le compte client...</option>
              {(clientsData ?? []).map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            <p className="text-xs text-grey-text dark:text-white/40 mt-1">
              Si le client n'existe pas encore, créez-le d'abord dans <strong>Clients</strong>.
            </p>
          </div>
          <div>
            <label className={labelCls}>Titre du contrat *</label>
            <input value={convertForm.titre} onChange={fc("titre")} required placeholder="Ex: Contrat installation système CCTV" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Type de contrat</label>
            <select value={convertForm.typeContrat} onChange={fc("typeContrat")} className={inputCls}>
              <option value="INSTALLATION">Installation</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="SURVEILLANCE">Surveillance</option>
              <option value="FORMATION">Formation</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Date de début *</label>
              <input type="date" value={convertForm.startDate} onChange={fc("startDate")} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Date de fin</label>
              <input type="date" value={convertForm.endDate} onChange={fc("endDate")} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Montant HT (XOF)</label>
            <input type="number" value={convertForm.montantHT} onChange={fc("montantHT")} min="0" placeholder="Ex: 1500000" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description / Scope</label>
            <textarea value={convertForm.description} onChange={fc("description")} rows={3}
              placeholder="Détails des prestations..." className={inputCls + " resize-none"} />
          </div>
          {convertErr && <p className="text-red-500 text-xs">{convertErr}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setConvertOpen(false)} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={convertSaving} className={btnPrimary}>
              {convertSaving ? "Création en cours..." : "Créer le contrat →"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
