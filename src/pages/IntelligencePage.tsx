import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { intelligenceApi, SkillGapAnalysisResponse, RoleMatchItem } from '../api/intelligence';
import { BrainCircuit, AlertCircle, Sparkles, ArrowRight, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function IntelligencePage() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user?.targetRole || 'Data Scientist');
  const [gapAnalysis, setGapAnalysis] = useState<SkillGapAnalysisResponse | null>(null);
  const [roleMatches, setRoleMatches] = useState<RoleMatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.targetRole) {
      setSelectedRole(user.targetRole);
    }
  }, [user?.targetRole]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gaps, roles] = await Promise.all([
          intelligenceApi.analyzeMatch({ role_title: selectedRole }),
          intelligenceApi.getRoleMatches()
        ]);
        setGapAnalysis(gaps);
        setRoleMatches(roles);
      } catch (e) {
        console.error('Failed to load intelligence data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedRole]);

  const currentRoleMatch = roleMatches.find((r) => r.title.toLowerCase() === selectedRole.toLowerCase()) || {
    id: 'active',
    title: selectedRole,
    category: 'Tech',
    description: '',
    match_percentage: gapAnalysis?.match_score || 75,
    matched_skills: [],
    missing_skills: [],
    salary_range: '₹12L - ₹25L avg benchmark'
  };

  const missingOrPartialGaps = gapAnalysis?.gaps?.filter(g => g.status !== 'MATCHED') || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Placement Intelligence Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Career Intelligence Engine
          </h1>
          <p className="text-sm text-slate-600 mt-1">Deep diagnostics of your readiness score, skill gap matrix, and industry role benchmarks.</p>
        </div>

        <Link
          to="/roadmap"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm"
        >
          <Zap className="w-4 h-4 text-blue-200" />
          <span>Launch Roadmap</span>
        </Link>
      </div>

      {/* Role Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        {roleMatches.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.title)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole.toLowerCase() === role.title.toLowerCase()
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            {role.title} ({role.match_percentage}%)
          </button>
        ))}
      </div>

      {/* Target Role Overview Card WITH BACKGROUND IMAGE */}
      <div className="pro-panel p-6 sm:p-8 relative overflow-hidden bg-slate-900 text-white border border-slate-800 rounded-2xl shadow-md">
        <img 
          src="/images/dashboard-bg.jpg" 
          alt="Intelligence Background" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-20 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/90" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Target Placement Goal</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                Active Benchmark
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">{selectedRole}</h2>
            <p className="text-xs text-slate-300">
              Salary Benchmark: <strong className="text-white">{currentRoleMatch.salary_range || 'Competitive Industry Package'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-800/80 p-4 rounded-xl border border-slate-700 backdrop-blur-md">
            <div className="text-center px-2">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Compatibility Score</span>
              <span className="text-3xl font-extrabold text-blue-400">
                {gapAnalysis?.match_score ?? currentRoleMatch.match_percentage}%
              </span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center px-2">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Identified Gaps</span>
              <span className="text-3xl font-extrabold text-amber-400">
                {missingOrPartialGaps.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 text-blue-600 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Computing live gap matrix against {selectedRole}...</span>
        </div>
      )}

      {/* Detailed Skill Gap Matrix */}
      <div className="pro-panel p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" /> Live Skill Gap Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Required and preferred competencies evaluated against your verified skill levels.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {gapAnalysis?.matched_count || 0} Matched / {gapAnalysis?.total_required || 0} Total
          </span>
        </div>

        <div className="space-y-4">
          {gapAnalysis?.gaps?.map((gap) => (
            <div key={gap.skill_name} className="pro-card p-5 space-y-3 border border-slate-200 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    gap.status === 'MATCHED' ? 'bg-emerald-500' : gap.status === 'PARTIAL' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  <h3 className="text-base font-bold text-slate-900">{gap.skill_name}</h3>
                  <span className="text-xs text-slate-500">
                    (Current: {gap.current_level}% / Target: {gap.required_level}%)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${
                    gap.status === 'MATCHED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : gap.status === 'PARTIAL'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {gap.status} ({gap.importance})
                  </span>
                </div>
              </div>

              {/* Progress bar comparing current level vs required level */}
              <div className="space-y-1">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      gap.status === 'MATCHED' ? 'bg-emerald-500' : gap.status === 'PARTIAL' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, (gap.current_level / Math.max(1, gap.required_level)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-blue-600" />
                  Proficiency Deficit: <strong className={gap.required_level > gap.current_level ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {Math.max(0, gap.required_level - gap.current_level)}%
                  </strong>
                </span>

                {gap.status !== 'MATCHED' ? (
                  <Link to="/roadmap" className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1">
                    View Learning Roadmap <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Requirement Met
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
