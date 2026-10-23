import { apiClient } from './client';

export interface AssessmentItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  time_limit_minutes: number;
  passing_percentage: number;
  question_count: number;
}

export interface QuestionItem {
  id: string;
  question_text: string;
  options: string[];
  category: string;
  difficulty: string;
}

export interface QuestionFeedback {
  question_id: string;
  question_text: string;
  user_answer_index?: number;
  correct_option_index: number;
  is_correct: boolean;
  explanation?: string;
}

export interface AssessmentResult {
  attempt_id: string;
  score_percentage: number;
  total_questions: number;
  correct_answers: number;
  passed: boolean;
  time_taken_seconds: number;
  feedback: QuestionFeedback[];
}

export interface AssessmentHistoryItem {
  id: string;
  assessment_title: string;
  category: string;
  score_percentage: number;
  passed: boolean;
  completed_at: string;
}

export const assessmentsApi = {
  listAssessments: async (): Promise<AssessmentItem[]> => {
    const res = await apiClient.get<AssessmentItem[]>('/assessments');
    return res.data;
  },

  getQuestions: async (assessmentId: string): Promise<QuestionItem[]> => {
    const res = await apiClient.get<QuestionItem[]>(`/assessments/${assessmentId}/questions`);
    return res.data;
  },

  submitAssessment: async (
    assessmentId: string,
    answers: Record<string, number>,
    timeTakenSeconds: number
  ): Promise<AssessmentResult> => {
    const res = await apiClient.post<AssessmentResult>(`/assessments/${assessmentId}/submit`, {
      answers,
      time_taken_seconds: timeTakenSeconds,
    });
    return res.data;
  },

  getHistory: async (): Promise<AssessmentHistoryItem[]> => {
    const res = await apiClient.get<AssessmentHistoryItem[]>('/assessments/history');
    return res.data;
  },
};
