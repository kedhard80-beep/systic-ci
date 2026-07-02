"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Clock, CheckCircle2, AlertCircle, Wrench,
  Camera, ChevronRight, Navigation, FileText, Package,
  User, Phone, ArrowRight, CheckSquare, Circle, Loader2,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { useUser } from "@/lib/store/auth.store";
import { useTodayMissions, useTechnicienStats, useUpdateMissionStatus } from "@/hooks/useTechnicien";

/* ─── Static types ─── */
const STATUT_STYLES: Record<string, string> = {
  EN_COURS:   "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  PLANIFIEE:  "bg-primary/10 text-primary",
  TERMINEE:   "bg-grey-text/10 text-grey-text",
  URGENTE:    "bg-accent/10 text-accent",
};
const STATUT_LABELS: Record<string, string> = {
  EN_COURS:  "En cours",
  PLANIFIEE: "Planifiée",
  TERMINEE:  "Terminée",
};

/* ─── Skeleton ─── */
function MissionSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border p-4 animate-pulse flex items-center gap-4">
      <div className="flex-shrink-0 w-12 space-y-1">
        <div className="h-5 w-12 bg-grey-light dark:bg-white/10 rounded" />
        <div className="h-3 w-8 bg-grey-light dark:bg-white/5 rounded" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-3 w-20 bg-grey-light dark:bg-white/10 rounded" />
        <div className="h-4 w-40 bg-grey-light dark:bg-white/10 rounded" />
        <div className="h-3 w-32 bg-grey-light dark:bg-white/5 rounded" />
      </div>
    </div>
  );
}

/* ─── Checklist (local state only — persisted per session) ─── */
function ChecklistPanel({ mission, checklist, onToggle, progress, doneCount }: {
  mission: any;
  checklist: { id: number; task: string; done: boolean }[];
  onToggle: (id: number) => void;
  progress: number;
  doneCount: number;
}) {
  const updateStatus = useUpdateMissionStatus();

  return (
    <div className="bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-base text-grey-anthracite dark:text-white flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" aria-hidden="true" /> Checklist
        </h3>
        <span className="text-xs font-heading font-semibold text-primary">{doneCount}/{checklist.length}</span>
      </div>

      <div className="w-full bg-grey-light dark:bg-white/10 rounded-full h-2 mb-4">
        <motion.div
          className="bg-primary h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="space-y-2">
        {checklist.length === 0 ? (
          <p className="text-sm text-grey-text dark:text-white/40 text-center py-4">Aucun point de checklist.</p>
        ) : (
          checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={cn(
                "w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all",
                item.done ? "bg-emerald-500/5" : "hover:bg-grey-light dark:hover:bg-white/5"
              )}
              aria-pressed={item.done}
            >
              {item.done
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                : <Circle className="w-4 h-4 text-grey-text dark:text-white/30 flex-shrink-0 mt-0.5" aria-hidden="true" />
              }
              <span className={cn("text-sm leading-relaxed", item.done ? "line-through text-grey-text dark:text-white/40" : "text-grey-anthracite dark:text-white")}>
                {item.task}
              </span>
            </button>
          ))
        )}
      </div>

      {progress === 100 && checklist.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => updateStatus.mutate({ id: mission.id, status: 'TERMINEE' })}
          disabled={updateStatus.isPending}
          className="btn-primary w-full mt-4 text-sm"
        >
          {updateStatus.isPending
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Mise à jour...</>
            : <><FileText className="w-4 h-4" aria-hidden="true" /> Clôturer &amp; Faire signer</>
          }
        </motion.button>
      )}
    </div>
  );
}

/* ─── Main ─── */
export default function TechnicienDashboard() {
  const user = useUser();
  const { data: missionsData, isLoading } = useTodayMissions();
  const { data: statsData } = useTechnicienStats();

  // Build missions list from API or use static fallback
  const apiMissions: any[] = missionsData?.data ?? [];

  // Local checklist state (keyed by mission ID)
  const buildDefaultChecklist = (mission: any) => {
    if (mission.checklist && Array.isArray(mission.checklist)) {
      return mission.checklist.map((t: any, i: number) => ({
        id: i + 1, task: typeof t === 'string' ? t : t.task, done: t.done ?? false,
      }));
    }
    return [];
  };

  const [localChecklists, setLocalChecklists] = useState<Record<string, { id: number; task: string; done: boolean }[]>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // When missions load, initialize checklists
  React.useEffect(() => {
    if (apiMissions.length > 0) {
      setLocalChecklists((prev) => {
        const next = { ...prev };
        for (const m of apiMissions) {
          if (!next[m.id]) next[m.id] = buildDefaultChecklist(m);
        }
        return next;
      });
      if (!selectedId) setSelectedId(apiMissions[0]?.id ?? null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiMissions.length]);

  const selectedMission = apiMissions.find((m) => m.id === selectedId) ?? apiMissions[0] ?? null;
  const currentChecklist = selectedMission ? (localChecklists[selectedMission.id] ?? []) : [];
  const doneCount = currentChecklist.filter((i) => i.done).length;
  const progress = currentChecklist.length > 0 ? Math.round((doneCount / currentChecklist.length) * 100) : 0;

  const toggleCheckItem = (missionId: string, itemId: number) => {
    setLocalChecklists((prev) => ({
      ...prev,
      [missionId]: (prev[missionId] ?? []).map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      ),
    }));
  };

  const materiaux = selectedMission?.products ?? selectedMission?.materiaux ?? [];
  const [matQte, setMatQte] = useState<Record<string, number>>({});

  const getQte = (ref: string, defaultQte: number) => matQte[ref] ?? defaultQte;
  const adjustQte = (ref: string, defaultQte: number, delta: number) => {
    setMatQte((prev) => ({ ...prev, [ref]: Math.max(0, getQte(ref, defaultQte) + delta) }));
  };

  const firstName = user?.firstName ?? "Technicien";
  const totalMissions = statsData?.total ?? apiMissions.length;

  return (
    <div className="max-w-6xl space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">
            Bonjour, {firstName} 👷
          </h1>
          <p className="text-sm text-grey-text dark:text-white/50">
            {user?.role ?? "Technicien"} ·{" "}
            {new Date().toLocaleDateString("fr-CI", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="text-right">
          <div className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-primary ml-auto" /> : apiMissions.length}
          </div>
          <div className="text-xs text-grey-text dark:text-white/50">missions aujourd&apos;hui</div>
        </div>
      </motion.div>

      {/* Stats rapides */}
      {statsData && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { label: "Total missions", value: statsData.total ?? 0 },
            { label: "Ce mois", value: statsData.thisMonth ?? 0 },
            { label: "Terminées", value: statsData.completed ?? 0 },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border p-4 text-center">
              <div className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">{s.value}</div>
              <div className="text-xs text-grey-text dark:text-white/50 mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Mission timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <h2 className="font-heading font-bold text-sm text-grey-text dark:text-white/50 uppercase tracking-wider mb-3">
          Planning du jour
        </h2>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <MissionSkeleton key={i} />)}
          </div>
        ) : apiMissions.length === 0 ? (
          <div className="bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" aria-hidden="true" />
            <p className="font-heading font-semibold text-grey-anthracite dark:text-white">Aucune mission planifiée aujourd&apos;hui</p>
          </div>
        ) : (
          <div className="space-y-2">
            {apiMissions.map((mission) => {
              const heure = mission.scheduledAt
                ? new Date(mission.scheduledAt).toLocaleTimeString("fr-CI", { hour: "2-digit", minute: "2-digit" })
                : mission.heure ?? "—";
              const isUrgent = mission.priority === "URGENTE" || mission.urgency === "HIGH";

              return (
                <button
                  key={mission.id}
                  onClick={() => setSelectedId(mission.id)}
                  className={cn(
                    "w-full text-left bg-white dark:bg-[#0D1F4E] rounded-2xl border p-4 transition-all flex items-center gap-4",
                    selectedId === mission.id ? "border-primary shadow-sm" : "border-border hover:border-primary/30"
                  )}
                  aria-pressed={selectedId === mission.id}
                >
                  <div className="flex-shrink-0 w-12 text-center">
                    <div className="font-heading font-bold text-lg text-grey-anthracite dark:text-white">{heure}</div>
                    <div className="text-[10px] text-grey-text dark:text-white/40">{mission.estimatedDuration ?? "—"}</div>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className={cn(
                      "w-3 h-3 rounded-full flex-shrink-0",
                      mission.status === "EN_COURS" ? "bg-emerald-500" : isUrgent ? "bg-accent" : "bg-primary/40"
                    )} />
                    <div className="w-px h-6 bg-border" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {mission.status && (
                        <span className={cn("text-[10px] font-heading font-bold px-2 py-0.5 rounded-full", STATUT_STYLES[mission.status])}>
                          {STATUT_LABELS[mission.status] ?? mission.status}
                        </span>
                      )}
                      {isUrgent && (
                        <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent">URGENT</span>
                      )}
                    </div>
                    <div className="font-heading font-bold text-sm text-grey-anthracite dark:text-white truncate">
                      {mission.client?.company ?? mission.client?.name ?? mission.title ?? "Mission"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-grey-text dark:text-white/40">
                      <MapPin className="w-3 h-3" aria-hidden="true" />
                      {mission.address ?? mission.client?.address ?? "—"}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-grey-text dark:text-white/30 flex-shrink-0" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Selected mission detail */}
      {selectedMission && (
        <motion.div
          key={selectedMission.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
          {/* Mission info */}
          <div className="bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-primary" aria-hidden="true" />
              <h3 className="font-heading font-bold text-base text-grey-anthracite dark:text-white">
                {selectedMission.type ?? selectedMission.title ?? "Mission"}
              </h3>
            </div>
            <p className="text-sm text-grey-text dark:text-white/60 leading-relaxed">
              {selectedMission.description ?? "Pas de description."}
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-grey-light dark:bg-white/5">
                <User className="w-4 h-4 text-grey-text dark:text-white/40 flex-shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-xs text-grey-text dark:text-white/40">Client</div>
                  <div className="text-sm font-heading font-semibold text-grey-anthracite dark:text-white">
                    {selectedMission.client?.company ?? selectedMission.client?.name ?? "—"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-grey-light dark:bg-white/5">
                <MapPin className="w-4 h-4 text-grey-text dark:text-white/40 flex-shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-xs text-grey-text dark:text-white/40">Adresse</div>
                  <div className="text-sm font-heading font-semibold text-grey-anthracite dark:text-white">
                    {selectedMission.address ?? selectedMission.client?.address ?? "—"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-grey-light dark:bg-white/5">
                <Phone className="w-4 h-4 text-grey-text dark:text-white/40 flex-shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-xs text-grey-text dark:text-white/40">Contact</div>
                  <div className="text-sm font-heading font-semibold text-grey-anthracite dark:text-white">
                    {selectedMission.client?.phone ?? selectedMission.contactPhone ?? "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-heading font-semibold px-3 py-2 rounded-xl bg-primary text-white hover:bg-primary/90"
                onClick={() => {
                  const address = selectedMission.address ?? selectedMission.client?.address;
                  if (address) window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
                }}
              >
                <Navigation className="w-3.5 h-3.5" aria-hidden="true" /> Navigation GPS
              </button>
              <button className="flex items-center justify-center gap-1.5 text-xs font-heading font-semibold px-3 py-2 rounded-xl border border-border hover:bg-grey-light dark:hover:bg-white/5 text-grey-anthracite dark:text-white">
                <Camera className="w-3.5 h-3.5" aria-hidden="true" /> Photos
              </button>
            </div>
          </div>

          {/* Checklist */}
          <ChecklistPanel
            mission={selectedMission}
            checklist={currentChecklist}
            onToggle={(itemId) => toggleCheckItem(selectedMission.id, itemId)}
            progress={progress}
            doneCount={doneCount}
          />

          {/* Matériel */}
          <div className="bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border p-5">
            <h3 className="font-heading font-bold text-base text-grey-anthracite dark:text-white flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-primary" aria-hidden="true" /> Matériel utilisé
            </h3>

            {materiaux.length === 0 ? (
              <p className="text-sm text-grey-text dark:text-white/40 text-center py-4">Aucun matériel listé.</p>
            ) : (
              <div className="space-y-3">
                {materiaux.map((mat: any) => {
                  const ref = mat.ref ?? mat.id ?? mat.sku ?? String(Math.random());
                  const defaultQte = mat.qte ?? mat.quantity ?? 1;
                  return (
                    <div key={ref} className="flex items-center justify-between p-3 rounded-xl bg-grey-light dark:bg-white/5">
                      <div className="min-w-0">
                        <div className="text-xs text-grey-text dark:text-white/40 mb-0.5">{mat.ref ?? mat.sku ?? mat.id}</div>
                        <div className="text-sm font-heading font-semibold text-grey-anthracite dark:text-white truncate">
                          {mat.label ?? mat.name ?? "Produit"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <button onClick={() => adjustQte(ref, defaultQte, -1)} className="w-6 h-6 rounded-lg bg-white dark:bg-white/10 border border-border text-grey-anthracite dark:text-white text-xs font-heading font-bold hover:bg-grey-light">−</button>
                        <span className="w-6 text-center text-sm font-heading font-bold text-grey-anthracite dark:text-white">{getQte(ref, defaultQte)}</span>
                        <button onClick={() => adjustQte(ref, defaultQte, +1)} className="w-6 h-6 rounded-lg bg-white dark:bg-white/10 border border-border text-grey-anthracite dark:text-white text-xs font-heading font-bold hover:bg-grey-light">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-grey-text dark:text-white/50">Total lignes</span>
                <span className="font-heading font-bold text-grey-anthracite dark:text-white">{materiaux.length}</span>
              </div>
              <button className="w-full flex items-center justify-center gap-1.5 text-xs font-heading font-semibold px-3 py-2.5 rounded-xl border border-border hover:bg-grey-light dark:hover:bg-white/5 text-grey-anthracite dark:text-white">
                <AlertCircle className="w-3.5 h-3.5 text-accent" aria-hidden="true" /> Signaler une rupture
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
