import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '../lib/api';
import toast from 'react-hot-toast';

export const crmKeys = {
  leads: (params?: object) => ['crm', 'leads', params] as const,
  lead: (id: string) => ['crm', 'lead', id] as const,
  pipeline: ['crm', 'pipeline'] as const,
  stats: ['crm', 'stats'] as const,
};

export function useLeads(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: crmKeys.leads(params),
    queryFn: () => crmApi.listLeads(params),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: crmKeys.lead(id),
    queryFn: () => crmApi.getLead(id),
    enabled: !!id,
  });
}

export function usePipeline() {
  return useQuery({
    queryKey: crmKeys.pipeline,
    queryFn: crmApi.getPipeline,
    staleTime: 30 * 1000,
  });
}

export function useCrmStats() {
  return useQuery({
    queryKey: crmKeys.stats,
    queryFn: crmApi.getStats,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmApi.createLead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm'] });
      toast.success('Lead créé avec succès');
    },
    onError: () => toast.error('Erreur lors de la création du lead'),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: unknown }) => crmApi.updateLead(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: crmKeys.lead(id) });
      qc.invalidateQueries({ queryKey: ['crm', 'leads'] });
      toast.success('Lead mis à jour');
    },
  });
}

export function useMoveLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => crmApi.moveLead(id, stage),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm'] });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: crmApi.deleteLead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm'] });
      toast.success('Lead supprimé');
    },
  });
}
