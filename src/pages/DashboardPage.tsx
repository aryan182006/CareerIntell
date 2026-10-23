import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  intelligenceApi,
  ReadinessResponse,
  RoleMatchItem,
  SkillGapAnalysisResponse,
  RecommendationItem
} from '../api/intelligence';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  ArrowRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BrainCircuit,
  FileText,
  Map,
  Zap,
  Award,
  Layers,
  BarChart3,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [roleMatches, setRoleMatches] = useState<RoleMatchItem[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<SkillGapAnalysisResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [readData, rolesData, gapsData, recsData] = await Promise.all([
          intelligenceApi.getReadiness().catch(() => null),
          intelligenceApi.getRoleMatches().catch(() => []),
          intelligenceApi.analyzeMatch().catch(() => null),
          intelligenceApi.getRecommendations().catch(() => [])
        ]);

        if (readData) setReadiness(readData);
        if (rolesData) setRoleMatches(rolesData);
        if (gapsData) setGapAnalysis(gapsData);
        if (recsData) setRecommendations(recsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.targetRole]);

  const currentScore = readiness?.overall_score ?? (user?.readinessScore ?? 0);

  // Calculate real progression from readiness history
  let trendText = 'Baseline Evaluation';
  let isPositiveTrend = true;
  if (readiness?.history && readiness.history.length >= 2) {
    const sorted = [...readiness.history].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );
    const last = sorted[sorted.length - 1].score;
    const prev = sorted[sorted.length - 2].score;
    const diff = Math.round((last - prev) * 10) / 10;
    isPositiveTrend = diff >= 0;
    trendText = `${diff >= 0 ? '+' : ''}${diff}% Progression`;
  }

  const readinessData = [
    { name: 'Ready', value: currentScore },
    { name: 'Gap', value: Math.max(0, 100 - currentScore) },
  ];
  const COLORS = ['#2563eb', '#e2e8f0'];

  // Identify best role match from real API
  const sortedRoles = roleMatches.length > 0 ? roleMatches : [];
  const bestMatch = sortedRoles[0] || {
    id: 'default',
    title: user?.targetRole || 'Data Scientist',
    match_percentage: currentScore,
    category: 'Tech',
    salary_range: '₹12L - ₹25L avg benchmark'
  };

  // High priority missing skills
  const missingSkills = gapAnalysis?.gaps?.filter(
    (g) => g.status === 'MISSING' || g.status === 'PARTIAL'
  ) || [];
  const priorityGaps = missingSkills.filter((g) => g.importance === 'Required');

  const topActionItem = recommendations[0] || {
    title: 'Bridge Priority Required Competencies',
    description: 'Focus on closing missing skill requirements identified in your target role benchmark.',
    priority: 'High'
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden border border-slate-800">
        <img
          src="/images/dashboard-bg.jpg"
          alt="Dashboard Background"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/90" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Placement Readiness Diagnostics</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Student'}
            </h1>
            <p className="mt-2 text-slate-300 text-sm max-w-2xl">
              Target Role: <strong className="text-white">{user?.targetRole || 'Not Selected'}</strong>{user?.department || user?.branch ? ` • ${user?.department || user?.branch}` : ''}{user?.cgpa ? ` (CGPA: ${user.cgpa})` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/analyze"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-blue-200" />
              <span>Analyze Resume / JD</span>
            </Link>

            <Link
              to="/roadmap"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border border-white/20"
            >
              <Map className="w-4 h-4 text-purple-300" />
              <span>Personalized Roadmap</span>
            </Link>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 text-blue-600 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Computing placement intelligence benchmarks...</span>
        </div>
      )}

      {/* TOP 4 METRIC CARDS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Overall Readiness Gauge Card */}
        <div className="pro-card p-6 flex flex-col items-center justify-between text-center relative overflow-hidden group bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-full flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Overall Readiness</span>
            <span className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-bold ${isPositiveTrend
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-amber-700 bg-amber-50 border-amber-200'
              }`}>
              {isPositiveTrend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trendText}
            </span>
          </div>

          <div className="h-28 w-28 relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={readinessData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={48}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {readinessData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-slate-900">{currentScore}%</span>
              <span className="text-[10px] text-blue-600 font-semibold">Readiness</span>
            </div>
          </div>

          <div className="mt-2 w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status:</span>
            <span className="text-emerald-700 font-bold">
              {currentScore >= 75 ? 'Placement Ready' : currentScore >= 60 ? 'Competitive Candidate' : 'Skills In Development'}
            </span>
          </div>
        </div>

        {/* Best Role Match */}
        <div className="pro-card p-6 flex flex-col justify-between relative group bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-4">
              <span>Top Market Compatibility</span>
              <Target className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{bestMatch.title}</h3>
                <span className="text-xs text-slate-500">{bestMatch.salary_range || 'Industry Benchmark'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Role Compatibility:</span>
            <span className="text-emerald-700 font-extrabold text-sm">{bestMatch.match_percentage}% Match</span>
          </div>
        </div>

        {/* Priority Skill Gaps */}
        <div className="pro-card p-6 flex flex-col justify-between relative group bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-4">
              <span>Detected Skill Gaps</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">{priorityGaps.length} Priority Gaps</h3>
                <span className="text-xs text-amber-700 font-medium">For {user?.targetRole || 'Target Role'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Analysis:</span>
            <Link to="/intelligence" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
              View Gap Matrix <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Portfolio & Credentials */}
        <div className="pro-card p-6 flex flex-col justify-between relative group bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-4">
              <span>Verified Portfolio</span>
              <Briefcase className="w-4 h-4 text-purple-600" />
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {user?.projects?.length ?? 0} Active Projects
                </h3>
                <span className="text-xs text-slate-500">
                  {user?.certifications?.length ?? 0} Industry Certifications
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Profile Status:</span>
            <Link to="/profile" className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1">
              Edit Credentials <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* NATURAL LANGUAGE READINESS SUMMARY */}
      {readiness?.explanation_summary && (
        <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">AI Diagnostic Evaluation</h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{readiness.explanation_summary}</p>
          </div>
        </div>
      )}

      {/* MIDDLE SECTION: ROLE COMPATIBILITY & RECOMMENDED ACTION */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Role Compatibility Breakdown (2 columns) */}
        <div className="pro-panel p-6 sm:p-8 lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" /> Industry Role Compatibility Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-1">Live matching scores calculated against validated role profiles in taxonomy.</p>
            </div>
            <Link to="/intelligence" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
              Deep Intelligence <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {sortedRoles.map((role) => (
              <div key={role.id} className="pro-card p-4 space-y-2 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{role.title}</span>
                    {role.title.toLowerCase() === (user?.targetRole || 'data scientist').toLowerCase() && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Target Role
                      </span>
                    )}
                  </div>
                  <span className="font-extrabold text-sm text-blue-600">{role.match_percentage}% Match</span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${role.match_percentage >= 80
                        ? 'bg-gradient-to-r from-blue-600 to-emerald-500'
                        : role.match_percentage >= 60
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-500'
                          : 'bg-gradient-to-r from-amber-500 to-rose-500'
                      }`}
                    style={{ width: `${role.match_percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Match Status: <strong className="text-slate-700">{role.match_percentage >= 75 ? 'Placement Ready' : 'Skills To Bridge'}</strong></span>
                  <span className="text-slate-400 font-mono">
                    {role.matched_skills?.length || 0} Matched • {role.missing_skills?.length || 0} Missing
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Recommended Next Action & High Priority Gaps (1 column) */}
        <div className="space-y-6">
          {/* Recommended Next Action */}
          <div className="pro-panel p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Primary Recommended Action
            </h2>

            <div className="p-5 rounded-xl bg-blue-50/80 border border-blue-200/80 space-y-3">
              <span className="text-xs px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold inline-block">
                {topActionItem.priority} Impact Item
              </span>
              <h4 className="text-sm font-bold text-slate-900">{topActionItem.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {topActionItem.description}
              </p>
              <Link
                to="/roadmap"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 mt-2 group"
              >
                <span>Open Personalized Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Top Skill Gaps List */}
          <div className="pro-panel p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" /> High-Priority Missing Skills
              </h2>
              <Link to="/intelligence" className="text-xs text-slate-500 hover:text-slate-900">All ({missingSkills.length})</Link>
            </div>

            <ul className="space-y-2.5">
              {missingSkills.slice(0, 4).map((gap) => (
                <li key={gap.skill_name} className="pro-card p-3 flex items-center justify-between border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${gap.status === 'MISSING' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                    <div>
                      <span className="font-semibold text-xs text-slate-900 block">{gap.skill_name}</span>
                      <span className="text-[10px] text-slate-500">{gap.importance} • Target {gap.required_level}%</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${gap.status === 'MISSING' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                    {gap.status}
                  </span>
                </li>
              ))}
              {missingSkills.length === 0 && (
                <li className="text-xs text-emerald-600 p-2 text-center font-medium">All core requirements matched!</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* QUICK LAUNCH HUB: WORKFLOW SHORTCUTS */}
      <div className="pro-panel p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" /> Career Intelligence Workflow Launchpad
            </h2>
            <p className="text-xs text-slate-500 mt-1">Jump directly into core placement readiness modules.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link
            to="/analyze"
            className="pro-card p-6 hover:border-blue-500 group transition-all border border-slate-200 rounded-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
              Resume & JD Parser
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload PDF resumes to extract text with PyMuPDF and match against live job descriptions.
            </p>
          </Link>

          <Link
            to="/intelligence"
            className="pro-card p-6 hover:border-indigo-500 group transition-all border border-slate-200 rounded-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
              Intelligence Engine
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inspect dynamic skill gap matrix, radar charts, and role alignment metrics.
            </p>
          </Link>

          <Link
            to="/roadmap"
            className="pro-card p-6 hover:border-purple-500 group transition-all border border-slate-200 rounded-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Map className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-1">
              Personalized Roadmap
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Interactive 4-phase learning milestones with toggleable progress and curated courses.
            </p>
          </Link>

          <Link
            to="/assessments"
            className="pro-card p-6 hover:border-emerald-500 group transition-all border border-slate-200 rounded-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-1">
              Skill Assessments
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Take timed MCQ tests in Python, ML, and SQL to earn verified credentials.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
