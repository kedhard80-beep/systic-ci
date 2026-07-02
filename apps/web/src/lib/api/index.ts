/**
 * SYSTIC-CI — Barrel export de tous les modules API
 */

import apiClient from './client';

// ── Générique paginé ──────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export { authApi } from './auth.api';
export type { AuthUser, AuthTokens, LoginPayload, RegisterPayload } from './auth.api';

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getSuperAdmin: () => apiClient.get('/dashboard/admin').then((r) => r.data),
  getClient: () => apiClient.get('/dashboard/client').then((r) => r.data),
  getTechnicien: () => apiClient.get('/dashboard/technicien').then((r) => r.data),
};

// ── Clients ───────────────────────────────────────────────────────────────────
export const clientsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/clients', { params }).then((r) => r.data as PaginatedResponse<any>),
  get: (id: string) => apiClient.get(`/clients/${id}`).then((r) => r.data),
  create: (dto: unknown) => apiClient.post('/clients', dto).then((r) => r.data),
  update: (id: string, dto: unknown) => apiClient.patch(`/clients/${id}`, dto).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/clients/${id}`).then((r) => r.data),
  getStats: () => apiClient.get('/clients/stats').then((r) => r.data),
};

// ── CRM / Leads ───────────────────────────────────────────────────────────────
export const crmApi = {
  listLeads: (params?: Record<string, unknown>) =>
    apiClient.get('/crm/leads', { params }).then((r) => r.data as PaginatedResponse<any>),
  getLead: (id: string) => apiClient.get(`/crm/leads/${id}`).then((r) => r.data),
  createLead: (dto: unknown) => apiClient.post('/crm/leads', dto).then((r) => r.data),
  updateLead: (id: string, dto: unknown) =>
    apiClient.patch(`/crm/leads/${id}`, dto).then((r) => r.data),
  moveLead: (id: string, stage: string) =>
    apiClient.patch(`/crm/leads/${id}/stage`, { stage }).then((r) => r.data),
  deleteLead: (id: string) => apiClient.delete(`/crm/leads/${id}`).then((r) => r.data),
  getPipeline: () => apiClient.get('/crm/pipeline').then((r) => r.data),
  getStats: () => apiClient.get('/crm/stats').then((r) => r.data),
};

// ── Devis ─────────────────────────────────────────────────────────────────────
export const quotesApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/quotes', { params }).then((r) => r.data as PaginatedResponse<any>),
  get: (id: string) => apiClient.get(`/quotes/${id}`).then((r) => r.data),
  create: (dto: unknown) => apiClient.post('/quotes', dto).then((r) => r.data),
  update: (id: string, dto: unknown) => apiClient.patch(`/quotes/${id}`, dto).then((r) => r.data),
  send: (id: string) => apiClient.post(`/quotes/${id}/send`).then((r) => r.data),
  accept: (id: string) => apiClient.post(`/quotes/${id}/accept`).then((r) => r.data),
  convert: (id: string) => apiClient.post(`/quotes/${id}/convert`).then((r) => r.data),
  getStats: () => apiClient.get('/quotes/stats').then((r) => r.data),
};

// ── Contrats ──────────────────────────────────────────────────────────────────
export const contractsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/contracts', { params }).then((r) => r.data as PaginatedResponse<any>),
  get: (id: string) => apiClient.get(`/contracts/${id}`).then((r) => r.data),
  create: (dto: unknown) => apiClient.post('/contracts', dto).then((r) => r.data),
  update: (id: string, dto: unknown) =>
    apiClient.patch(`/contracts/${id}`, dto).then((r) => r.data),
  getExpiring: (days?: number) =>
    apiClient.get('/contracts/expiring', { params: { days } }).then((r) => r.data),
};

// ── Factures ──────────────────────────────────────────────────────────────────
export const invoicesApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/invoices', { params }).then((r) => r.data as PaginatedResponse<any>),
  get: (id: string) => apiClient.get(`/invoices/${id}`).then((r) => r.data),
  create: (dto: unknown) => apiClient.post('/invoices', dto).then((r) => r.data),
  send: (id: string) => apiClient.post(`/invoices/${id}/send`).then((r) => r.data),
  pay: (id: string, dto: unknown) => apiClient.post(`/invoices/${id}/pay`, dto).then((r) => r.data),
  getOverdue: () => apiClient.get('/invoices/overdue').then((r) => r.data),
  initiatePayment: (id: string) =>
    apiClient.post(`/payments/initiate`, { invoiceId: id }).then((r) => r.data),
};

// ── Interventions ─────────────────────────────────────────────────────────────
export const interventionsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/interventions', { params }).then((r) => r.data as PaginatedResponse<any>),
  get: (id: string) => apiClient.get(`/interventions/${id}`).then((r) => r.data),
  create: (dto: unknown) => apiClient.post('/interventions', dto).then((r) => r.data),
  updateStatus: (id: string, status: string, metadata?: unknown) =>
    apiClient.patch(`/interventions/${id}/status`, { status, metadata }).then((r) => r.data),
  assign: (id: string, technicienId: string) =>
    apiClient.post(`/interventions/${id}/assign`, { technicienId }).then((r) => r.data),
  getCalendar: (year: number, month: number) =>
    apiClient.get(`/interventions/calendar`, { params: { year, month } }).then((r) => r.data),
  getStats: () => apiClient.get('/interventions/stats').then((r) => r.data),
};

// ── Techniciens ───────────────────────────────────────────────────────────────
export const techniciensApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/techniciens', { params }).then((r) => r.data as PaginatedResponse<any>),
  get: (id: string) => apiClient.get(`/techniciens/${id}`).then((r) => r.data),
  getMe: () => apiClient.get('/techniciens/me').then((r) => r.data),
  update: (id: string, dto: unknown) =>
    apiClient.patch(`/techniciens/${id}`, dto).then((r) => r.data),
  setAvailability: (id: string, isAvailable: boolean) =>
    apiClient.patch(`/techniciens/${id}/availability`, { isAvailable }).then((r) => r.data),
  getPlanning: (id: string, year: number, month: number) =>
    apiClient.get(`/techniciens/${id}/planning`, { params: { year, month } }).then((r) => r.data),
  getStats: (id: string) => apiClient.get(`/techniciens/${id}/stats`).then((r) => r.data),
};

// ── Tickets ───────────────────────────────────────────────────────────────────
export const ticketsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/tickets', { params }).then((r) => r.data as PaginatedResponse<any>),
  get: (id: string) => apiClient.get(`/tickets/${id}`).then((r) => r.data),
  create: (dto: unknown) => apiClient.post('/tickets', dto).then((r) => r.data),
  addMessage: (id: string, dto: unknown) =>
    apiClient.post(`/tickets/${id}/messages`, dto).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/tickets/${id}/status`, { status }).then((r) => r.data),
  assign: (id: string, assignedToId: string) =>
    apiClient.patch(`/tickets/${id}/assign`, { assignedToId }).then((r) => r.data),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/notifications', { params }).then((r) => r.data),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => apiClient.patch('/notifications/read-all').then((r) => r.data),
  getUnreadCount: () => apiClient.get('/notifications/unread-count').then((r) => r.data),
};

// ── Académie ──────────────────────────────────────────────────────────────────
export const academieApi = {
  listCourses: (params?: Record<string, unknown>) =>
    apiClient.get('/academie/courses', { params }).then((r) => r.data as PaginatedResponse<any>),
  getCourse: (id: string) => apiClient.get(`/academie/courses/${id}`).then((r) => r.data),
  enroll: (courseId: string) => apiClient.post(`/academie/enroll/${courseId}`).then((r) => r.data),
  getProgress: (enrollmentId: string) =>
    apiClient.get(`/academie/progress/${enrollmentId}`).then((r) => r.data),
  completeLesson: (enrollmentId: string, lessonId: string) =>
    apiClient.post(`/academie/progress/${enrollmentId}/lesson/${lessonId}`).then((r) => r.data),
  submitQuiz: (quizId: string, enrollmentId: string, answers: unknown[]) =>
    apiClient.post(`/academie/quiz/${quizId}`, { enrollmentId, answers }).then((r) => r.data),
  getStats: () => apiClient.get('/academie/stats').then((r) => r.data),
};

// ── Blog ──────────────────────────────────────────────────────────────────────
export const blogApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/blog', { params }).then((r) => r.data as PaginatedResponse<any>),
  getBySlug: (slug: string) => apiClient.get(`/blog/${slug}`).then((r) => r.data),
  create: (dto: unknown) => apiClient.post('/blog', dto).then((r) => r.data),
  update: (id: string, dto: unknown) => apiClient.patch(`/blog/${id}`, dto).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/blog/${id}`).then((r) => r.data),
};

// ── Portfolio ─────────────────────────────────────────────────────────────────
export const portfolioApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/portfolio', { params }).then((r) => r.data as PaginatedResponse<any>),
  getFeatured: (limit?: number) =>
    apiClient.get('/portfolio/featured', { params: { limit } }).then((r) => r.data),
  getCategories: () => apiClient.get('/portfolio/categories').then((r) => r.data),
  get: (id: string) => apiClient.get(`/portfolio/${id}`).then((r) => r.data),
  create: (dto: unknown) => apiClient.post('/portfolio', dto).then((r) => r.data),
  update: (id: string, dto: unknown) =>
    apiClient.patch(`/portfolio/${id}`, dto).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/portfolio/${id}`).then((r) => r.data),
};

// ── Carrières ─────────────────────────────────────────────────────────────────
export const careersApi = {
  listJobs: (params?: Record<string, unknown>) =>
    apiClient.get('/careers', { params }).then((r) => r.data as PaginatedResponse<any>),
  getJob: (id: string) => apiClient.get(`/careers/${id}`).then((r) => r.data),
  apply: (dto: unknown) => apiClient.post('/careers/apply', dto).then((r) => r.data),
  createJob: (dto: unknown) => apiClient.post('/careers', dto).then((r) => r.data),
  updateJob: (id: string, dto: unknown) =>
    apiClient.patch(`/careers/${id}`, dto).then((r) => r.data),
};

// ── Produits & Stocks ─────────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/products', { params }).then((r) => r.data as PaginatedResponse<any>),
  get: (id: string) => apiClient.get(`/products/${id}`).then((r) => r.data),
  create: (dto: unknown) => apiClient.post('/products', dto).then((r) => r.data),
  update: (id: string, dto: unknown) =>
    apiClient.patch(`/products/${id}`, dto).then((r) => r.data),
  getCategories: () => apiClient.get('/products/categories').then((r) => r.data),
  getLowStock: () => apiClient.get('/products/low-stock').then((r) => r.data),
};

export const stocksApi = {
  get: (params?: Record<string, unknown>) =>
    apiClient.get('/stocks', { params }).then((r) => r.data),
  adjust: (dto: unknown) => apiClient.post('/stocks/adjust', dto).then((r) => r.data),
  transfer: (dto: unknown) => apiClient.post('/stocks/transfer', dto).then((r) => r.data),
  getAlerts: () => apiClient.get('/stocks/alerts').then((r) => r.data),
  getValue: () => apiClient.get('/stocks/value').then((r) => r.data),
};

// ── IA ────────────────────────────────────────────────────────────────────────
export const aiApi = {
  chat: (messages: { role: string; content: string }[]) =>
    apiClient.post('/ai/chat', { messages }).then((r) => r.data),
  suggestQuote: (description: string) =>
    apiClient.post('/ai/quote-suggestion', { description }).then((r) => r.data),
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const settingsApi = {
  getAll: () => apiClient.get('/settings').then((r) => r.data),
  get: (key: string) => apiClient.get(`/settings/${key}`).then((r) => r.data),
  set: (key: string, value: unknown) => apiClient.put(`/settings/${key}`, { value }).then((r) => r.data),
  setBulk: (settings: Record<string, unknown>) =>
    apiClient.put('/settings', settings).then((r) => r.data),
};

// ── Médias ────────────────────────────────────────────────────────────────────
export const mediaApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get('/media', { params }).then((r) => r.data as PaginatedResponse<any>),
  upload: (formData: FormData) =>
    apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  update: (id: string, dto: unknown) => apiClient.patch(`/media/${id}`, dto).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/media/${id}`).then((r) => r.data),
  getStats: () => apiClient.get('/media/stats').then((r) => r.data),
};
