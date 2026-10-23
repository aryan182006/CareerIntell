import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Code, 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  Upload, 
  FileText, 
  Award, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Zap, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Check 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { studentsApi } from '../api/students';
import { resumesApi } from '../api/resumes';
import { IntegratedStudentProfile } from '../types';
import TpoProfilePage from './tpo/TpoProfilePage';

interface SkillItem {
  id?: string;
  name: string;
  proficiency: string;
  proficiency_level: number;
  source?: string;
  verified?: boolean;
}

interface ProjectItem {
  id?: string;
  title: string;
  description: string;
  technologies: string;
  role: string;
  githubUrl: string;
  liveUrl: string;
}

interface CertItem {
  id?: string;
  name: string;
  issuer: string;
  year: string;
  credentialUrl: string;
}

const ROLE_PRESET_SKILLS: Record<string, string[]> = {
  'Data Scientist': ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Pandas', 'NumPy', 'Scikit-Learn', 'Data Analysis'],
  'Full Stack Developer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'REST APIs', 'SQL', 'HTML5', 'CSS3', 'Docker', 'Git'],
  'Machine Learning Engineer': ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Docker', 'FastAPI', 'Algorithms', 'Git'],
  'Cloud / DevOps Engineer': ['Linux', 'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Git', 'Bash', 'Computer Networks'],
  'Data Analyst': ['SQL', 'Python', 'Data Analysis', 'Statistics', 'Data Visualization', 'Power BI', 'Tableau', 'Communication']
};

export default function ProfilePage() {
  const { user, userRole, updateProfile, refreshProfile } = useAuth();

  // If logged-in user is a TPO, render the specialized TPO Profile
  if (userRole === 'tpo') {
    return <TpoProfilePage />;
  }

  // Active tab state: 'overview' | 'academics' | 'skills' | 'projects' | 'certifications'
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'skills' | 'projects' | 'certifications'>('overview');

  // Integrated data state
  const [integratedData, setIntegratedData] = useState<IntegratedStudentProfile | null>(null);
  const [loadingIntegrated, setLoadingIntegrated] = useState(true);
  const [syncingResume, setSyncingResume] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  
  // Academic
  const [college, setCollege] = useState(user?.college || '');
  const [degree, setDegree] = useState(user?.degree || 'B.Tech');
  const [branch, setBranch] = useState(user?.department || user?.branch || 'Computer Science');
  const [semester, setSemester] = useState(user?.semester || 6);
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear || 2026);
  const [cgpa, setCgpa] = useState<number | string>(user?.cgpa ?? 8.0);

  // Career
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Data Scientist');
  const [preferredIndustry, setPreferredIndustry] = useState(user?.preferredIndustry || 'Technology');
  const [preferredDomain, setPreferredDomain] = useState(user?.preferredDomain || 'AI/ML & Software');
  const [internshipStatus, setInternshipStatus] = useState(user?.internshipStatus || 'Looking for Placement & Internships');

  // Skills
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState('Intermediate');

  // Projects
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // Certifications
  const [certifications, setCertifications] = useState<CertItem[]>([]);

  // Resume Upload
  const [uploadingResume, setUploadingResume] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch complete integrated student data
  const loadIntegratedProfile = async () => {
    try {
      setLoadingIntegrated(true);
      const data = await studentsApi.getIntegratedProfile();
      setIntegratedData(data);

      if (data.profile) {
        setName(data.profile.full_name || user?.name || '');
        setEmail(data.profile.email || user?.email || '');
        setPhone(data.profile.phone || '');
        setBio(data.profile.bio || '');
        setDegree(data.profile.degree || 'B.Tech');
        setBranch(data.profile.department || 'Computer Science');
        setGraduationYear(data.profile.graduation_year || 2026);
        setCgpa(data.profile.current_cgpa || 8.0);
        setTargetRole(data.profile.target_role_title || 'Data Scientist');

        if (data.profile.skills && data.profile.skills.length > 0) {
          setSkills(data.profile.skills.map((s) => ({
            id: s.id,
            name: s.skill_name,
            proficiency: s.proficiency || 'Intermediate',
            proficiency_level: s.proficiency_level || 75,
            source: s.source,
            verified: s.verified
          })));
        }

        if (data.profile.projects && data.profile.projects.length > 0) {
          setProjects(data.profile.projects.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.technologies || ''),
            role: 'Developer',
            githubUrl: p.github_url || '',
            liveUrl: p.live_url || ''
          })));
        }

        if (data.profile.certifications && data.profile.certifications.length > 0) {
          setCertifications(data.profile.certifications.map((c) => ({
            id: c.id,
            name: c.name,
            issuer: c.issuing_organization,
            year: c.issue_date?.slice(0, 4) || '2025',
            credentialUrl: c.credential_url || ''
          })));
        }
      }
    } catch (e) {
      console.warn('Could not load integrated profile from API:', e);
    } finally {
      setLoadingIntegrated(false);
    }
  };

  useEffect(() => {
    loadIntegratedProfile();
  }, []);

  // Sync state when user object changes from AuthContext
  useEffect(() => {
    if (user && !integratedData) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setCollege(user.college || '');
      setDegree(user.degree || 'B.Tech');
      setBranch(user.department || user.branch || 'Computer Science');
      setSemester(user.semester || 6);
      setGraduationYear(user.graduationYear || 2026);
      setCgpa(user.cgpa ?? 8.0);
      setTargetRole(user.targetRole || 'Data Scientist');
      setPreferredIndustry(user.preferredIndustry || 'Technology');
      setPreferredDomain(user.preferredDomain || 'AI/ML & Software');
      setInternshipStatus(user.internshipStatus || 'Looking for Placement & Internships');

      if (user.skills && user.skills.length > 0 && skills.length === 0) {
        setSkills(user.skills.map((s) => ({
          name: s,
          proficiency: 'Intermediate',
          proficiency_level: 75,
          source: 'manual'
        })));
      }
    }
  }, [user]);

  // 1-Click Auto-Sync Resume to Profile
  const handleSyncResumeData = async () => {
    setSyncingResume(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await studentsApi.syncResumeData();
      if (res.status === 'warning') {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(res.message || 'Resume intelligence successfully integrated into your profile!');
        await loadIntegratedProfile();
        await refreshProfile();
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to synchronize resume data.');
    } finally {
      setSyncingResume(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  // Calculate completeness percentage
  const calculateCompleteness = () => {
    let score = 0;
    if (name.trim()) score += 15;
    if (email.trim()) score += 10;
    if (degree && branch && cgpa) score += 20;
    if (targetRole) score += 15;
    if (skills.length >= 3) score += 20;
    else if (skills.length > 0) score += 10;
    if (projects.length >= 1) score += 15;
    if (certifications.length >= 1 || bio.trim().length > 10) score += 5;
    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();

  // Add Skill
  const handleAddSkill = (skillNameToAdd?: string, prof = 'Intermediate') => {
    const sName = (skillNameToAdd || newSkillName).trim();
    if (!sName) return;

    if (skills.some(s => s.name.toLowerCase() === sName.toLowerCase())) {
      setNewSkillName('');
      return;
    }

    const levelMap: Record<string, number> = {
      'Beginner': 50,
      'Intermediate': 70,
      'Advanced': 85,
      'Expert': 95
    };

    setSkills(prev => [...prev, {
      name: sName,
      proficiency: prof,
      proficiency_level: levelMap[prof] || 70,
      source: 'manual'
    }]);

    if (!skillNameToAdd) {
      setNewSkillName('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  // Projects handlers
  const handleAddProject = () => {
    setProjects(prev => [...prev, {
      title: '',
      description: '',
      technologies: '',
      role: 'Full Stack Developer',
      githubUrl: '',
      liveUrl: ''
    }]);
  };

  const handleProjectChange = (index: number, field: keyof ProjectItem, value: string) => {
    setProjects(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveProject = (index: number) => {
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

  // Certifications handlers
  const handleAddCert = () => {
    setCertifications(prev => [...prev, {
      name: '',
      issuer: '',
      year: new Date().getFullYear().toString(),
      credentialUrl: ''
    }]);
  };

  const handleCertChange = (index: number, field: keyof CertItem, value: string) => {
    setCertifications(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveCert = (index: number) => {
    setCertifications(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Resume PDF Auto-Fill
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    setErrorMessage('');

    try {
      const res = await resumesApi.uploadResume(file);
      setSuccessMessage(`Resume parsed successfully! Extracted ${res.skills_extracted?.length || 0} skills.`);
      
      // Auto-populate skills from resume
      if (res.skills_extracted && res.skills_extracted.length > 0) {
        setSkills(prev => {
          const existingNames = new Set(prev.map(s => s.name.toLowerCase()));
          const newSkills: SkillItem[] = [...prev];
          res.skills_extracted.forEach((sk: any) => {
            if (!existingNames.has(sk.name.toLowerCase())) {
              newSkills.push({
                name: sk.name,
                proficiency: 'Intermediate',
                proficiency_level: Math.round(sk.confidence * 100) || 75,
                source: 'resume'
              });
              existingNames.add(sk.name.toLowerCase());
            }
          });
          return newSkills;
        });
      }

      await loadIntegratedProfile();
      await refreshProfile();
    } catch (err: any) {
      setErrorMessage('Failed to parse resume: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploadingResume(false);
    }
  };

  // Form Submit: Save everything to Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (!name.trim()) {
        throw new Error('Please enter your full name.');
      }
      if (skills.length === 0) {
        throw new Error('Please add at least one technical skill so the system can compute your placement readiness.');
      }

      // 1. Update Core Profile
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        college: college.trim(),
        degree: degree.trim(),
        branch: branch.trim(),
        department: branch.trim(),
        semester: Number(semester),
        graduationYear: Number(graduationYear),
        cgpa: Number(cgpa) || 0,
        targetRole: targetRole,
        preferredIndustry: preferredIndustry,
        preferredDomain: preferredDomain,
        internshipStatus: internshipStatus,
      });

      // 2. Persist Skills to Backend
      for (const sk of skills) {
        try {
          await studentsApi.addSkill({
            skill_name: sk.name.trim(),
            proficiency: sk.proficiency,
            proficiency_level: sk.proficiency_level,
            source: sk.source || 'manual'
          });
        } catch (err) {
          // ignore duplicate skill errors
        }
      }

      // 3. Persist Projects to Backend
      for (const proj of projects) {
        if (proj.title.trim() && proj.description.trim()) {
          try {
            const techArray = proj.technologies.split(',').map(t => t.trim()).filter(Boolean);
            await studentsApi.addProject({
              title: proj.title.trim(),
              description: proj.description.trim(),
              technologies: techArray,
              github_url: proj.githubUrl?.trim() || undefined,
              live_url: proj.liveUrl?.trim() || undefined
            });
          } catch (err) {
            console.warn('Could not persist project:', err);
          }
        }
      }

      // 4. Persist Certifications to Backend
      for (const cert of certifications) {
        if (cert.name.trim()) {
          try {
            await studentsApi.addCertification({
              name: cert.name.trim(),
              issuing_organization: cert.issuer.trim() || 'Accredited Organization',
              issue_date: cert.year.trim() || '2025',
              credential_url: cert.credentialUrl?.trim() || undefined
            });
          } catch (err) {
            console.warn('Could not persist certification:', err);
          }
        }
      }

      await loadIntegratedProfile();
      await refreshProfile();
      setSuccessMessage('Profile and career intelligence updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);

    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving your profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedSkills = ROLE_PRESET_SKILLS[targetRole] || ROLE_PRESET_SKILLS['Data Scientist'];
  const readinessScore = integratedData?.readiness_overview?.score || user?.readinessScore || 78.5;

  if (loadingIntegrated && !integratedData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading integrated student profile & career intelligence...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* 360° All-in-One Executive Student Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-slate-700/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-400 font-extrabold text-xl sm:text-2xl">
                {name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ST'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">{name || 'Student Candidate'}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Target: {targetRole}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {integratedData?.readiness_overview?.tier || 'Placement Active'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-2 flex-wrap">
                <span>{degree} {branch}</span>
                <span className="text-slate-600">•</span>
                <span>CGPA: <strong className="text-white">{cgpa}</strong></span>
                <span className="text-slate-600">•</span>
                <span>Class of {graduationYear}</span>
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{email}</span>
                {phone && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span>{phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Readiness Gauge Badge */}
          <div className="flex items-center gap-4 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-700/60 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Placement Readiness</span>
              <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
                {readinessScore}%
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {readinessScore >= 75 ? 'Tier-1 Ready' : (readinessScore >= 60 ? 'Near Ready' : 'In Progress')}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 flex items-center justify-center font-bold text-xs text-white">
              {Math.round(readinessScore)}
            </div>
          </div>
        </div>

        {/* Completeness Bar */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Profile Completeness: <strong>{completeness}%</strong></span>
          </div>
          <div className="w-48 sm:w-64 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div 
              className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs for All-in-One Profile */}
      <div className="flex rounded-2xl bg-white p-1.5 border border-slate-200 shadow-sm overflow-x-auto gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>🌟 360° All-in-One Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('academics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'academics'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>🎓 Academics & Ambition</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'skills'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>⚡ Skills Matrix ({skills.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'projects'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>💼 Projects ({projects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('certifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'certifications'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>📜 Credentials ({certifications.length})</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: 360° ALL-IN-ONE INTEGRATED HUB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Integrated Resume Intelligence & 1-Click Sync Card */}
          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl border-2 border-blue-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Resume Intelligence & Multi-Data Integration</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                      All-in-One Sync
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Connects your parsed PDF resume with your live profile, skill gaps, and interview prep.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-sm transition-all">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>{uploadingResume ? 'Extracting...' : 'Upload PDF Resume'}</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSyncResumeData}
                  disabled={syncingResume || !integratedData?.latest_resume}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingResume ? 'animate-spin' : ''}`} />
                  <span>{syncingResume ? 'Syncing Intelligence...' : '⚡ 1-Click Sync Resume Data to Profile'}</span>
                </button>
              </div>
            </div>

            {/* Linked Resume Metadata Banner */}
            {integratedData?.latest_resume ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-white border border-blue-100 shadow-xs">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Linked Resume</span>
                    <p className="text-xs font-bold text-slate-900 truncate">{integratedData.latest_resume.file_name}</p>
                    <span className="text-[10px] text-slate-500">
                      {Math.round(integratedData.latest_resume.file_size / 1024)} KB • {new Date(integratedData.latest_resume.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">NLP Extracted Skills</span>
                    <p className="text-xs font-bold text-slate-900">
                      {integratedData.latest_resume.skills_extracted?.length || 0} Skills Detected
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold">Parsed with PyMuPDF Engine</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parsed Document Sections</span>
                    <p className="text-xs font-bold text-slate-900">
                      {Object.keys(integratedData.latest_resume.sections || {}).length} Resume Sections
                    </p>
                    <span className="text-[10px] text-indigo-600 font-semibold">{integratedData.latest_resume.word_count || 0} Words Processed</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>No resume uploaded yet. Upload your PDF resume to auto-populate your skills, experience, and projects!</span>
                </div>
                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0">
                  Upload PDF Now
                  <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                </label>
              </div>
            )}

            {/* Extracted Sections Intelligence Preview */}
            {integratedData?.latest_resume?.sections && Object.keys(integratedData.latest_resume.sections).length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Extracted Sections Preview (Direct from your PDF Resume):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {integratedData.latest_resume.sections.experience && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5 text-blue-700">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Extracted Work Experience / Internships</span>
                      </span>
                      <p className="text-slate-600 line-clamp-3 leading-relaxed">
                        {integratedData.latest_resume.sections.experience}
                      </p>
                    </div>
                  )}

                  {integratedData.latest_resume.sections.projects && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5 text-indigo-700">
                        <Code className="w-3.5 h-3.5" />
                        <span>Extracted Projects</span>
                      </span>
                      <p className="text-slate-600 line-clamp-3 leading-relaxed">
                        {integratedData.latest_resume.sections.projects}
                      </p>
                    </div>
                  )}

                  {integratedData.latest_resume.sections.education && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5 text-emerald-700">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Extracted Academic Qualifications</span>
                      </span>
                      <p className="text-slate-600 line-clamp-3 leading-relaxed">
                        {integratedData.latest_resume.sections.education}
                      </p>
                    </div>
                  )}

                  {integratedData.latest_resume.sections.skills && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5 text-amber-700">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Detected Skills Snippet</span>
                      </span>
                      <p className="text-slate-600 line-clamp-3 leading-relaxed">
                        {integratedData.latest_resume.sections.skills}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Integrated Intelligence Grid: Skills Provenance + Assessments + Interview Practice */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Multi-Source Skills Matrix Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span>Skills Provenance</span>
                </span>
                <span className="text-xs font-bold text-blue-600">{skills.length} Total</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>From Resume (NLP)</span>
                  </span>
                  <span className="font-bold text-slate-900">
                    {skills.filter(s => s.source === 'resume').length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Assessment Verified</span>
                  </span>
                  <span className="font-bold text-slate-900">
                    {skills.filter(s => s.verified || s.source === 'assessment' || s.source === 'verified').length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Self Reported</span>
                  </span>
                  <span className="font-bold text-slate-900">
                    {skills.filter(s => !s.source || s.source === 'manual').length}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className="w-full py-2 text-center text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/50 rounded-xl hover:bg-blue-50 transition-colors"
              >
                Manage Skills Matrix →
              </button>
            </div>

            {/* 2. Assessment Attempts & Badges */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Technical Assessments</span>
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {integratedData?.assessments_summary?.completed_tests || 0} Taken
                </span>
              </div>

              {integratedData?.assessments_summary && integratedData.assessments_summary.completed_tests > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Average Assessment Score</span>
                    <span className="font-black text-emerald-600">{integratedData.assessments_summary.average_score}%</span>
                  </div>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {integratedData.assessments_summary.recent_attempts?.map((a) => (
                      <div key={a.id} className="p-2 rounded-lg bg-slate-50 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-800 truncate pr-2">{a.title}</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${a.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                          {a.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-500 space-y-2">
                  <p>No assessments completed yet.</p>
                  <Link to="/assessments" className="inline-block text-xs font-bold text-emerald-600 hover:underline">
                    Take Skill Assessment →
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Interview Prep Practice */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  <span>Interview Prep Mastery</span>
                </span>
                <span className="text-xs font-bold text-purple-600">
                  {integratedData?.interview_summary?.questions_practiced || 0} Practiced
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-600">Mastered Questions</span>
                  <span className="font-bold text-purple-700">
                    {integratedData?.interview_summary?.mastered_questions || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-600">Confidence Self-Rating</span>
                  <span className="font-bold text-slate-900">
                    {integratedData?.interview_summary?.average_rating || '—'} / 5.0
                  </span>
                </div>
              </div>

              <Link
                to="/interview-prep"
                className="w-full py-2 block text-center text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50/50 rounded-xl hover:bg-purple-50 transition-colors"
              >
                Practice Interview Questions →
              </Link>
            </div>

          </div>

          {/* Quick Edit CTA bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Ready to update your credentials?</h3>
              <p className="text-[11px] text-slate-500">Switch tabs above or jump to Academics to update CGPA, department, and career ambition.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('academics')}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Edit Academics & Ambition →
            </button>
          </div>

        </div>
      )}

      {/* TAB 2: ACADEMICS & CAREER AMBITION */}
      {activeTab === 'academics' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Academic & Target Ambition</h2>
                  <p className="text-xs text-slate-500">Essential student information used to benchmark placement readiness</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Profile</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="e.g. Alex Chen"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="student@college.edu"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Direct Contact / Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Target Career Ambition
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                  <option value="Cloud / DevOps Engineer">Cloud / DevOps Engineer</option>
                  <option value="Data Analyst">Data Analyst</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Degree
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="B.Tech"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Department / Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="Computer Science & Engineering"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Current Cumulative CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="8.8"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Graduation Year
                </label>
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Bio & Career Statement
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-normal leading-relaxed"
                placeholder="Share your career focus, specialization, or technical passion..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Academics & Ambition</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: SKILLS MATRIX */}
      {activeTab === 'skills' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Technical Skills Matrix</h2>
                  <p className="text-xs text-slate-500">Multi-source skills integrated from Resume, Assessments, and Self-Reporting</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600">{skills.length} Skills Listed</span>
            </div>

            {/* Quick Add Custom Skill */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. Python, Docker, PyTorch)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />

              <select
                value={newSkillProf}
                onChange={(e) => setNewSkillProf(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>

              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Role Suggested Preset Skills */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Recommended for {targetRole}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedSkills.map((sk) => {
                  const isAdded = skills.some(s => s.name.toLowerCase() === sk.toLowerCase());
                  return (
                    <button
                      key={sk}
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddSkill(sk)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isAdded
                          ? 'bg-slate-100 text-slate-400 cursor-default'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{sk}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Active Skills List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Current Active Skills ({skills.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {skills.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="overflow-hidden">
                      <span className="font-bold text-xs text-slate-900 block truncate">{s.name}</span>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] font-medium text-slate-500">{s.proficiency}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                          {s.source || 'manual'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Skills Matrix</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: PROJECTS & WORK EXPERIENCE */}
      {activeTab === 'projects' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Projects & Practical Experience</h2>
                  <p className="text-xs text-slate-500">Showcase software products, machine learning models, and GitHub repositories</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddProject}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                <p>No projects added yet. Click &apos;Add Project&apos; or use 1-Click Resume Sync to import them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Project #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="text-slate-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Project Title</label>
                        <input
                          type="text"
                          required
                          value={proj.title}
                          onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                          placeholder="e.g. Predictive Churn Platform"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Technologies Used (comma separated)</label>
                        <input
                          type="text"
                          value={proj.technologies}
                          onChange={(e) => handleProjectChange(idx, 'technologies', e.target.value)}
                          placeholder="e.g. Python, Scikit-Learn, FastAPI, React"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">GitHub Repo URL</label>
                        <input
                          type="url"
                          value={proj.githubUrl}
                          onChange={(e) => handleProjectChange(idx, 'githubUrl', e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Live Demo URL</label>
                        <input
                          type="url"
                          value={proj.liveUrl}
                          onChange={(e) => handleProjectChange(idx, 'liveUrl', e.target.value)}
                          placeholder="https://demo-app.com"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Project Description & Outcomes</label>
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                        placeholder="Built an end-to-end model achieving 89% accuracy and deployed interactive dashboard..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-normal"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Projects</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 5: CERTIFICATIONS & CREDENTIALS */}
      {activeTab === 'certifications' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Certifications & Credentials</h2>
                  <p className="text-xs text-slate-500">Verified third-party qualifications, courses, and certifications</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddCert}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Certificate</span>
              </button>
            </div>

            {certifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                <Award className="w-8 h-8 text-slate-400 mx-auto" />
                <p>No certifications added yet. Add Coursera, AWS, Google, or university credentials.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Certificate Title</label>
                      <input
                        type="text"
                        required
                        value={cert.name}
                        onChange={(e) => handleCertChange(idx, 'name', e.target.value)}
                        placeholder="e.g. AWS Certified Solutions Architect"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Issuing Body</label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => handleCertChange(idx, 'issuer', e.target.value)}
                        placeholder="e.g. Amazon Web Services"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Year</label>
                        <input
                          type="text"
                          value={cert.year}
                          onChange={(e) => handleCertChange(idx, 'year', e.target.value)}
                          placeholder="2025"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(idx)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors mt-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Certifications</span>
              </button>
            </div>
          </div>
        </form>
      )}

    </div>
  );
}
