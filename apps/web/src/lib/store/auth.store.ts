/**
 * Zustand store — Authentification SYSTIC-CI
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AuthUser } from '../api/auth.api';
import { authApi } from '../api/auth.api';
import { TokenStorage } from '../api/client';

/** Pose ou retire les cookies légers lus par le middleware Next.js */
function syncAuthCookies(user: AuthUser | null) {
  if (typeof document === 'undefined') return;
  if (user) {
    const maxAge = 60 * 60 * 24 * 30; // 30 jours
    document.cookie = `systic_auth=1; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `systic_role=${user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } else {
    document.cookie = 'systic_auth=; path=/; max-age=0';
    document.cookie = 'systic_role=; path=/; max-age=0';
  }
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<
    | { success: true }
    | { twoFARequired: true; partialToken: string }
  >;
  verify2FA: (code: string, partialToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password, rememberMe = false) => {
        set((s) => { s.isLoading = true; });
        try {
          const result = await authApi.login({ email, password, rememberMe });

          if ('twoFARequired' in result && result.twoFARequired) {
            return { twoFARequired: true, partialToken: result.partialToken };
          }

          const tokens = result as Awaited<ReturnType<typeof authApi.login>> & { user: AuthUser };
          const user = (tokens as any).user as AuthUser;
          set((s) => {
            s.user = user;
            s.isAuthenticated = true;
          });
          syncAuthCookies(user);
          return { success: true };
        } finally {
          set((s) => { s.isLoading = false; });
        }
      },

      verify2FA: async (code, partialToken) => {
        const result = await authApi.verify2FA(code, partialToken);
        const user = (result as any).user as AuthUser;
        set((s) => {
          s.user = user;
          s.isAuthenticated = true;
        });
        syncAuthCookies(user);
      },

      logout: async () => {
        await authApi.logout();
        set((s) => {
          s.user = null;
          s.isAuthenticated = false;
        });
        syncAuthCookies(null);
      },

      refreshProfile: async () => {
        const user = await authApi.getProfile();
        set((s) => { s.user = user; });
      },

      setUser: (user) => {
        set((s) => { s.user = user; s.isAuthenticated = true; });
      },
    })),
    {
      name: 'systic-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);

// Sélecteurs pratiques
export const useUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useUserRole = () => useAuthStore((s) => s.user?.role);

// Quand le refresh token expire, vider le store pour éviter la boucle middleware
if (typeof window !== 'undefined') {
  window.addEventListener('auth:session-expired', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });
}
