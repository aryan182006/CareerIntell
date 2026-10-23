import { apiClient } from './client';
import { TpoProfile } from '../types';

export interface TpoAnalytics {
  total_students: number;
  average_readiness: number;
  distribution: {
    ready: number;
    near_ready: number;
    needs_attention: number;
  };
  role_distribution: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  department_breakdown: Array<{
    department: string;
    student_count: number;
    average_readiness: number;
  }>;
  top_skill_gaps: Array<{
    skill: string;
    affected_students_pct: number;
  }>;
  student_roster: Array<{
    id: string;
    name: string;
    email: string;
    department: string;
    cgpa: number;
    target_role: string;
    readiness_score: number;
    skills_count: number;
  }>;
}

export const tpoApi = {
  getAnalytics: async (): Promise<TpoAnalytics> => {
    const res = await apiClient.get<TpoAnalytics>('/tpo/analytics');
    return res.data;
  },

  getProfile: async (): Promise<TpoProfile> => {
    const res = await apiClient.get<TpoProfile>('/tpo/profile');
    return res.data;
  },

  updateProfile: async (data: Partial<TpoProfile>): Promise<TpoProfile> => {
    const res = await apiClient.put<TpoProfile>('/tpo/profile', data);
    return res.data;
  },
};
