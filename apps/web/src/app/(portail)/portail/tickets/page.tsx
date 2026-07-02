"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, Plus, Search, Clock, CheckCircle2,
  AlertCircle, ArrowRight, Send, Loader2, X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";

const TICKETS = [
  {
    id: "TKT-0025",
    sujet: "Caméra 12 — image floue depuis hier",
    categorie: "Technique",
    statut: "OUVERT",
    priorite: "HAUTE",
    createdAt: "2024-12-10T08:30:00",
    updatedAt: "2024-12-10T14:00:00",
    messages: [
      { from: "client", text: "La caméra numéro 12 (entrée parking) affiche une image très floue depuis hier matin. Pouvez-vous intervenir ?", time: "2024-12-10T08:30:00" },
      { from: "support", text: "Bonjour, nous avons bien noté votre signalement. Notre technicien va diagnostiquer le problème à distance et revenir vers vous sous 2h.", time: "2024-12-10T14:00:00" },
    ],
  },
  {
    id: "TKT-0024",
    sujet: "Demande d'accès badgeuse bureau 5",
    categorie: "Accès",
    statut: "RESOLU",
    priorite: "NORMALE",
    createdAt: "2024-11-25T10:00:00",
    updatedAt: "2024-11-26T09:00:00",
    messages: [
      { from: "client", text: "Je souhaite ajouter un accès badge pour Mme Fatou Koné au bureau 5.", time: "2024-11-25T10:00:00" },
      { from: "support", text: "L'accès a été configuré. Le badge 4521 est maintenant actif pour Mme Koné sur le bureau 5, du lundi au vendredi 07h-19h.", time: "2024-11-26T09:00:00" },
    ],
  },
  {
    id: "TKT-0023",
    sujet: "NVR hors ligne — pas d'enregistrement",
    categorie: "Technique",
    statut: "RESOLU",
    priorite: "URGENTE",
    createdAt: "2024-11-10T07:00:00",
    updatedAt: "2024-11-10T11:30:00",
    messages: [
      { from: "client", text: "Le NVR est hors ligne depuis ce matin. Plus d'enregistrements.", time: "2024-11-10T07:00:00" },
      { from: "support", text: "Intervention réalisée. Problème d'alimentation du NVR résolu. Les enregistrements reprennent normalement. Recommandation : vérification préventive prévue le mois prochain.", time: "2024-11-10T11:30:00" },
    ],
  },
];

const TICKET_STATUS: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  OUVERT: { label: "Ouvert", color: "bg-primary/10 text-primary", icon: MessageSquare },
  EN_COURS: { label: "En cours", color: "bg-yellow-500/10 text-yellow-600", icon: Clock },
  RESOLU: { label: "Résolu", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle2 },
};

const PRIORITY_COLORS: Record<string, string> = {
  URGENTE: "bg-accent/10 text-accent",
  HAUTE: "bg-orange-500/10 text-orange-500",
  NORMALE: "bg-grey-text/10 text-grey-text dark:bg-white/10 dark:text-white/50",
};

const newTicketSchema = z.object({
  sujet: z.string().min(5, "Sujet requis"),
  categorie: z.string().min(1, "Catégorie requise"),
  priorite: z.string().min(1, "Priorité requise"),
  description: z.string().min(20, "Au moins 20 caractères"),
});

type NewTicketForm = z.infer<typeof newTicketSchema>;

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<typeof TICKETS[0] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const filtered = TICKETS.filter(
    (t) => t.sujet.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())
  );

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<NewTicketForm>({ resolver: zodResolver(newTicketSchema) });

  const onCreateTicket = async (data: NewTicketForm) => {
    await new Promise((r) => setTimeout(r, 1000));
    reset();
    setShowForm(false);
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-grey-anthracite dark:text-white">Support & Tickets</h1>
          <p className="text-sm text-grey-text dark:text-white/50 mt-0.5">{TICKETS.length} ticket(s) au total</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" aria-hidden="true" /> Nouveau ticket
        </button>
      </div>

      {/* New ticket form modal */}
      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-[#0D1F4E] rounded-3xl border border-border w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-lg text-grey-anthracite dark:text-white">Nouveau ticket</h2>
              <button onClick={() => setShowForm(false)} className="text-grey-text dark:text-white/40 hover:text-primary" aria-label="Fermer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onCreateTicket)} className="space-y-4">
              <div>
                <label htmlFor="sujet-ticket" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-1">Sujet *</label>
                <input id="sujet-ticket" {...register("sujet")} className={cn("form-input", errors.sujet && "border-accent")} placeholder="Décrivez le problème en quelques mots" />
                {errors.sujet && <p className="text-xs text-accent mt-1">{errors.sujet.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="categorie-ticket" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-1">Catégorie</label>
                  <select id="categorie-ticket" {...register("categorie")} className={cn("form-input", errors.categorie && "border-accent")}>
                    <option value="">Choisir...</option>
                    <option value="Technique">Technique</option>
                    <option value="Accès">Accès & Badges</option>
                    <option value="Facturation">Facturation</option>
                    <option value="Contrat">Contrat</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="priorite-ticket" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-1">Priorité</label>
                  <select id="priorite-ticket" {...register("priorite")} className="form-input">
                    <option value="NORMALE">Normale</option>
                    <option value="HAUTE">Haute</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="description-ticket" className="block text-sm font-heading font-semibold text-grey-anthracite dark:text-white mb-1">Description *</label>
                <textarea id="description-ticket" {...register("description")} rows={4} className={cn("form-input resize-none", errors.description && "border-accent")} placeholder="Décrivez le problème en détail..." />
                {errors.description && <p className="text-xs text-accent mt-1">{errors.description.message}</p>}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-heading font-semibold text-grey-anthracite dark:text-white hover:bg-grey-light dark:hover:bg-white/5">
                  Annuler
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <><Send className="w-4 h-4" aria-hidden="true" /> Envoyer</>}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Ticket list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-text dark:text-white/30" aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="form-input pl-9 text-sm"
            />
          </div>

          {filtered.map((ticket) => {
            const status = TICKET_STATUS[ticket.statut];
            const StatusIcon = status.icon;
            return (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={cn(
                  "w-full text-left bg-white dark:bg-[#0D1F4E] rounded-2xl border p-4 transition-all hover:-translate-y-0.5",
                  selectedTicket?.id === ticket.id ? "border-primary shadow-sm" : "border-border"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-heading font-bold text-grey-text dark:text-white/40">{ticket.id}</span>
                  <span className={`text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${status.color}`}>{status.label}</span>
                </div>
                <h3 className="text-sm font-heading font-semibold text-grey-anthracite dark:text-white leading-snug mb-1">{ticket.sujet}</h3>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-heading font-semibold px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[ticket.priorite]}`}>{ticket.priorite}</span>
                  <span className="text-[10px] text-grey-text dark:text-white/30">{formatRelativeTime(ticket.updatedAt)}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Chat panel */}
        <div className="lg:col-span-3">
          {selectedTicket ? (
            <motion.div key={selectedTicket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border h-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-heading font-bold text-grey-text dark:text-white/40">{selectedTicket.id}</span>
                      <span className={`text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full ${TICKET_STATUS[selectedTicket.statut].color}`}>{TICKET_STATUS[selectedTicket.statut].label}</span>
                    </div>
                    <h2 className="font-heading font-bold text-base text-grey-anthracite dark:text-white">{selectedTicket.sujet}</h2>
                    <p className="text-xs text-grey-text dark:text-white/40 mt-0.5">Créé le {formatDate(selectedTicket.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
                {selectedTicket.messages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.from === "client" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[80%] rounded-2xl p-3 text-sm",
                      msg.from === "client"
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-grey-light dark:bg-white/10 text-grey-anthracite dark:text-white rounded-bl-sm"
                    )}>
                      <p className="leading-relaxed">{msg.text}</p>
                      <p className={cn("text-[10px] mt-1", msg.from === "client" ? "text-white/60" : "text-grey-text dark:text-white/40")}>
                        {new Date(msg.time).toLocaleString("fr-CI")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply */}
              {selectedTicket.statut !== "RESOLU" && (
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Votre message..."
                      className="form-input flex-1 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && setNewMessage("")}
                    />
                    <button
                      onClick={() => setNewMessage("")}
                      disabled={!newMessage}
                      className="btn-primary px-3 py-2"
                      aria-label="Envoyer"
                    >
                      <Send className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center bg-white dark:bg-[#0D1F4E] rounded-2xl border border-border min-h-[400px]">
              <div className="text-center">
                <MessageSquare className="w-10 h-10 text-grey-text dark:text-white/20 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm text-grey-text dark:text-white/40">Sélectionnez un ticket pour voir la conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
