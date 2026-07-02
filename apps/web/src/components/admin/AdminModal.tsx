"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function AdminModal({ open, onClose, title, children, size = "md" }: AdminModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative bg-white dark:bg-[#0f172a] rounded-2xl border border-border shadow-2xl w-full max-h-[90vh] overflow-y-auto",
        size === "sm" && "max-w-sm",
        size === "md" && "max-w-lg",
        size === "lg" && "max-w-2xl",
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white dark:bg-[#0f172a] z-10">
          <h2 className="font-heading font-bold text-lg text-grey-anthracite dark:text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-grey-light dark:hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-grey-text dark:text-white/60" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Reusable form field styles
export const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-grey-light dark:bg-white/5 text-grey-anthracite dark:text-white placeholder:text-grey-text dark:placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors";
export const labelCls = "block text-xs font-heading font-semibold text-grey-text dark:text-white/60 mb-1.5";
export const btnPrimary = "w-full py-2.5 rounded-xl bg-primary text-white font-heading font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const btnSecondary = "w-full py-2.5 rounded-xl border border-border text-grey-text dark:text-white/60 font-heading font-semibold text-sm hover:border-primary hover:text-primary transition-colors";
