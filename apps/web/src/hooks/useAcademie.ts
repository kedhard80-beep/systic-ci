import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academieApi } from '../lib/api';
import toast from 'react-hot-toast';

export const academieKeys = {
  courses: (params?: object) => ['academie', 'courses', params] as const,
  course: (id: string) => ['academie', 'course', id] as const,
  progress: (enrollmentId: string) => ['academie', 'progress', enrollmentId] as const,
  stats: ['academie', 'stats'] as const,
};

export function useCourses(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: academieKeys.courses(params),
    queryFn: () => academieApi.listCourses(params),
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: academieKeys.course(id),
    queryFn: () => academieApi.getCourse(id),
    enabled: !!id,
  });
}

export function useEnrollmentProgress(enrollmentId: string) {
  return useQuery({
    queryKey: academieKeys.progress(enrollmentId),
    queryFn: () => academieApi.getProgress(enrollmentId),
    enabled: !!enrollmentId,
  });
}

export function useAcademieStats() {
  return useQuery({
    queryKey: academieKeys.stats,
    queryFn: academieApi.getStats,
  });
}

export function useEnroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => academieApi.enroll(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['academie'] });
      toast.success('Inscription confirmée !');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur inscription'),
  });
}

export function useCompleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, lessonId }: { enrollmentId: string; lessonId: string }) =>
      academieApi.completeLesson(enrollmentId, lessonId),
    onSuccess: (_, { enrollmentId }) => {
      qc.invalidateQueries({ queryKey: academieKeys.progress(enrollmentId) });
    },
  });
}

export function useSubmitQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      quizId,
      enrollmentId,
      answers,
    }: {
      quizId: string;
      enrollmentId: string;
      answers: unknown[];
    }) => academieApi.submitQuiz(quizId, enrollmentId, answers),
    onSuccess: (data, { enrollmentId }) => {
      qc.invalidateQueries({ queryKey: academieKeys.progress(enrollmentId) });
      if (data.passed) {
        toast.success(`Félicitations ! Score : ${data.percentage}% ✓`);
      } else {
        toast.error(`Score insuffisant : ${data.percentage}% (minimum : ${data.passMark}%)`);
      }
    },
  });
}
