import { apiClient } from './client';

export interface ExtractedSkill {
  name: string;
  category: string;
  confidence: number;
  source: string;
}

export interface ResumeUploadResult {
  resume_id: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
  skills_extracted: ExtractedSkill[];
  sections_detected: Record<string, string>;
  word_count: number;
  raw_text_snippet: string;
}

export interface LatestResumeResponse {
  id?: string;
  file_name?: string;
  file_size?: number;
  uploaded_at?: string;
  skills_extracted: ExtractedSkill[];
  sections_detected: Record<string, string>;
  raw_text_snippet?: string;
}

export const resumesApi = {
  uploadResume: async (file: File): Promise<ResumeUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<ResumeUploadResult>('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getLatestResume: async (): Promise<LatestResumeResponse> => {
    const res = await apiClient.get<LatestResumeResponse>('/resumes/latest');
    return res.data;
  },

  confirmSkills: async (confirmedSkills: string[], proficiency: string = 'Intermediate') => {
    const res = await apiClient.post('/resumes/confirm-skills', {
      confirmed_skills: confirmedSkills,
      proficiency,
    });
    return res.data;
  },
};
