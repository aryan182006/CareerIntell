import { apiClient } from './client';

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'tpo' | 'admin';
  is_active: boolean;
  avatar_url?: string;
  student_profile_id?: string;
  tpo_profile_id?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  register: async (data: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
    department?: string;
    degree?: string;
    graduation_year?: number;
    target_role_title?: string;
    tpo_auth_code?: string;
  }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  getMe: async (): Promise<UserResponse> => {
    const res = await apiClient.get<UserResponse>('/auth/me');
    return res.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('career_intell_token');
      localStorage.removeItem('career_intell_auth_user');
    }
  },
};
