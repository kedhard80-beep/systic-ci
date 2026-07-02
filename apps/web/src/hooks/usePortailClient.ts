/**
 * Hooks — Portail Client
 * Données réelles via TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  invoicesApi, contractsApi, interventionsApi,
  ticketsApi, notificationsApi, clientsApi,
} from '../lib/api';

export const portailKeys = {
  clientStats:    () => ['portail', 'stats'] as const,
  invoices:       (p?: object) => ['portail', 'invoices', p] as const,
  contracts:      (p?: object) => ['portail', 'contracts', p] as const,
  interventions:  (p?: object) => ['portail', 'interventions', p] as const,
  tickets:        (p?: object) => ['portail', 'tickets', p] as const,
  notifications:  () => ['portail', 'notifications'] as const,
};

/** Stats globales client (KPIs dashboard) */
export function useClientStats() {
  return useQuery({
    queryKey: portailKeys.clientStats(),
    queryFn: () => clientsApi.getStats(),
    staleTime: 60_000,
  });
}

/** Factures du client connecté */
export function useClientInvoices(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: portailKeys.invoices(params),
    queryFn: () => invoicesApi.list({ ...params, myInvoices: true }),
    staleTime: 30_000,
  });
}

/** Contrats du client connecté */
export function useClientContracts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: portailKeys.contracts(params),
    queryFn: () => contractsApi.list({ ...params, myContracts: true }),
    staleTime: 60_000,
  });
}

/** Interventions du client connecté */
export function useClientInterventions(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: portailKeys.interventions(params),
    queryFn: () => interventionsApi.list({ ...params, myInterventions: true }),
    staleTime: 30_000,
  });
}

/** Tickets du client */
export function useClientTickets(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: portailKeys.tickets(params),
    queryFn: () => ticketsApi.list({ ...params, myTickets: true }),
    refetchInterval: 15_000,
  });
}

/** Notifications non lues */
export function usePortailNotifications() {
  return useQuery({
    queryKey: portailKeys.notifications(),
    queryFn: () => notificationsApi.list({ limit: 10 }),
    refetchInterval: 15_000,
  });
}

/** Créer un ticket depuis le portail */
export function useCreateClientTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portail', 'tickets'] }),
  });
}
