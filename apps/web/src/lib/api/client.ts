/**
 * SYSTIC-CI — Client API axios
 * Intercepteurs JWT, refresh automatique, gestion erreurs centralisée
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const _BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const API_URL = _BASE.endsWith('/api/v1') ? _BASE : `${_BASE}/api/v1`;

// ── Helpers tokens ────────────────────────────────────────────────────────────

export const TokenStorage = {
  getAccess: () =>
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  getRefresh: () =>
    typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  set: (access: string, refresh: string) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  },
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Vider aussi les cookies du middleware pour éviter la boucle de redirection
    if (typeof document !== 'undefined') {
      document.cookie = 'systic_auth=; path=/; max-age=0';
      document.cookie = 'systic_role=; path=/; max-age=0';
    }
  },
};

// ── Instance axios ────────────────────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Intercepteur REQUEST : injecte le token ───────────────────────────────────

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = TokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Intercepteur RESPONSE : refresh automatique ───────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 sur un endpoint autre que /auth → tenter le refresh
    if (
      error.response?.status === 401 &&
      !original._retry &&
      original.url !== '/auth/refresh' &&
      original.url !== '/auth/login'
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = TokenStorage.getRefresh();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        TokenStorage.set(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);

        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        TokenStorage.clear();
        if (typeof window !== 'undefined') {
          // Notifie le store Zustand pour vider isAuthenticated
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
          window.location.href = '/login?session=expired';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ── Utilitaire pour extraire le message d'erreur ──────────────────────────────

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

export default apiClient;
