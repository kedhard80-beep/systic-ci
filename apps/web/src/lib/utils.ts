import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format currency (XOF — Franc CFA) */
export function formatCurrency(amount: number, currency = "XOF"): string {
  return new Intl.NumberFormat("fr-CI", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format date in French */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }
): string {
  return new Intl.DateTimeFormat("fr-CI", options).format(
    typeof date === "string" ? new Date(date) : date
  );
}

/** Format relative time */
export function formatRelativeTime(date: Date | string): string {
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  const seconds = Math.round(diff / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  if (Math.abs(seconds) < 60) return rtf.format(seconds, "second");
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  if (Math.abs(days) < 7) return rtf.format(days, "day");
  if (Math.abs(weeks) < 5) return rtf.format(weeks, "week");
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  return rtf.format(years, "year");
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/** Generate slug */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Debounce */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/** Deep clone */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Get initials from name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Format phone number (Côte d'Ivoire) */
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 10) {
    return `${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 6)} ${clean.slice(6, 8)} ${clean.slice(8, 10)}`;
  }
  return phone;
}

/** Format file size */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Generate random ID */
export function generateId(length = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/** Check if URL is external */
export function isExternalUrl(url: string): boolean {
  return /^(https?:)?\/\//.test(url);
}

/** Wait (sleep) */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Range array */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, i) => start + i);
}

/** Clamp number */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Extract user-facing message from API error */
export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data?.message === 'string') return data.message;
    if (Array.isArray(data?.message)) return data.message.join(', ');
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Une erreur est survenue';
}

/** Format currency compact (ex. 12,4M) */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M XOF`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k XOF`;
  return `${amount} XOF`;
}

/** Parse JSON safely */
export function safeParseJson<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
