import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interventionsApi } from '../lib/api';
import toast from 'react-hot-toast';

export const interventionKeys = {
  list: (params?: object) => ['interventions', params] as const,
  detail: (id: string) => ['interventions', id] as const,
  calendar: (year: number, month: number) => ['interventions', 'calendar', year, month] as const,
  stats: ['interventions', 'stats'] as const,
};

export function useInterventions(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: interventionKeys.list(params),
    queryFn: () => interventionsApi.list(params),
  });
}

export function useIntervention(id: string) {
  return useQuery({
    queryKey: interventionKeys.detail(id),
    queryFn: () => interventionsApi.get(id),
    enabled: !!id,
  });
}

export function useInterventionCalendar(year: number, month: number) {
  return useQuery({
    queryKey: interventionKeys.calendar(year, month),
    queryFn: () => interventionsApi.getCalendar(year, month),
  });
}

export function useInterventionStats() {
  return useQuery({
    queryKey: interventionKeys.stats,
    queryFn: interventionsApi.getStats,
  });
}

export function useCreateIntervention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: interventionsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interventions'] });
      toast.success('Intervention créée');
    },
    onError: () => toast.error('Erreur lors de la création'),
  });
}

export function useUpdateInterventionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, metadata }: { id: string; status: string; metadata?: unknown }) =>
      interventionsApi.updateStatus(id, status, metadata),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: interventionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ['interventions'] });
      toast.success('Statut mis à jour');
    },
  });
}

export function useAssignTechnicien() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, technicienId }: { id: string; technicienId: string }) =>
      interventionsApi.assign(id, technicienId),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: interventionKeys.detail(id) });
      toast.success('Technicien assigné');
    },
  });
}
