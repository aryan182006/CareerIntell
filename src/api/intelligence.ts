import { apiClient } from './client';

export interface SkillGapItem {
  skill_name: string;
  category: string;
  status: 'MATCHED' | 'EQUIVALENT' | 'IMPLIED' | 'PARTIAL' | 'MISSING';
  current_level: number;
  required_level: number;
  importance: 'Required' | 'Preferred';
  justification?: string | null;
  satisfied_by?: string | null;
}

export interface ModelAccuracyMetrics {
  overall_accuracy: number;
  layout_accuracy: number;
  skill_confidence: number;
  structural_completeness: number;
  semantic_precision: number;
  evaluation_label: string;
  details?: {
    file_name?: string;
    word_count?: number;
    page_count?: number;
    sections_detected_count?: number;
    skills_evaluated_count?: number;
  };
}

export interface SkillGapAnalysisResponse {
  target_role: string;
  match_score: number;
  total_required: number;
  matched_count: number;
  equivalent_count?: number;
  implied_count?: number;
  partial_count: number;
  missing_count: number;
  gaps: SkillGapItem[];
  model_accuracy?: ModelAccuracyMetrics;
}

export interface RoleMatchItem {
  id: string;
  title: string;
  category: string;
  description: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  salary_range?: string;
}

export interface ReadinessResponse {
  overall_score: number;
  breakdown: {
    technical_skills: number;
    role_match: number;
    projects: number;
    resume_quality: number;
    assessments: number;
  };
  explanation_summary: string;
  target_role: string;
  history: Array<{
    recorded_at: string;
    score: number;
    role_title: string;
  }>;
}

export interface RecommendationItem {
  id: string;
  type: 'skill' | 'project' | 'resource' | 'certification';
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  action_url?: string;
}

export interface RoadmapItem {
  id: string;
  phase: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  order_index: number;
  resources: Array<{
    title: string;
    provider: string;
    url: string;
    type: string;
  }>;
}

export interface RoadmapResponse {
  id: string;
  target_role_title: string;
  completion_percentage: number;
  items: RoadmapItem[];
}

export interface JDAnalysisResponse {
  title: string;
  company?: string;
  clean_text: string;
  required_skills: string[];
  preferred_skills: string[];
  min_experience_years: number;
  education_level?: string;
}

export const intelligenceApi = {
  analyzeJobDescription: async (raw_text: string, title?: string, company?: string): Promise<JDAnalysisResponse> => {
    const res = await apiClient.post<JDAnalysisResponse>('/jobs/analyze', { raw_text, title, company });
    return res.data;
  },

  analyzeMatch: async (params?: {
    role_id?: string;
    role_title?: string;
    custom_skills?: Array<{ name: string; importance: string; required_level?: number }>;
  }): Promise<SkillGapAnalysisResponse> => {
    const res = await apiClient.post<SkillGapAnalysisResponse>('/matching/analyze', params || {});
    return res.data;
  },

  getRoleMatches: async (): Promise<RoleMatchItem[]> => {
    const res = await apiClient.get<RoleMatchItem[]>('/matching/roles');
    return res.data;
  },

  getReadiness: async (): Promise<ReadinessResponse> => {
    const res = await apiClient.get<ReadinessResponse>('/readiness');
    return res.data;
  },

  getRecommendations: async (): Promise<RecommendationItem[]> => {
    const res = await apiClient.get<RecommendationItem[]>('/recommendations');
    return res.data;
  },

  getRoadmap: async (): Promise<RoadmapResponse> => {
    const res = await apiClient.get<RoadmapResponse>('/roadmap');
    return res.data;
  },

  updateRoadmapItemStatus: async (itemId: string, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'): Promise<RoadmapResponse> => {
    const res = await apiClient.put<RoadmapResponse>(`/roadmap/items/${itemId}`, { status });
    return res.data;
  },
};
