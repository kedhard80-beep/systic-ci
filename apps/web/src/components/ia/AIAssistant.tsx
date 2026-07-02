"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, X, Send, Loader2, Bot, User,
  Minimize2, Maximize2, Sparkles,
} from "lucide-react";

const QUICK_QUESTIONS = [
  "Quels sont vos services de vidéosurveillance ?",
  "Comment obtenir un devis gratuit ?",
  "Quelles formations proposez-vous ?",
  "Quelles sont vos zones d'intervention ?",
];

const MOCK_RESPONSES: Record<string, string> = {
  "vidéosurveillance": "Nous installons des systèmes de vidéosurveillance IP haute définition (HD/4K) avec caméras dôme, tube, PTZ et fisheye. Nos solutions incluent : NVR/DVR, vision nocturne, analyse comportementale IA, accès à distance 24h/24. Marques : Hikvision, Dahua, Axis. Vous souhaitez un devis gratuit ?",
  "devis": "Obtenir un devis est simple et gratuit !\n\n1. Remplissez notre formulaire en ligne sur /devis\n2. Ou appelez-nous au 01 73 03 25 25\n3. Nos ingénieurs se déplacent pour un audit sur site\n4. Vous recevez un devis détaillé sous 24h ouvrables\n\nTous nos devis sont gratuits et sans engagement.",
  "formation": "Notre Académie SYSTIC-CI propose 6 modules certifiants :\n\n• M1 : Vidéosurveillance & CCTV (4 semaines)\n• M2 : Contrôle d'accès & biométrie (3 sem.)\n• M3 : Réseaux informatiques (5 sem.)\n• M4 : Électricité BT (4 sem.)\n• M5 : Domotique & Smart Building (3 sem.)\n• M6 : Alarme & détection incendie (3 sem.)\n\n90% de pratique en atelier réel. Les meilleurs profils rejoignent notre équipe ! Intéressé(e) ?",
  "intervention": "Nous intervenons principalement à Abidjan et dans toute la Côte d'Ivoire.\n\n📍 Bureau : Angré GESTOCI, Cocody, Abidjan\n🕐 Terrain : 7j/7, 07h00 – 23h00\n📞 Urgences : 01 73 03 25 25\n\nPour les projets à l'intérieur du pays, contactez-nous pour évaluer les conditions d'intervention.",
  "default": "Bonjour ! Je suis l'assistant IA de SYSTIC-CI. Je peux vous aider avec :\n\n• Informations sur nos services (vidéosurveillance, réseaux, électricité)\n• Demande de devis gratuit\n• Nos formations certifiantes\n• Prise de rendez-vous\n\nQue puis-je faire pour vous ?",
};

function getResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("vidéo") || lower.includes("caméra") || lower.includes("surveillance")) return MOCK_RESPONSES["vidéosurveillance"];
  if (lower.includes("devis") || lower.includes("prix") || lower.includes("tarif") || lower.includes("coût")) return MOCK_RESPONSES["devis"];
  if (lower.includes("formation") || lower.includes("cours") || lower.includes("académie") || lower.includes("module")) return MOCK_RESPONSES["formation"];
  if (lower.includes("zone") || lower.includes("intervien") || lower.includes("abidjan") || lower.includes("côte")) return MOCK_RESPONSES["intervention"];
  return MOCK_RESPONSES["default"];
}

type Message = { role: "user" | "assistant"; text: string; time: Date };

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Bonjour ! Je suis l'assistant IA de SYSTIC-CI 👋\n\nComment puis-je vous aider aujourd'hui ?", time: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
    const response = getResponse(text);
    setMessages((prev) => [...prev, { role: "assistant", text: response, time: new Date() }]);
    setLoading(false);
  };

  return (
    <>
      {/* Trigger button */}
      {!open && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, type: "spring" }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary rounded-full shadow-glow flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Ouvrir l'assistant IA"
        >
          <Bot className="w-6 h-6 text-white" aria-hidden="true" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-white" aria-hidden="true" />
          </span>
        </motion.button>
      )}

      {/* Chat widget */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#0D1F4E] rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col"
            style={{ maxHeight: minimized ? "auto" : "520px" }}
            role="dialog"
            aria-label="Assistant IA SYSTIC-CI"
            aria-modal="true"
          >
            {/* Header */}
            <div className="bg-gradient-hero text-white p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="font-heading font-bold text-sm">Assistant SYSTIC-CI</div>
                <div className="flex items-center gap-1 text-xs text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  En ligne · Répond en quelques secondes
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setMinimized(!minimized)} className="p-1.5 hover:bg-white/10 rounded-lg" aria-label={minimized ? "Agrandir" : "Réduire"}>
                  {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg" aria-label="Fermer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ maxHeight: "300px" }}>
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2.5 text-sm whitespace-pre-line ${msg.role === "user"
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-grey-light dark:bg-white/10 text-grey-anthracite dark:text-white rounded-bl-sm"
                      }`}>
                        {msg.text}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                      </div>
                      <div className="bg-grey-light dark:bg-white/10 rounded-2xl rounded-bl-sm px-3 py-2.5">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div key={i} className="w-1.5 h-1.5 bg-grey-text dark:bg-white/40 rounded-full"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ delay: i * 0.15, repeat: Infinity, duration: 0.8 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Quick questions */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-xs font-heading font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                      placeholder="Posez votre question..."
                      className="flex-1 text-sm bg-grey-light dark:bg-white/5 border border-border rounded-xl px-3 py-2 text-grey-anthracite dark:text-white placeholder:text-grey-text dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      disabled={loading}
                      aria-label="Message pour l'assistant"
                    />
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || loading}
                      className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                      aria-label="Envoyer"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-grey-text dark:text-white/30 mt-1.5 text-center">
                    Propulsé par IA · SYSTIC-CI
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
