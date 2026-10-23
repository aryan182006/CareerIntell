import { apiClient } from './client';
import { IntegratedStudentProfile } from '../types';

export interface BackendSkill {
  id: string;
  skill_name: string;
  proficiency: string;
  proficiency_level: number;
  source: string;
  verified: boolean;
}

export interface BackendProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  github_url?: string;
  live_url?: string;
  created_at?: string;
}

export interface BackendCertification {
  id: string;
  name: string;
  issuing_organization: string;
  issue_date?: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface BackendProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  department: string;
  degree: string;
  graduation_year: number;
  current_cgpa: number;
  bio?: string;
  phone?: string;
  target_role_id?: string;
  target_role_title: string;
  readiness_score: number;
  skills: BackendSkill[];
  projects: BackendProject[];
  certifications: BackendCertification[];
}

export const studentsApi = {
  getMyProfile: async (): Promise<BackendProfile> => {
    const res = await apiClient.get<BackendProfile>('/students/me');
    return res.data;
  },

  updateMyProfile: async (data: Partial<BackendProfile>): Promise<BackendProfile> => {
    const res = await apiClient.put<BackendProfile>('/students/me', data);
    return res.data;
  },

  addSkill: async (skill: {
    skill_name: string;
    proficiency?: string;
    proficiency_level?: number;
    source?: string;
  }): Promise<BackendSkill> => {
    const res = await apiClient.post<BackendSkill>('/students/me/skills', skill);
    return res.data;
  },

  deleteSkill: async (skillId: string) => {
    const res = await apiClient.delete(`/students/me/skills/${skillId}`);
    return res.data;
  },

  addProject: async (project: {
    title: string;
    description: string;
    technologies: string[];
    github_url?: string;
    live_url?: string;
  }): Promise<BackendProject> => {
    const res = await apiClient.post<BackendProject>('/students/me/projects', project);
    return res.data;
  },

  deleteProject: async (projectId: string) => {
    const res = await apiClient.delete(`/students/me/projects/${projectId}`);
    return res.data;
  },

  addCertification: async (cert: {
    name: string;
    issuing_organization: string;
    issue_date?: string;
    expiration_date?: string;
    credential_id?: string;
    credential_url?: string;
  }): Promise<BackendCertification> => {
    const res = await apiClient.post<BackendCertification>('/students/me/certifications', cert);
    return res.data;
  },

  deleteCertification: async (certId: string) => {
    const res = await apiClient.delete(`/students/me/certifications/${certId}`);
    return res.data;
  },

  getIntegratedProfile: async (): Promise<IntegratedStudentProfile> => {
    const res = await apiClient.get<IntegratedStudentProfile>('/students/me/integrated');
    return res.data;
  },

  syncResumeData: async (): Promise<{
    status: string;
    message: string;
    skills_added: number;
    projects_added: number;
    bio_updated: boolean;
  }> => {
    const res = await apiClient.post('/students/me/sync-resume');
    return res.data;
  },
};
