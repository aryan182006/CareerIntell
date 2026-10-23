import { apiClient } from './client';

export interface InterviewQuestionItem {
  id: string;
  role_title: string;
  skill_name: string;
  round_type: string;
  company_tags: string[];
  company_tier: string;
  difficulty: string;
  question_text: string;
  key_concepts: string[];
  interviewer_criteria?: string;
  model_answer: string;
  tips?: string;
  is_skill_gap: boolean;
  gap_type?: 'MISSING' | 'PARTIAL' | null;
  status: 'NOT_STARTED' | 'PRACTICING' | 'MASTERED';
  self_rating: number;
  user_notes?: string;
  last_practiced_at?: string;
}

export interface InterviewHubResponse {
  target_role: string;
  total_questions: number;
  mastered_count: number;
  practicing_count: number;
  skill_gap_questions_count: number;
  readiness_percentage: number;
  questions: InterviewQuestionItem[];
}

export interface FilterOptions {
  roles: string[];
  companies: string[];
  round_types: string[];
  tiers: string[];
  difficulties: string[];
}

export const interviewsApi = {
  getQuestions: async (params?: {
    role?: string;
    round_type?: string;
    company?: string;
    difficulty?: string;
    gap_only?: boolean;
  }): Promise<InterviewHubResponse> => {
    const res = await apiClient.get<InterviewHubResponse>('/interviews/questions', { params });
    return res.data;
  },

  updateProgress: async (
    questionId: string,
    data: {
      status: 'NOT_STARTED' | 'PRACTICING' | 'MASTERED';
      self_rating?: number;
      user_notes?: string;
    }
  ): Promise<any> => {
    const res = await apiClient.post(`/interviews/${questionId}/progress`, data);
    return res.data;
  },

  getFilters: async (): Promise<FilterOptions> => {
    const res = await apiClient.get<FilterOptions>('/interviews/filters');
    return res.data;
  }
};
