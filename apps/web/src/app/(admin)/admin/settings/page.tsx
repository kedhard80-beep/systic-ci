"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, RefreshCw, Save, CheckCircle2 } from "lucide-react";
import apiClient, { getApiError } from "@/lib/api/client";

// Keys match the backend DEFAULT_SETTINGS (dot notation)
const SETTING_GROUPS = [
  {
    label: "Entreprise",
    keys: [
      { key: "company.name",    label: "Nom de l'entreprise" },
      { key: "company.email",   label: "Email" },
      { key: "company.phone",   label: "Téléphone" },
      { key: "company.address", label: "Adresse" },
      { key: "company.currency",label: "Devise" },
      { key: "company.tvaRate", label: "Taux TVA" },
    ],
  },
  {
    label: "Notifications",
    keys: [
      { key: "notification.emailEnabled",     label: "Notifications email" },
      { key: "notification.smsEnabled",       label: "Notifications SMS" },
      { key: "notification.whatsappEnabled",  label: "Notifications WhatsApp" },
    ],
  },
  {
    label: "Facturation",
    keys: [
      { key: "invoice.dueDays",    label: "Délai paiement (jours)" },
      { key: "quote.validityDays", label: "Validité devis (jours)" },
      { key: "maintenance.renewalAlertDays", label: "Alerte renouvellement maintenance (jours)" },
    ],
  },
  {
    label: "Emails",
    keys: [
      { key: "email.senderName",  label: "Nom expéditeur" },
      { key: "email.senderEmail", label: "Email expéditeur" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const qc = useQueryClient();

  // Backend returns Record<string, unknown> — an object, NOT an array
  const { data: settings, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await apiClient.get<Record<string, unknown>>("/settings");
      return res.data; // { "company.name": "SYSTIC-CI", ... }
    },
    retry: 1,
    staleTime: 60_000,
  });

  // Save via PUT /settings (bulk)
  const mutation = useMutation({
    mutationFn: async (updates: Record<string, string>) => {
      await apiClient.put("/settings", updates);
    },
    onSuccess: () => {
      setSaved(true);
      setLocalValues({});
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const getValue = (key: string): string => {
    if (localValues[key] !== undefined) return localValues[key];
    const raw = settings?.[key];
    return raw !== undefined && raw !== null ? String(raw) : "";
  };

  const handleChange = (key: string, value: string) =>
    setLocalValues(prev => ({ ...prev, [key]: value }));

  const handleSave = () => mutation.mutate(localValues);
  const hasChanges = Object.keys(localValues).length > 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Paramètres</h1>
          <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">Configuration de la plateforme</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-grey-text dark:text-white/60 border border-border hover:border-primary hover:text-primary transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-white bg-primary hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </button>
          )}
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" /> Sauvegardé
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-grey-text dark:text-white/50">{getApiError(error)}</div>
      ) : (
        <div className="space-y-6">
          {SETTING_GROUPS.map(group => (
            <div key={group.label} className="bg-white dark:bg-navy/40 rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-grey-light dark:bg-white/5">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <h2 className="font-heading font-bold text-sm text-grey-anthracite dark:text-white">{group.label}</h2>
                </div>
              </div>
              <div className="divide-y divide-border">
                {group.keys.map(({ key, label }) => {
                  const value = getValue(key);
                  const isBool = value === "true" || value === "false" ||
                    typeof settings?.[key] === "boolean";
                  return (
                    <div key={key} className="px-5 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-semibold text-sm text-grey-anthracite dark:text-white">{label}</p>
                        <p className="text-xs text-grey-text dark:text-white/40 mt-0.5 font-mono">{key}</p>
                      </div>
                      <div className="w-64 flex-shrink-0">
                        {isBool ? (
                          <button
                            onClick={() => handleChange(key, value === "true" ? "false" : "true")}
                            className={`relative w-11 h-6 rounded-full transition-colors ${value === "true" ? "bg-primary" : "bg-grey-text/30 dark:bg-white/20"}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value === "true" ? "translate-x-5" : "translate-x-0"}`} />
                          </button>
                        ) : (
                          <input
                            type="text"
                            value={value}
                            onChange={e => handleChange(key, e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-grey-light dark:bg-white/5 text-grey-anthracite dark:text-white focus:outline-none focus:border-primary transition-colors"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
