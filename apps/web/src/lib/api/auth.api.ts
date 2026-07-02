import apiClient, { TokenStorage } from './client';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  tenantId: string;
  avatarUrl?: string;
  twoFAEnabled: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface TwoFARequired {
  twoFARequired: true;
  partialToken: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthTokens | TwoFARequired> {
    const { data } = await apiClient.post('/auth/login', payload);
    if (data.twoFARequired) return data;
    TokenStorage.set(data.accessToken, data.refreshToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async verify2FA(code: string, partialToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post('/auth/2fa/verify', { code, partialToken });
    TokenStorage.set(data.accessToken, data.refreshToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const { data } = await apiClient.post('/auth/register', payload);
    TokenStorage.set(data.accessToken, data.refreshToken);
    return data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      TokenStorage.clear();
    }
  },

  async forgotPassword(email: string) {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, password: string) {
    const { data } = await apiClient.post('/auth/reset-password', { token, password });
    return data;
  },

  async getProfile(): Promise<AuthUser> {
    const { data } = await apiClient.get('/auth/profile');
    return data;
  },

  async setup2FA() {
    const { data } = await apiClient.post('/auth/2fa/setup');
    return data as { otpauthUrl: string; qrCode: string; secret: string };
  },

  async enable2FA(code: string) {
    const { data } = await apiClient.post('/auth/2fa/enable', { code });
    return data;
  },

  getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },
};
