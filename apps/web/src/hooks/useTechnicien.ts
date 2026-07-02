/**
 * Hooks — Portail Technicien
 * Données réelles via TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { techniciensApi, interventionsApi } from '../lib/api';

export const technicienKeys = {
  me:       () => ['technicien', 'me'] as const,
  planning: (y: number, m: number) => ['technicien', 'planning', y, m] as const,
  stats:    () => ['technicien', 'stats'] as const,
  missions: (p?: object) => ['technicien', 'missions', p] as const,
};

/** Profil du technicien connecté */
export function useTechnicienMe() {
  return useQuery({
    queryKey: technicienKeys.me(),
    queryFn:  () => techniciensApi.getMe(),
    staleTime: 5 * 60_000,
  });
}

/** Planning mensuel — récupère d'abord l'ID "me", puis le planning */
export function useTechnicienPlanning(year: number, month: number) {
  const { data: me } = useTechnicienMe();
  return useQuery({
    queryKey: technicienKeys.planning(year, month),
    queryFn:  () => techniciensApi.getPlanning(me!.id, year, month),
    enabled:  !!me?.id,
    staleTime: 60_000,
  });
}

/** Statistiques — récupère d'abord l'ID "me", puis les stats */
export function useTechnicienStats() {
  const { data: me } = useTechnicienMe();
  return useQuery({
    queryKey: technicienKeys.stats(),
    queryFn:  () => techniciensApi.getStats(me!.id),
    enabled:  !!me?.id,
    staleTime: 60_000,
  });
}

/** Missions du jour (interventions assignées au technicien) */
export function useTodayMissions() {
  const today = new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: technicienKeys.missions({ date: today }),
    queryFn:  () => interventionsApi.list({ assignedToMe: true, date: today }),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Mettre à jour le statut d'une intervention */
export function useUpdateMissionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, metadata }: { id: string; status: string; metadata?: unknown }) =>
      interventionsApi.updateStatus(id, status, metadata),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['technicien', 'missions'] });
      qc.invalidateQueries({ queryKey: ['interventions'] });
    },
  });
}
