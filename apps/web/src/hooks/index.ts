/**
 * SYSTIC-CI — Barrel export de tous les hooks TanStack Query
 */

// Auth
export { useAuthStore, useUser, useIsAuthenticated, useUserRole } from '../lib/store/auth.store';

// Dashboard
export {
  useDashboard,
  useSuperAdminDashboard,
  useClientDashboard,
  useTechnicienDashboard,
} from './useDashboard';

// CRM
export {
  useLeads,
  useLead,
  usePipeline,
  useCrmStats,
  useCreateLead,
  useUpdateLead,
  useMoveLead,
  useDeleteLead,
} from './useCrm';

// Interventions
export {
  useInterventions,
  useIntervention,
  useInterventionCalendar,
  useInterventionStats,
  useCreateIntervention,
  useUpdateInterventionStatus,
  useAssignTechnicien,
} from './useInterventions';

// Tickets
export {
  useTickets,
  useTicket,
  useCreateTicket,
  useAddTicketMessage,
  useUpdateTicketStatus,
} from './useTickets';

// Notifications
export {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
} from './useNotifications';

// Académie
export {
  useCourses,
  useCourse,
  useEnrollmentProgress,
  useAcademieStats,
  useEnroll,
  useCompleteLesson,
  useSubmitQuiz,
} from './useAcademie';

// Portail Client
export {
  useClientStats,
  useClientInvoices,
  useClientContracts,
  useClientInterventions,
  useClientTickets,
  usePortailNotifications,
  useCreateClientTicket,
} from './usePortailClient';

// Portail Technicien
export {
  useTechnicienMe,
  useTechnicienPlanning,
  useTechnicienStats,
  useTodayMissions,
  useUpdateMissionStatus,
} from './useTechnicien';
