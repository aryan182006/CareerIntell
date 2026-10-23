export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  role: string;
  githubUrl?: string;
  liveUrl?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  credentialUrl?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  college: string;
  degree: string;
  branch: string;
  semester: number;
  graduationYear: number;
  cgpa: number;
  targetRole: string;
  preferredIndustry?: string;
  preferredDomain?: string;
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  internshipStatus: string;
  internshipDuration?: string;
  userRole?: 'student' | 'tpo' | 'admin';
  department?: string;
  readinessScore?: number;
}

export interface SkillGap {
  skillName: string;
  currentLevel: number;
  requiredLevel: number;
  difference: number;
  priority: 'Low' | 'Medium' | 'High' | 'Strong';
}

export interface RoleMatch {
  roleId: string;
  roleName: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface ReadinessAssessment {
  score: number;
  category: 'Needs Improvement' | 'Developing' | 'Job Ready' | 'Strong Match';
  factors: string[];
  strengths: string[];
  gaps: string[];
}

export interface RoadmapTask {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  duration?: string;
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  goal: string;
  skills: string[];
  tasks: RoadmapTask[];
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface Roadmap {
  targetRole: string;
  phases: RoadmapPhase[];
  recommendedProject: {
    title: string;
    description: string;
  };
}

export interface TpoProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  designation: string;
  institution_name: string;
  department: string;
  emp_id: string;
  office_room: string;
  official_phone: string;
  office_hours: string;
  placement_season: string;
  authorized_code_used?: string;
  bio: string;
  min_cgpa_cutoff: number;
  target_grad_batches: string;
  total_supervised_students: number;
  batch_average_readiness: number;
  eligible_students_count: number;
  active_drives_count: number;
}

export interface IntegratedResumeData {
  id: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
  sections: {
    education?: string;
    skills?: string;
    experience?: string;
    projects?: string;
    certifications?: string;
    header?: string;
    [key: string]: string | undefined;
  };
  skills_extracted: Array<{
    name: string;
    category?: string;
    confidence: number;
  }>;
  raw_text_snippet: string;
  word_count: number;
  page_count: number;
}

export interface IntegratedStudentProfile {
  profile: {
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
    skills: Array<{
      id: string;
      skill_name: string;
      proficiency: string;
      proficiency_level: number;
      source: string;
      verified: boolean;
    }>;
    projects: Array<{
      id: string;
      title: string;
      description: string;
      technologies: string[];
      github_url?: string;
      live_url?: string;
    }>;
    certifications: Array<{
      id: string;
      name: string;
      issuing_organization: string;
      issue_date?: string;
      credential_id?: string;
      credential_url?: string;
    }>;
  };
  latest_resume: IntegratedResumeData | null;
  skills_summary: {
    total_skills: number;
    resume_extracted_count: number;
    verified_count: number;
    manual_count: number;
    skills: Array<{
      id: string;
      skill_name: string;
      proficiency: string;
      proficiency_level: number;
      source: string;
      verified: boolean;
    }>;
  };
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    github_url?: string;
    live_url?: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuing_organization: string;
    issue_date?: string;
    credential_id?: string;
    credential_url?: string;
  }>;
  assessments_summary: {
    completed_tests: number;
    passed_tests: number;
    average_score: number;
    recent_attempts: Array<{
      id: string;
      title: string;
      category: string;
      score: number;
      passed: boolean;
      attempted_at: string;
    }>;
  };
  interview_summary: {
    questions_practiced: number;
    mastered_questions: number;
    average_rating: number;
  };
  readiness_overview: {
    score: number;
    tier: string;
    target_role: string;
    trajectory: Array<{
      score: number;
      recorded_at: string;
      role: string;
    }>;
  };
}
