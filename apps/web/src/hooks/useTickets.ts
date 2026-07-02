import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '../lib/api';
import toast from 'react-hot-toast';

export const ticketKeys = {
  list: (params?: object) => ['tickets', params] as const,
  detail: (id: string) => ['tickets', id] as const,
};

export function useTickets(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () => ticketsApi.list(params),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketsApi.get(id),
    enabled: !!id,
    refetchInterval: 10_000, // polling léger pour les messages
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket ouvert avec succès');
    },
    onError: () => toast.error('Erreur lors de la création du ticket'),
  });
}

export function useAddTicketMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: unknown }) => ticketsApi.addMessage(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(id) });
    },
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ticketsApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Statut mis à jour');
    },
  });
}
