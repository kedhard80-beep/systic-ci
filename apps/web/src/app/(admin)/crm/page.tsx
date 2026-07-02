"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, Phone, Mail, Plus, Search,
  MoreVertical, ArrowRight, Building, Clock, DollarSign,
  ChevronDown, Tag, Filter, RefreshCw,
} from "lucide-react";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import { usePipeline, useMoveLead, useCrmStats } from "@/hooks/useCrm";

type Stage = "prospects" | "contact" | "devis" | "negociation" | "gagne" | "perdu";

const STAGES: { id: Stage; label: string; color: string; bgColor: string }[] = [
  { id: "prospects", label: "Prospects", color: "text-grey-text", bgColor: "bg-grey-light dark:bg-white/5" },
  { id: "contact", label: "Contact établi", color: "text-primary", bgColor: "bg-primary/10" },
  { id: "devis", label: "Devis envoyé", color: "text-yellow-600", bgColor: "bg-yellow-500/10" },
  { id: "negociation", label: "Négociation", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  { id: "gagne", label: "Gagné ✓", color: "text-emerald-600", bgColor: "bg-emerald-500/10" },
  { id: "perdu", label: "Perdu", color: "text-accent", bgColor: "bg-accent/10" },
];

type Lead = {
  id: string;
  nom: string;
  entreprise: string;
  secteur: string;
  valeur: number;
  stage: Stage;
  contact: string;
  email: string;
  createdAt: string;
  lastActivity: string;
  source: string;
};

const INITIAL_LEADS: Lead[] = [
  { id: "L001", nom: "Kouamé Bah", entreprise: "Clinique Sainte Marie", secteur: "Santé", valeur: 2500000, stage: "prospects", contact: "+225 07 12 34 56", email: "kbah@clinique-sm.ci", createdAt: "2024-12-01", lastActivity: "2024-12-08", source: "Site web" },
  { id: "L002", nom: "Fatou Traoré", entreprise: "Station Total CI", secteur: "Énergie", valeur: 1800000, stage: "contact", contact: "+225 05 87 65 43", email: "ftraore@total.ci", createdAt: "2024-11-28", lastActivity: "2024-12-09", source: "Recommandation" },
  { id: "L003", nom: "Jean-Marc Essoh", entreprise: "Groupe BSTP", secteur: "BTP", valeur: 4500000, stage: "devis", contact: "+225 01 23 45 67", email: "jm.essoh@bstp.ci", createdAt: "2024-11-20", lastActivity: "2024-12-07", source: "Appel entrant" },
  { id: "L004", nom: "Aïcha Coulibaly", entreprise: "Banque Atlantique", secteur: "Finance", valeur: 8200000, stage: "negociation", contact: "+225 20 30 40 50", email: "a.coulibaly@ba.ci", createdAt: "2024-11-10", lastActivity: "2024-12-10", source: "LinkedIn" },
  { id: "L005", nom: "Pierre Dago", entreprise: "CFAO Motors CI", secteur: "Automobile", valeur: 3200000, stage: "gagne", contact: "+225 07 77 88 99", email: "p.dago@cfao.ci", createdAt: "2024-10-15", lastActivity: "2024-12-01", source: "Salon" },
  { id: "L006", nom: "Marie Sanogo", entreprise: "Résidence les Acacias", secteur: "Immobilier", valeur: 1200000, stage: "prospects", contact: "+225 05 11 22 33", email: "m.sanogo@acacias.ci", createdAt: "2024-12-05", lastActivity: "2024-12-05", source: "Site web" },
  { id: "L007", nom: "Issa Ouédraogo", entreprise: "SuperMarché City", secteur: "Commerce", valeur: 950000, stage: "contact", contact: "+225 01 44 55 66", email: "i.ouedraogo@city.ci", createdAt: "2024-11-30", lastActivity: "2024-12-08", source: "Appel entrant" },
  { id: "L008", nom: "Sophie Krou", entreprise: "Hôtel Ivoire Boutique", secteur: "Hôtellerie", valeur: 5600000, stage: "devis", contact: "+225 20 21 22 23", email: "s.krou@hib.ci", createdAt: "2024-11-15", lastActivity: "2024-12-06", source: "Recommandation" },
  { id: "L009", nom: "Arnaud Koffi", entreprise: "Usine Choco CI", secteur: "Industrie", valeur: 12000000, stage: "negociation", contact: "+225 07 98 76 54", email: "a.koffi@choco.ci", createdAt: "2024-10-01", lastActivity: "2024-12-09", source: "Appel entrant" },
  { id: "L010", nom: "Christiane Amoikon", entreprise: "Cabinet Médical Amoikon", secteur: "Santé", valeur: 780000, stage: "perdu", contact: "+225 05 32 10 98", email: "c.amoikon@cabinet.ci", createdAt: "2024-09-15", lastActivity: "2024-11-01", source: "Site web" },
];

const SECTEUR_COLORS: Record<string, string> = {
  "Santé": "bg-emerald-500/10 text-emerald-600",
  "Énergie": "bg-yellow-500/10 text-yellow-600",
  "BTP": "bg-orange-500/10 text-orange-500",
  "Finance": "bg-primary/10 text-primary",
  "Automobile": "bg-blue-500/10 text-blue-600",
  "Immobilier": "bg-purple-500/10 text-purple-600",
  "Commerce": "bg-pink-500/10 text-pink-600",
  "Hôtellerie": "bg-amber-500/10 text-amber-600",
  "Industrie": "bg-grey-text/10 text-grey-text dark:text-white/60",
};

export default function CRMPage() {
  // Données API
  const { data: pipelineData, isLoading: pipelineLoading, refetch } = usePipeline();
  const { data: statsData } = useCrmStats();
  const moveLead = useMoveLead();

  // État local pour la recherche et la vue
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"kanban" | "liste">("kanban");
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Sync données API → état local (hybride pour DnD optimiste)
  useEffect(() => {
    if (pipelineData?.pipeline) {
      const stageMap: Record<string, Stage> = {
        PROSPECT: 'prospects', CONTACT: 'contact', DEVIS: 'devis',
        NEGOCIATION: 'negociation', GAGNE: 'gagne', PERDU: 'perdu',
      };
      const apiLeads: Lead[] = Object.entries(pipelineData.pipeline).flatMap(
        ([stage, items]) => (items as any[]).map((item: any) => ({
          id: item.id,
          nom: item.nom,
          entreprise: item.entreprise ?? '',
          secteur: item.source ?? 'Autre',
          valeur: item.montant ?? 0,
          stage: stageMap[stage] ?? 'prospects',
          contact: item.telephone ?? '',
          email: item.email ?? '',
          createdAt: item.createdAt?.slice(0, 10) ?? '',
          lastActivity: item.updatedAt?.slice(0, 10) ?? '',
          source: item.source ?? '',
        }))
      );
      if (apiLeads.length > 0) setLeads(apiLeads);
    }
  }, [pipelineData]);

  const filtered = leads.filter(
    (l) => l.nom.toLowerCase().includes(search.toLowerCase()) ||
      l.entreprise.toLowerCase().includes(search.toLowerCase())
  );

  const moveToStage = async (leadId: string, stage: Stage) => {
    // Mise à jour optimiste locale
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, stage } : l));
    // Sync API
    const stageMap: Record<Stage, string> = {
      prospects: 'PROSPECT', contact: 'CONTACT', devis: 'DEVIS',
      negociation: 'NEGOCIATION', gagne: 'GAGNE', perdu: 'PERDU',
    };
    moveLead.mutate({ id: leadId, stage: stageMap[stage] });
  };

  const totalPipeline = statsData?.pipeline ?? leads.filter((l) => !["gagne", "perdu"].includes(l.stage)).reduce((s, l) => s + l.valeur, 0);
  const wonValue = leads.filter((l) => l.stage === "gagne").reduce((s, l) => s + l.valeur, 0);
  const conversionRate = statsData?.conversionRate ?? Math.round((leads.filter((l) => l.stage === "gagne").length / Math.max(leads.length, 1)) * 100);

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">CRM Pipeline</h1>
          <p className="text-sm text-grey-text dark:text-white/50">{leads.length} prospects actifs</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" aria-hidden="true" /> Nouveau prospect
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pipeline total", value: formatCurrency(totalPipeline), icon: DollarSign, color: "bg-primary/10 text-primary" },
          { label: "Deals gagnés", value: formatCurrency(wonValue), icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-600" },
          { label: "Taux de conversion", value: `${conversionRate}%`, icon: TrendingUp, color: "bg-yellow-500/10 text-yellow-600" },
          { label: "Prospects actifs", value: leads.filter((l) => !["gagne", "perdu"].includes(l.stage)).length.toString(), icon: Users, color: "bg-accent/10 text-accent" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="font-heading font-extrabold text-xl text-grey-anthracite dark:text-white">{value}</div>
            <div className="text-xs text-grey-text dark:text-white/50 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-text dark:text-white/30" aria-hidden="true" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un prospect..." className="form-input pl-9 text-sm" />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-border">
          {(["kanban", "liste"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn("px-3 py-2 text-xs font-heading font-semibold capitalize transition-colors", view === v ? "bg-primary text-white" : "bg-white dark:bg-[#0D1F4E] text-grey-text dark:text-white/60 hover:text-primary")}
              aria-pressed={view === v}
            >
              {v === "kanban" ? "🗂 Kanban" : "☰ Liste"}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-heading font-semibold text-grey-text dark:text-white/60 hover:text-primary">
          <Filter className="w-3.5 h-3.5" aria-hidden="true" /> Filtres
        </button>
      </div>

      {/* Kanban board */}
      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = filtered.filter((l) => l.stage === stage.id);
            const stageValue = stageLeads.reduce((s, l) => s + l.valeur, 0);
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-64"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => draggedId && moveToStage(draggedId, stage.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-heading font-bold text-sm", stage.color)}>{stage.label}</span>
                    <span className={cn("text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full", stage.bgColor, stage.color)}>{stageLeads.length}</span>
                  </div>
                  {stageLeads.length > 0 && <span className="text-[10px] text-grey-text dark:text-white/40">{formatCurrency(stageValue)}</span>}
                </div>

                <div className="space-y-2 min-h-[200px]">
                  {stageLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      layout
                      draggable
                      onDragStart={() => setDraggedId(lead.id)}
                      onDragEnd={() => setDraggedId(null)}
                      className={cn(
                        "bg-white dark:bg-[#0D1F4E] rounded-xl border border-border p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow",
                        draggedId === lead.id && "opacity-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <div className="font-heading font-bold text-sm text-grey-anthracite dark:text-white truncate">{lead.entreprise}</div>
                          <div className="text-xs text-grey-text dark:text-white/50 truncate">{lead.nom}</div>
                        </div>
                        <button className="text-grey-text dark:text-white/30 hover:text-primary flex-shrink-0" aria-label="Options">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 mb-2">
                        <span className={cn("text-[10px] font-heading font-semibold px-1.5 py-0.5 rounded-full", SECTEUR_COLORS[lead.secteur] || "bg-grey-light text-grey-text")}>{lead.secteur}</span>
                      </div>

                      <div className="font-heading font-bold text-sm text-primary mb-2">{formatCurrency(lead.valeur)}</div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <a href={`tel:${lead.contact}`} className="text-grey-text dark:text-white/30 hover:text-primary" aria-label="Appeler">
                            <Phone className="w-3 h-3" />
                          </a>
                          <a href={`mailto:${lead.email}`} className="text-grey-text dark:text-white/30 hover:text-primary" aria-label="Email">
                            <Mail className="w-3 h-3" />
                          </a>
                        </div>
                        <span className="text-[10px] text-grey-text dark:text-white/30 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" aria-hidden="true" /> {formatRelativeTime(lead.lastActivity)}
                        </span>
                      </div>

                      {/* Quick move */}
                      <select
                        value={lead.stage}
                        onChange={(e) => moveToStage(lead.id, e.target.value as Stage)}
                        className="mt-2 w-full text-[10px] bg-grey-light dark:bg-white/5 border border-border rounded-lg px-2 py-1 text-grey-anthracite dark:text-white font-heading font-semibold"
                        aria-label="Déplacer dans le pipeline"
                      >
                        {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </motion.div>
                  ))}

                  {/* Drop zone hint */}
                  {draggedId && (
                    <div className={cn("border-2 border-dashed rounded-xl p-4 text-center text-xs text-grey-text dark:text-white/30", stage.bgColor, "border-current")}>
                      Déposer ici
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === "liste" && (
        <div className="bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border overflow-hidden shadow-sm">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-border">
                {["Entreprise", "Contact", "Secteur", "Valeur", "Étape", "Dernière activité", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-heading font-bold text-grey-text dark:text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((lead) => {
                const stage = STAGES.find((s) => s.id === lead.stage)!;
                return (
                  <tr key={lead.id} className="hover:bg-grey-light/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-heading font-semibold text-grey-anthracite dark:text-white">{lead.entreprise}</div>
                      <div className="text-xs text-grey-text dark:text-white/40">{lead.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-grey-anthracite dark:text-white">{lead.nom}</div>
                      <div className="text-xs text-grey-text dark:text-white/40">{lead.contact}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-heading font-semibold px-2 py-1 rounded-full", SECTEUR_COLORS[lead.secteur] || "bg-grey-light text-grey-text")}>{lead.secteur}</span>
                    </td>
                    <td className="px-4 py-3 font-heading font-bold text-grey-anthracite dark:text-white">{formatCurrency(lead.valeur)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-heading font-semibold px-2 py-1 rounded-full", stage.bgColor, stage.color)}>{stage.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-grey-text dark:text-white/40">{formatRelativeTime(lead.lastActivity)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a href={`tel:${lead.contact}`} className="text-grey-text dark:text-white/30 hover:text-primary" aria-label="Appeler">
                          <Phone className="w-4 h-4" />
                        </a>
                        <a href={`mailto:${lead.email}`} className="text-grey-text dark:text-white/30 hover:text-primary" aria-label="Email">
                          <Mail className="w-4 h-4" />
                        </a>
                        <button className="text-grey-text dark:text-white/30 hover:text-primary" aria-label="Plus d'actions">
                          <MoreVertical className="w-4 h-4" />
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
    </div>
  );
}
