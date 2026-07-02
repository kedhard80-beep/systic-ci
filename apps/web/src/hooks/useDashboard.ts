import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../lib/api';
import { useUserRole } from '../lib/store/auth.store';

export const dashboardKeys = {
  superAdmin: ['dashboard', 'super-admin'] as const,
  client: ['dashboard', 'client'] as const,
  technicien: ['dashboard', 'technicien'] as const,
};

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: dashboardKeys.superAdmin,
    queryFn: dashboardApi.getSuperAdmin,
    staleTime: 2 * 60 * 1000,
  });
}

export function useClientDashboard() {
  return useQuery({
    queryKey: dashboardKeys.client,
    queryFn: dashboardApi.getClient,
    staleTime: 2 * 60 * 1000,
  });
}

export function useTechnicienDashboard() {
  return useQuery({
    queryKey: dashboardKeys.technicien,
    queryFn: dashboardApi.getTechnicien,
    staleTime: 60 * 1000,
  });
}

/** Hook auto — retourne le bon dashboard selon le rôle */
export function useDashboard() {
  const role = useUserRole();

  const superAdmin = useSuperAdminDashboard();
  const client = useClientDashboard();
  const technicien = useTechnicienDashboard();

  if (role === 'SUPER_ADMIN' || role === 'DIRECTION' || role === 'COMMERCIAL') return superAdmin;
  if (role === 'TECHNICIEN') return technicien;
  return client;
}
