import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Target, 
  Map, 
  ChevronDown, 
  TrendingUp, 
  BarChart3, 
  Award, 
  Cpu, 
  Star,
  Layers,
  Play,
  LogOut,
  Users,
  GraduationCap,
  Building2,
  Check,
  Sliders,
  Menu,
  X,
  Lock
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, userRole, logout } = useAuth();

  // Interactive states
  const [selectedRole, setSelectedRole] = useState('Data Scientist');
  const [activePersona, setActivePersona] = useState<'student' | 'tpo'>('student');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Role diagnostic sandbox data
  const rolesData: Record<string, { 
    matchScore: number; 
    salary: string; 
    lpa: string;
    level: string;
    topSkills: string[]; 
    missingSkills: string[]; 
    atsScore: number;
    recommendedMilestone: string;
  }> = {
    'Data Scientist': {
      matchScore: 86,
      salary: '$118,000 / yr',
      lpa: '₹14.5 LPA avg',
      level: 'Advanced Ready',
      topSkills: ['Python & Pandas', 'Machine Learning', 'Statistical Modeling', 'SQL & EDA'],
      missingSkills: ['PyTorch / Deep Learning', 'Docker Containerization', 'A/B Testing Experiments'],
      atsScore: 88,
      recommendedMilestone: 'Phase 2: Deep Learning & Neural Architectures'
    },
    'AI / ML Engineer': {
      matchScore: 74,
      salary: '$135,000 / yr',
      lpa: '₹18.0 LPA avg',
      level: 'Targeted Prep Required',
      topSkills: ['Python', 'Scikit-Learn', 'Linear Algebra & Calculus', 'Vector DBs'],
      missingSkills: ['LLM Fine-Tuning (LoRA/PEFT)', 'Triton Inference Server', 'CUDA / GPU Optimization'],
      atsScore: 82,
      recommendedMilestone: 'Phase 1: PyTorch Tensors & Model Serving'
    },
    'Full Stack Engineer': {
      matchScore: 82,
      salary: '$112,000 / yr',
      lpa: '₹13.2 LPA avg',
      level: 'High Placement Probability',
      topSkills: ['React & TypeScript', 'Node.js & Express', 'Tailwind CSS', 'RESTful APIs'],
      missingSkills: ['Distributed Caching (Redis)', 'PostgreSQL Index Tuning', 'CI/CD Pipelines (GitHub Actions)'],
      atsScore: 89,
      recommendedMilestone: 'Phase 3: System Design & Microservice Caching'
    },
    'Cloud DevOps': {
      matchScore: 79,
      salary: '$126,000 / yr',
      lpa: '₹15.5 LPA avg',
      level: 'Interview Ready',
      topSkills: ['Linux CLI & Bash', 'Docker Containers', 'AWS Core Services (S3, EC2)'],
      missingSkills: ['Kubernetes (K8s) Cluster Ops', 'Terraform Infrastructure as Code', 'Prometheus & Grafana'],
      atsScore: 84,
      recommendedMilestone: 'Phase 2: Kubernetes Orchestration & Helm Charts'
    },
    'Data Analyst': {
      matchScore: 91,
      salary: '$96,000 / yr',
      lpa: '₹11.0 LPA avg',
      level: 'Tier-1 Qualified',
      topSkills: ['Advanced SQL Queries', 'Power BI & Tableau', 'Data Cleaning & Wrangling', 'Excel Financial Modeling'],
      missingSkills: ['Python Automation Scripts', 'Hypothesis Testing Frameworks', 'Executive Storytelling'],
      atsScore: 94,
      recommendedMilestone: 'Phase 4: Capstone Business Intelligence Dashboard'
    }
  };

  const currentRole = rolesData[selectedRole] || rolesData['Data Scientist'];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleCtaClick = () => {
    if (isAuthenticated) {
      if (userRole === 'tpo') {
        navigate('/tpo');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900 relative selection:bg-indigo-500 selection:text-white font-sans bg-hairline-grid">
      {/* Soft Ambient Light Flares (Neither dark nor pure white) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[580px] bg-gradient-to-tr from-indigo-200/40 via-sky-200/35 to-violet-200/35 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-0 w-[600px] h-[500px] bg-gradient-to-bl from-teal-100/40 via-indigo-100/30 to-purple-100/30 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* ========================================================= */}
      {/* 1. FLOATING FROSTED PEARL NAVBAR                          */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#f6f8fb]/85 border-b border-slate-200/80 transition-all shadow-pearl-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between" aria-label="Main Navigation">
          {/* Brand Mark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-sky-600 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="h-full w-full bg-white/95 rounded-[10px] flex items-center justify-center backdrop-blur-sm">
                <BrainCircuit className="h-5 w-5 text-indigo-600 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg tracking-tight text-slate-900">
                Career<span className="text-indigo-600">Intell</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                AI
              </span>
            </div>
          </Link>

          {/* Minimal Centered Frosted Navigation Capsule */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/70 backdrop-blur-md border border-slate-200/80 shadow-pearl-sm">
            <a 
              href="#features" 
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white/90 hover:shadow-sm transition-all"
            >
              Features
            </a>
            <a 
              href="#calculator" 
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white/90 hover:shadow-sm transition-all"
            >
              AI Sandbox
            </a>
            <a 
              href="#roadmap" 
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white/90 hover:shadow-sm transition-all"
            >
              Roadmap
            </a>
          </div>

          {/* Auth State CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <div className="frosted-pill px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{user?.name?.split(' ')[0] || 'User'}</span>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {userRole}
                  </span>
                </div>
                <Link
                  to={userRole === 'tpo' ? '/tpo' : '/dashboard'}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  {userRole === 'tpo' ? 'TPO Portal' : 'Command Center'}
                </Link>
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-1.5"
                >
                  Register Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white/80 border border-slate-200"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden px-6 pt-3 pb-6 border-t border-slate-200/90 bg-[#f6f8fb]/95 backdrop-blur-xl space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700 pt-2">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 px-3 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Features
              </a>
              <a 
                href="#calculator" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 px-3 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                AI Sandbox
              </a>
              <a 
                href="#roadmap" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 px-3 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Roadmap
              </a>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={userRole === 'tpo' ? '/tpo' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-center text-sm"
                  >
                    Go to {userRole === 'tpo' ? 'TPO Portal' : 'Dashboard'}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 rounded-xl text-rose-600 font-semibold text-center text-sm border border-rose-200 bg-rose-50/50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-center text-sm shadow-md"
                  >
                    Register Free
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2 rounded-xl text-slate-700 font-semibold text-center text-sm border border-slate-200 bg-white"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* 2. PEARL HERO SECTION                                     */}
      {/* ========================================================= */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Live Placement Season Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full frosted-pill border border-indigo-200/90 shadow-pearl-sm text-xs font-semibold text-indigo-700 mb-8 animate-float">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Next-Gen Placement Intelligence Engine</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">2025–26 Season Active</span>
        </div>

        {/* High-Impact Headline */}
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.12]">
          Know Where You Stand.{' '}
          <span className="text-gradient-indigo block mt-2">
            Know What to Master Next.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
          Stop guessing your placement readiness. Parse your resume with PyMuPDF, benchmark skill gaps against real MAANG &amp; Tier-1 company JDs, practice STAR behavioral interviews, and get hired faster.
        </p>

        {/* Dual Primary Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={handleCtaClick}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 group"
          >
            <Sparkles className="w-5 h-5 text-indigo-200 group-hover:scale-110 transition-transform" />
            <span>Analyze My Readiness Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="#calculator"
            className="w-full sm:w-auto px-7 py-4 rounded-xl frosted-pill hover:bg-white text-slate-700 hover:text-indigo-600 font-semibold text-base border border-slate-200/90 shadow-pearl-sm hover:shadow-pearl-md transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 text-indigo-500 fill-indigo-500/20" />
            <span>Try AI Sandbox</span>
          </a>
        </div>

        {/* Trust Proof Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>100% Student &amp; TPO Focused</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Secret TPO Security Gate</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>PyMuPDF Section Extraction</span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE LIVE AI ROLE SANDBOX (#calculator)         */}
      {/* ========================================================= */}
      <section id="calculator" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full frosted-pill border border-indigo-200 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" />
            Live AI Simulation
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Select Your Target Engineering Role
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            See how our dynamic scoring engine maps skill proficiencies, market benchmarks, and missing gaps in real time.
          </p>

          {/* Interactive Role Switcher Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl frosted-pill border border-slate-200/90 max-w-3xl mx-auto">
            {Object.keys(rolesData).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedRole === role
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-100'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Live Sandbox Diagnostic Card */}
        <div className="frosted-panel rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-pearl-lg relative overflow-hidden">
          {/* Subtle decorative mesh flare */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Gauge & Readiness Overview */}
            <div className="lg:col-span-5 flex flex-col items-center text-center p-6 rounded-2xl bg-white/70 border border-slate-200/80 shadow-pearl-sm">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Diagnostic Match Score
              </span>

              {/* Radial Score Gauge */}
              <div className="relative my-5 flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="#4f46e5"
                    strokeWidth="12"
                    strokeDasharray={427}
                    strokeDashoffset={427 - (427 * currentRole.matchScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-display text-4xl font-extrabold text-slate-900">
                    {currentRole.matchScore}%
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    {currentRole.level}
                  </span>
                </div>
              </div>

              {/* Key Quick Stats */}
              <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/70 text-left">
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Benchmark Salary</span>
                  <span className="text-sm font-bold text-slate-900">{currentRole.lpa}</span>
                  <span className="text-[10px] text-slate-400 block">{currentRole.salary}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">ATS Readability</span>
                  <span className="text-sm font-bold text-indigo-600">{currentRole.atsScore}/100</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Tier-1 Pass</span>
                </div>
              </div>
            </div>

            {/* Right Skills & Actionable Gap Rail */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Verified Matched Skills ({currentRole.topSkills.length})
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                    Ready for Screening
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentRole.topSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50/80 text-emerald-800 border border-emerald-200/80 flex items-center gap-1.5 shadow-pearl-sm"
                    >
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-amber-500" />
                    Priority Missing Skill Gaps ({currentRole.missingSkills.length})
                  </span>
                  <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/70">
                    Action Required
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentRole.missingSkills.map((gap, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50/90 text-amber-900 border border-amber-200/80 flex items-center gap-1.5 shadow-pearl-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {gap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Roadmap Sprint */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100/90 flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-indigo-600 text-white flex-shrink-0 mt-0.5">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-900 block">
                    Recommended Milestone Sprint
                  </span>
                  <p className="text-xs text-indigo-700 mt-0.5 font-medium">
                    {currentRole.recommendedMilestone}
                  </p>
                </div>
              </div>

              {/* Quick Jump Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
                  Run this check against your actual uploaded PDF resume in under 15 seconds.
                </span>
                <button
                  onClick={handleCtaClick}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run My PDF Analysis</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. DUAL-PERSONA SWITCHER (Student vs TPO) (#persona)       */}
      {/* ========================================================= */}
      <section id="persona" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full frosted-pill border border-indigo-200 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            Built for Both Stakeholders
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tailored Experiences for Students &amp; Placement Officers
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Switch views below to see how CareerIntell empowers candidates to level up and enables college TPOs to seamlessly place full batches.
          </p>

          {/* Persona Toggle */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl frosted-pill border border-slate-200/90 shadow-pearl-sm">
            <button
              onClick={() => setActivePersona('student')}
              className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activePersona === 'student'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>For Students (Level Up &amp; Get Placed)</span>
            </button>
            <button
              onClick={() => setActivePersona('tpo')}
              className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activePersona === 'tpo'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>For Placement Officers (Manage &amp; Place Batches)</span>
            </button>
          </div>
        </div>

        {/* Persona Content Display */}
        {activePersona === 'student' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* 4 Key Student Capabilities */}
            <div className="lg:col-span-7 space-y-4">
              <div className="frosted-card-hover p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">PyMuPDF Deep Resume Parsing</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      Instant extraction of technical skills, academic coursework, and projects with automated section-level ATS scoring and readability grading.
                    </p>
                  </div>
                </div>
              </div>

              <div className="frosted-card-hover p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                    <Map className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">4-Phase Learning Milestones</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      Transform your identified skill gaps into 4 structured, weekly milestones with direct links to vetted documentation, cheat sheets, and practical exercises.
                    </p>
                  </div>
                </div>
              </div>

              <div className="frosted-card-hover p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">STAR Company Mock Interview Simulator</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      Practice real interview scenarios with automated feedback on your Situation, Task, Action, and Result structured responses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="frosted-card-hover p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Verified Assessment Badges</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      Complete timed technical assessments to earn verified skill badges visible directly to campus recruiters and your college TPO.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Preview Mockup */}
            <div className="lg:col-span-5">
              <div className="frosted-panel rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-pearl-md relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      AC
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Alex Chen (Student)</div>
                      <div className="text-[10px] text-slate-500">Computer Science • B.Tech 2026</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    Profile Verified
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                      <span>Placement Readiness</span>
                      <span className="text-indigo-600 font-extrabold">86%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full w-[86%]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/70 border border-slate-200/70 text-center">
                      <span className="text-[10px] text-slate-500 block">ATS Score</span>
                      <span className="text-lg font-extrabold text-slate-900">92/100</span>
                      <span className="text-[10px] text-emerald-600 font-bold block">Optimized</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/70 border border-slate-200/70 text-center">
                      <span className="text-[10px] text-slate-500 block">STAR Sessions</span>
                      <span className="text-lg font-extrabold text-indigo-600">8 Completed</span>
                      <span className="text-[10px] text-slate-500 font-medium block">4.8 / 5.0 Rating</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs">
                    <span className="font-bold text-indigo-900 block mb-1">Active Target Role:</span>
                    <span className="text-indigo-700 font-semibold block">Full Stack AI Engineer</span>
                    <span className="text-[11px] text-indigo-600 mt-1 block">Next up: Complete Docker Microservices Assessment</span>
                  </div>

                  <Link
                    to="/register"
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <span>Start Your Student Diagnostic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* 4 Key TPO Capabilities */}
            <div className="lg:col-span-7 space-y-4">
              <div className="frosted-card-hover p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Secret TPO Authentication Gate</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      Enforce strict access control. Only authorized campus placement officials possessing your university master passkey can register and view full batch rosters.
                    </p>
                  </div>
                </div>
              </div>

              <div className="frosted-card-hover p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Batch Readiness &amp; Department Analytics</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      Filter cohorts by CGPA, branch, target role, and verified assessment scores. Spot underperforming skill segments before recruiter drives land on campus.
                    </p>
                  </div>
                </div>
              </div>

              <div className="frosted-card-hover p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">1-Click Recruiter Shortlist Generation</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      Export candidate packets matching visiting company criteria (e.g. &gt;8.0 CGPA, &gt;80% Python &amp; SQL score) directly into clean CSV spreadsheets.
                    </p>
                  </div>
                </div>
              </div>

              <div className="frosted-card-hover p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Placement Drive Pipeline Coordinator</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      Manage multiple active company drives, set application cutoffs, and monitor student registration statuses in one unified command center.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* TPO Preview Mockup */}
            <div className="lg:col-span-5">
              <div className="frosted-panel rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-pearl-md relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                      TPO
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Prof. R. Sharma (Officer)</div>
                      <div className="text-[10px] text-slate-500">Placement Cell • Verified Auth</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                    Admin Portal
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block">Total Batch</span>
                      <span className="text-base font-extrabold text-slate-900">412</span>
                      <span className="text-[9px] text-slate-400">Class 2026</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block">Avg Match</span>
                      <span className="text-base font-extrabold text-indigo-600">79.4%</span>
                      <span className="text-[9px] text-emerald-600 font-bold">+6.2% MoM</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block">Active Drives</span>
                      <span className="text-base font-extrabold text-amber-600">3 Live</span>
                      <span className="text-[9px] text-slate-400">Tier-1 Cos</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200/70 text-xs space-y-2">
                    <div className="flex justify-between items-center font-bold text-slate-700 text-[11px]">
                      <span>Live Drive: Microsoft Campus 2026</span>
                      <span className="text-emerald-600">84 Shortlisted</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>Cutoff: CGPA &ge; 7.5 &amp; Match &ge; 80%</span>
                      <span className="font-semibold text-slate-700">Deadline: 3d left</span>
                    </div>
                  </div>

                  <Link
                    to="/register"
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <span>Request TPO Officer Onboarding</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 5. 6-PILLAR FROSTED BENTO GRID SHOWCASE (#features)        */}
      {/* ========================================================= */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full frosted-pill border border-indigo-200 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            Core Engineering Architecture
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Six Pillars of CareerIntell
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Every feature is engineered to bridge the gap between academic transcripts and production engineering requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="frosted-card-hover p-7 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                Pillar 01 • Parsing
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                PyMuPDF Section Segmentation
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Extracts nested technical stacks, degree branches, certifications, and GitHub project metrics directly from PDF and DOCX documents with zero OCR hallucinations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-indigo-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Multi-column &amp; ATS Layout Parsing</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="frosted-card-hover p-7 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-5">
                <Sliders className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block mb-1">
                Pillar 02 • Benchmarking
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Weighted JD Gap Analyzer
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Differentiates hard required qualifications from nice-to-have technologies. Provides weighted similarity scoring against 50,000+ scraped industry job descriptions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-sky-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>TF-IDF &amp; Cosine Vector Matching</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="frosted-card-hover p-7 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
                <Map className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                Pillar 03 • Action Plan
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Dynamic 4-Phase Milestones
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Automatically breaks missing skills into four structured milestone sprints with weekly deliverables, documentation links, and suggested capstone projects.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero Generic Advice • Milestone Gated</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="frosted-card-hover p-7 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-5">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-1">
                Pillar 04 • Simulation
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                STAR Interview Simulator
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Test your communication under pressure. AI prompts real technical and behavioral questions from Google, Amazon, and Microsoft, rating your STAR framework.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-purple-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Situation, Task, Action &amp; Result Rubric</span>
            </div>
          </div>

          {/* Pillar 5 */}
          <div className="frosted-card-hover p-7 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-5">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                Pillar 05 • Verification
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Timed Skill Assessments
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Validate claimed proficiencies through timed MCQs and coding logic problems. Passing scores earn verified credentials visible to campus recruiters.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-amber-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Cheat-Resistant • Verified Profile Badges</span>
            </div>
          </div>

          {/* Pillar 6 */}
          <div className="frosted-card-hover p-7 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
                Pillar 06 • Placement Cell
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                TPO Campus Drive Connect
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Connect directly with your college placement cell. Apply to visiting on-campus hiring drives with your verified diagnostic readiness profile in one click.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-rose-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Secret TPO Passkey Protected</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. LIVE ATS SCANNER & MATCH SIMULATION (#ats-scanner)     */}
      {/* ========================================================= */}
      <section id="ats-scanner" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="frosted-panel rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-pearl-lg relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Context */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full frosted-pill border border-indigo-200 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                Enterprise ATS Simulation
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Beat the Automated Resume Filtering Gate
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Over 75% of college tech resumes are discarded by Applicant Tracking Systems before a human recruiter even views them. CareerIntell simulates enterprise parsing rules to guarantee formatting compatibility.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <span><strong>Section Header Recognition:</strong> Validates Experience, Skills, Education, Projects</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <span><strong>Keyword Density Check:</strong> Prevents keyword stuffing while ensuring critical JD match</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <span><strong>Action Verb Quantifier:</strong> Detects metrics (e.g. &quot;improved query speed by 34%&quot;)</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleCtaClick}
                  className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Scan My Resume Format</span>
                </button>
              </div>
            </div>

            {/* Right Interactive ATS Breakdown Card */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-white/90 p-6 sm:p-7 border border-slate-200/90 shadow-pearl-md space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">ATS Diagnostic Audit</span>
                    <span className="text-[11px] text-slate-500">Sample Candidate: resume_v3_final.pdf</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
                    94/100 EXCELLENT
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Header &amp; Section Hierarchy</span>
                      <span className="text-emerald-600 font-bold">100%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[100%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>JD Keyword Semantic Coverage</span>
                      <span className="text-indigo-600 font-bold">88%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full w-[88%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Action Verb &amp; Impact Metrics</span>
                      <span className="text-indigo-600 font-bold">92%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full w-[92%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Typography &amp; Table Machine-Readability</span>
                      <span className="text-emerald-600 font-bold">96%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[96%]" />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Verdict:</strong> Ready for automated applicant screening across Workday, Greenhouse, Taleo, and Lever ATS systems.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. 4-STEP PLACEMENT ROADMAP (#roadmap)                    */}
      {/* ========================================================= */}
      <section id="roadmap" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full frosted-pill border border-indigo-200 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            The Proven Path
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Four Steps from Resume to Placement Offer
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Follow our proven, step-by-step diagnostic roadmap to achieve top percentile readiness before interview season.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Upload & Parse',
              desc: 'PyMuPDF parses your PDF/DOCX resume in 3 seconds, extracting all skills, courses, and project technical details.',
              tag: 'PyMuPDF Engine'
            },
            {
              step: '02',
              title: 'Diagnose Skill Gaps',
              desc: 'Compare your parsed skills against 50,000+ benchmarked job descriptions for your chosen target engineering role.',
              tag: 'Weighted Similarity'
            },
            {
              step: '03',
              title: 'Master Milestones & STAR',
              desc: 'Execute 4 adaptive weekly milestone sprints, take timed assessments, and simulate behavioral STAR interviews.',
              tag: 'Adaptive Learning'
            },
            {
              step: '04',
              title: 'Campus Placement Offers',
              desc: 'Qualify for TPO campus drives, get shortlisted on recruiter spreadsheets, and ace company technical rounds.',
              tag: 'Offer Acquired'
            }
          ].map((item, idx) => (
            <div key={idx} className="frosted-card-hover p-6 rounded-2xl relative flex flex-col justify-between">
              <div>
                <span className="text-3xl font-extrabold text-indigo-600 font-display block mb-3">
                  {item.step}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 inline-block mb-3">
                  {item.tag}
                </span>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs text-indigo-600 font-bold">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Phase {idx + 1} Ready</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. VERIFIED PLACEMENT IMPACT & METRICS (#stats)           */}
      {/* ========================================================= */}
      <section id="stats" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        {/* Metric Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          <div className="frosted-panel p-6 sm:p-8 rounded-2xl text-center border border-slate-200/90 shadow-pearl-sm">
            <span className="font-display text-3xl sm:text-5xl font-extrabold text-indigo-600 block">
              +42%
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 mt-2 block">
              Readiness Score Jump
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">After 30 days of roadmaps</span>
          </div>

          <div className="frosted-panel p-6 sm:p-8 rounded-2xl text-center border border-slate-200/90 shadow-pearl-sm">
            <span className="font-display text-3xl sm:text-5xl font-extrabold text-indigo-600 block">
              3.2x
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 mt-2 block">
              Faster Shortlisting
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">By campus placement recruiters</span>
          </div>

          <div className="frosted-panel p-6 sm:p-8 rounded-2xl text-center border border-slate-200/90 shadow-pearl-sm">
            <span className="font-display text-3xl sm:text-5xl font-extrabold text-indigo-600 block">
              85+
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 mt-2 block">
              Tech Roles Benchmarked
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Across MAANG &amp; Tier-1 IT</span>
          </div>

          <div className="frosted-panel p-6 sm:p-8 rounded-2xl text-center border border-slate-200/90 shadow-pearl-sm">
            <span className="font-display text-3xl sm:text-5xl font-extrabold text-indigo-600 block">
              94%
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 mt-2 block">
              Placement Offer Rate
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Among active roadmap graduates</span>
          </div>
        </div>

        {/* Candidate Success Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="frosted-card p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                &quot;The gap analysis revealed I was missing Redis caching and PostgreSQL indexing for Full Stack roles. Completing Milestone 2 and practicing STAR interviews helped me land my Tier-1 offer.&quot;
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Rahul M.</span>
                <span className="text-[11px] text-slate-500">Software Engineer • Placed 14.5 LPA</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Verified Offer
              </span>
            </div>
          </div>

          <div className="frosted-card p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                &quot;As a college TPO, filtering 400+ students for specific recruiter criteria used to take our cell two weeks. With CareerIntell, we generate verified shortlists in 10 seconds.&quot;
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Dr. S. Kulkarni</span>
                <span className="text-[11px] text-slate-500">Training &amp; Placement Head</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                TPO Verified
              </span>
            </div>
          </div>

          <div className="frosted-card p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                &quot;The ATS checker flagged that my two-column resume format was dropping my project metrics. Fixing it boosted my interview callback rate from 12% to over 48%.&quot;
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Priya D.</span>
                <span className="text-[11px] text-slate-500">Data Analyst • Placed 11.2 LPA</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Verified Offer
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. INTERACTIVE FAQ ACCORDION (#faq)                       */}
      {/* ========================================================= */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full frosted-pill border border-indigo-200 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
            Got Questions?
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Everything you need to know about our scoring algorithms, TPO verification, and privacy standards.
          </p>
        </div>

        <div className="space-y-3.5">
          {[
            {
              q: 'How does CareerIntell evaluate my placement readiness score?',
              a: 'CareerIntell uses specialized NLP matching algorithms to compare your parsed resume skills, academic background, and project stack against real-world job description requirements for your target engineering role. Scores are weighted by must-have qualifications versus preferred competencies.'
            },
            {
              q: 'What resume file formats can I upload for analysis?',
              a: 'We support PDF, Microsoft Word (.docx), and plain text (.txt) files. Our PyMuPDF parsing engine safely extracts layout text without sending your raw document to third-party ad networks.'
            },
            {
              q: 'How does the TPO (Training & Placement Officer) authentication gate work?',
              a: 'To maintain academic integrity and student privacy, only official university placement personnel with an authorized campus passkey (e.g. TPO-AUTH-2026) can register as a Placement Officer to access cohort-level analytics and shortlist exports.'
            },
            {
              q: 'Are the skill assessment badges verified for college recruiters?',
              a: 'Yes! When you take a timed technical assessment on CareerIntell, your verified score is linked to your candidate profile and displayed on recruiter export packets provided to visiting companies.'
            },
            {
              q: 'Is CareerIntell completely free for students?',
              a: 'Yes. CareerIntell provides free placement diagnostic scores, ATS format evaluations, and personalized 4-phase learning roadmaps for engineering and technology candidates.'
            },
            {
              q: 'Can I target multiple roles simultaneously?',
              a: 'Absolutely. You can benchmark your profile against Data Scientist, AI Engineer, Full Stack, Cloud DevOps, and Data Analyst roles at any time from your interactive dashboard.'
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="frosted-panel rounded-2xl overflow-hidden border border-slate-200/90 transition-all duration-200"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between text-sm sm:text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                aria-expanded={activeFaq === idx}
              >
                <span>{item.q}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${
                    activeFaq === idx ? 'transform rotate-180 text-indigo-600' : ''
                  }`} 
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. FROSTED BOTTOM CONVERSION CTA & MODERN FOOTER         */}
      {/* ========================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="frosted-panel rounded-3xl p-8 sm:p-14 text-center border border-indigo-200/90 shadow-pearl-lg relative overflow-hidden bg-gradient-to-br from-white/90 via-slate-50/80 to-indigo-50/50">
          {/* Subtle Ambient Flairs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 inline-block mb-4">
              Get Ahead of the Competition
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Ready to Bridge Your Skill Gaps &amp; Land Your Dream Offer?
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
              Join thousands of engineering students already accelerating their careers with automated readiness diagnostics, adaptive milestone roadmaps, and verified campus drives.
            </p>

            {!isAuthenticated ? (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <Link
                  to="/register"
                  className="w-full py-4 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-center"
                >
                  <Sparkles className="w-5 h-5 text-indigo-200" />
                  <span>Register Free Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full py-4 px-6 rounded-xl frosted-pill hover:bg-white text-slate-700 font-semibold text-base border border-slate-300/80 text-center transition-all"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="mt-8">
                <Link
                  to={userRole === 'tpo' ? '/tpo' : '/dashboard'}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-600/25 transition-all"
                >
                  <span>Go to {userRole === 'tpo' ? 'TPO Portal' : 'Command Center'}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}

            <div className="mt-6 text-xs text-slate-500 flex items-center justify-center gap-4">
              <span>Instant setup in &lt; 60 seconds</span>
              <span>•</span>
              <span>No credit card required</span>
              <span>•</span>
              <span>Free for students</span>
            </div>
          </div>
        </div>
      </section>

      {/* MODERN MULTI-COLUMN FOOTER */}
      <footer className="border-t border-slate-200/90 bg-[#f1f5f9]/70 py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-slate-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand & Status */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 p-0.5 text-white flex items-center justify-center shadow-sm">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-lg text-slate-900">
                Career<span className="text-indigo-600">Intell</span>
              </span>
            </Link>
            <p className="text-slate-600 text-xs leading-relaxed max-w-sm">
              Next-generation placement intelligence and automated skill benchmarking for computer science, data science, and engineering candidates.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-pearl-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All AI Diagnostic Engines Operational</span>
            </div>
          </div>

          {/* Col 2: Candidate Tools */}
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
              Candidate Tools
            </span>
            <ul className="space-y-2 font-medium">
              <li>
                <Link to="/analyze" className="hover:text-indigo-600 transition-colors">
                  Resume Diagnostic
                </Link>
              </li>
              <li>
                <Link to="/intelligence" className="hover:text-indigo-600 transition-colors">
                  Skill Intelligence
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="hover:text-indigo-600 transition-colors">
                  Learning Roadmaps
                </Link>
              </li>
              <li>
                <Link to="/assessments" className="hover:text-indigo-600 transition-colors">
                  Assessment Center
                </Link>
              </li>
              <li>
                <Link to="/interview-prep" className="hover:text-indigo-600 transition-colors">
                  STAR Interview Prep
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Placement & TPO */}
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
              Placement &amp; TPO
            </span>
            <ul className="space-y-2 font-medium">
              <li>
                <Link to="/tpo" className="hover:text-indigo-600 transition-colors">
                  TPO Command Center
                </Link>
              </li>
              <li>
                <a href="#persona" className="hover:text-indigo-600 transition-colors">
                  Secret Auth Gate
                </a>
              </li>
              <li>
                <a href="#stats" className="hover:text-indigo-600 transition-colors">
                  Batch Analytics
                </a>
              </li>
              <li>
                <a href="#ats-scanner" className="hover:text-indigo-600 transition-colors">
                  Recruiter Shortlists
                </a>
              </li>
              <li>
                <Link to="/register" className="hover:text-indigo-600 transition-colors">
                  Officer Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Legal */}
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
              Platform &amp; Legal
            </span>
            <ul className="space-y-2 font-medium">
              <li>
                <a href="#faq" className="hover:text-indigo-600 transition-colors">
                  FAQ &amp; Help
                </a>
              </li>
              <li>
                <Link to="/profile" className="hover:text-indigo-600 transition-colors">
                  Account Settings
                </Link>
              </li>
              <li>
                <span className="text-slate-400 cursor-default">Student Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-400 cursor-default">Terms of Evaluation</span>
              </li>
              <li>
                <span className="text-slate-400 cursor-default">Institutional Licensing</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} CareerIntell Platform. Built for University Placement Intelligence.
          </div>
          <div className="text-[11px] text-slate-400 text-center sm:text-right max-w-xl">
            *Disclaimer: CareerIntell provides automated career decision support and readiness analytics based on job benchmarks. It does not guarantee direct placement or employment outcomes.
          </div>
        </div>
      </footer>
    </div>
  );
}
