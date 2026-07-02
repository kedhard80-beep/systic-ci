import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../lib/api';

export const notificationKeys = {
  list: (params?: object) => ['notifications', params] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export function useNotifications(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.list(params),
    refetchInterval: 30_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
