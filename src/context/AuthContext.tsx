import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StudentProfile } from '../types';
import { authApi } from '../api/auth';
import { studentsApi, BackendProfile } from '../api/students';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'tpo';
  department?: string;
  degree?: string;
  graduationYear?: number;
  targetRole?: string;
  tpoAuthCode?: string;
}

interface AuthContextType {
  user: StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: 'student' | 'tpo' | 'admin';
  login: (email: string, password: string) => Promise<'student' | 'tpo' | 'admin'>;
  register: (data: RegisterData) => Promise<'student' | 'tpo' | 'admin'>;
  updateProfile: (updatedData: Partial<StudentProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'career_intell_token';
const USER_KEY = 'career_intell_user_info';

function adaptBackendProfile(bp: BackendProfile, email: string, role: 'student' | 'tpo' | 'admin'): StudentProfile {
  return {
    id: bp.id,
    name: bp.full_name,
    email: bp.email || email,
    phone: bp.phone || '',
    bio: bp.bio || '',
    college: 'Engineering Institute of Technology',
    degree: bp.degree || 'B.Tech',
    branch: bp.department || 'Computer Science',
    department: bp.department || 'Computer Science',
    semester: 6,
    graduationYear: bp.graduation_year || 2026,
    cgpa: bp.current_cgpa || 8.0,
    targetRole: bp.target_role_title || 'Data Scientist',
    preferredIndustry: 'Technology',
    preferredDomain: 'AI/ML & Software',
    skills: bp.skills?.map((s) => s.skill_name) || [],
    projects: bp.projects?.map((p) => ({
      id: p.id,
      name: p.title,
      description: p.description,
      technologies: p.technologies || [],
      role: 'Developer',
      githubUrl: p.github_url,
      liveUrl: p.live_url,
    })) || [],
    certifications: bp.certifications?.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuing_organization,
      year: c.issue_date?.slice(0, 4) || '2025',
      credentialUrl: c.credential_url,
    })) || [],
    internshipStatus: 'Looking for Placement & Internships',
    userRole: role,
    readinessScore: bp.readiness_score,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(TOKEN_KEY) !== null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return localStorage.getItem(TOKEN_KEY) !== null;
  });

  const [userRole, setUserRole] = useState<'student' | 'tpo' | 'admin'>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return u.userRole || 'student';
      } catch (e) {
        return 'student';
      }
    }
    return 'student';
  });

  // Verify real session on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      try {
        const me = await authApi.getMe();
        setUserRole(me.role);

        if (me.role === 'student') {
          const profile = await studentsApi.getMyProfile();
          const adapted = adaptBackendProfile(profile, me.email, me.role);
          setUser(adapted);
          localStorage.setItem(USER_KEY, JSON.stringify(adapted));
        } else {
          const tpoProfile: StudentProfile = {
            id: me.id,
            name: me.full_name,
            email: me.email,
            college: 'Placement Cell',
            degree: 'Administration',
            branch: 'Training & Placement',
            semester: 0,
            graduationYear: 2026,
            cgpa: 0,
            targetRole: 'Placement Officer',
            skills: [],
            projects: [],
            certifications: [],
            internshipStatus: 'Active Officer',
            userRole: me.role,
          };
          setUser(tpoProfile);
          localStorage.setItem(USER_KEY, JSON.stringify(tpoProfile));
        }
        setIsAuthenticated(true);
      } catch (e) {
        console.warn('Session expired or invalid token:', e);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshProfile = async () => {
    try {
      const me = await authApi.getMe();
      setUserRole(me.role);
      if (me.role === 'student') {
        const profile = await studentsApi.getMyProfile();
        const adapted = adaptBackendProfile(profile, me.email, me.role);
        setUser(adapted);
        localStorage.setItem(USER_KEY, JSON.stringify(adapted));
      }
    } catch (e) {
      console.warn('Could not refresh profile:', e);
    }
  };

  const login = async (email: string, password: string): Promise<'student' | 'tpo' | 'admin'> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email.trim().toLowerCase(), password);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      const role = res.user.role;
      setUserRole(role);

      if (role === 'student') {
        const profile = await studentsApi.getMyProfile();
        const adapted = adaptBackendProfile(profile, res.user.email, role);
        setUser(adapted);
        localStorage.setItem(USER_KEY, JSON.stringify(adapted));
      } else {
        const officerProfile: StudentProfile = {
          id: res.user.id,
          name: res.user.full_name,
          email: res.user.email,
          college: 'Placement Cell',
          degree: 'Administration',
          branch: 'Training & Placement',
          semester: 0,
          graduationYear: 2026,
          cgpa: 0,
          targetRole: 'Placement Officer',
          skills: [],
          projects: [],
          certifications: [],
          internshipStatus: 'Active Officer',
          userRole: role,
        };
        setUser(officerProfile);
        localStorage.setItem(USER_KEY, JSON.stringify(officerProfile));
      }

      setIsAuthenticated(true);
      return role;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<'student' | 'tpo' | 'admin'> => {
    setIsLoading(true);
    try {
      const res = await authApi.register({
        full_name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role || 'student',
        department: data.department || 'Computer Science',
        degree: data.degree || 'B.Tech',
        graduation_year: data.graduationYear || 2026,
        target_role_title: data.targetRole || 'Data Scientist',
        tpo_auth_code: data.tpoAuthCode,
      });

      localStorage.setItem(TOKEN_KEY, res.access_token);
      const role = res.user.role;
      setUserRole(role);

      if (role === 'student') {
        const profile = await studentsApi.getMyProfile();
        const adapted = adaptBackendProfile(profile, data.email, role);
        setUser(adapted);
        localStorage.setItem(USER_KEY, JSON.stringify(adapted));
      } else {
        const officerProfile: StudentProfile = {
          id: res.user.id,
          name: res.user.full_name,
          email: res.user.email,
          college: 'Placement Cell',
          degree: 'Administration',
          branch: data.department || 'Training & Placement',
          semester: 0,
          graduationYear: 2026,
          cgpa: 0,
          targetRole: 'Placement Officer',
          skills: [],
          projects: [],
          certifications: [],
          internshipStatus: 'Active Officer',
          userRole: role,
        };
        setUser(officerProfile);
        localStorage.setItem(USER_KEY, JSON.stringify(officerProfile));
      }

      setIsAuthenticated(true);
      return role;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updatedData: Partial<StudentProfile>) => {
    if (user) {
      try {
        await studentsApi.updateMyProfile({
          full_name: updatedData.name,
          department: updatedData.department || updatedData.branch,
          degree: updatedData.degree,
          graduation_year: updatedData.graduationYear,
          current_cgpa: updatedData.cgpa,
          phone: updatedData.phone,
          bio: updatedData.bio,
          target_role_title: updatedData.targetRole,
        });
        await refreshProfile();
      } catch (e) {
        console.warn('Failed to update remote profile:', e);
        const updated = { ...user, ...updatedData };
        setUser(updated);
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
      }
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setUserRole('student');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    authApi.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        userRole,
        login,
        register,
        updateProfile,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
