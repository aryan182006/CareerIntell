import { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Building2, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Layers, 
  Lightbulb, 
  Loader2, 
  MessageSquare, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Target, 
  AlertCircle,
  BookOpen,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  interviewsApi, 
  InterviewHubResponse, 
  FilterOptions 
} from '../api/interviews';

export default function InterviewPrepPage() {
  const { user, refreshProfile } = useAuth();

  const [hubData, setHubData] = useState<InterviewHubResponse | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters state
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<string>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gapOnly, setGapOnly] = useState<boolean>(false);

  // Expanded cards state (which questions have answer breakdown open)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  
  // Custom notes local state per question
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);

  // Load filter options on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const filters = await interviewsApi.getFilters();
        setFilterOptions(filters);
      } catch (err) {
        console.error('Failed to fetch interview filters:', err);
      }
    };
    fetchFilters();
  }, []);

  // Sync default selected role with student profile target role
  useEffect(() => {
    if (user?.targetRole && !selectedRole) {
      setSelectedRole(user.targetRole);
    }
  }, [user, selectedRole]);

  // Fetch questions whenever primary role, round, company, difficulty, or gap filter changes
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const data = await interviewsApi.getQuestions({
          role: selectedRole || undefined,
          round_type: selectedRound !== 'ALL' ? selectedRound : undefined,
          company: selectedCompany !== 'ALL' ? selectedCompany : undefined,
          difficulty: selectedDifficulty !== 'ALL' ? selectedDifficulty : undefined,
          gap_only: gapOnly
        });
        setHubData(data);

        // Pre-fill notes state
        const initialNotes: Record<string, string> = {};
        data.questions.forEach((q) => {
          if (q.user_notes) {
            initialNotes[q.id] = q.user_notes;
          }
        });
        setNotesState(initialNotes);
      } catch (err) {
        console.error('Failed to load interview questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedRole, selectedRound, selectedCompany, selectedDifficulty, gapOnly]);

  // Client-side text search filtering
  const filteredQuestions = useMemo(() => {
    if (!hubData?.questions) return [];
    if (!searchQuery.trim()) return hubData.questions;

    const query = searchQuery.toLowerCase();
    return hubData.questions.filter((q) => 
      q.question_text.toLowerCase().includes(query) ||
      q.skill_name.toLowerCase().includes(query) ||
      q.company_tags.some((c) => c.toLowerCase().includes(query)) ||
      q.key_concepts.some((k) => k.toLowerCase().includes(query))
    );
  }, [hubData, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateStatus = async (questionId: string, status: 'NOT_STARTED' | 'PRACTICING' | 'MASTERED') => {
    setUpdatingId(questionId);
    try {
      await interviewsApi.updateProgress(questionId, {
        status,
        user_notes: notesState[questionId] || ''
      });

      // Update in state locally
      setHubData((prev) => {
        if (!prev) return prev;
        const updated = prev.questions.map((q) => 
          q.id === questionId ? { ...q, status } : q
        );
        const mastered = updated.filter((q) => q.status === 'MASTERED').length;
        const practicing = updated.filter((q) => q.status === 'PRACTICING').length;
        return {
          ...prev,
          mastered_count: mastered,
          practicing_count: practicing,
          readiness_percentage: prev.total_questions > 0 ? Math.round((mastered / prev.total_questions) * 100) : 0,
          questions: updated
        };
      });

      await refreshProfile();
    } catch (err) {
      console.error('Failed to update question progress:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (questionId: string) => {
    setSavingNotesId(questionId);
    try {
      const currentQ = hubData?.questions.find((q) => q.id === questionId);
      await interviewsApi.updateProgress(questionId, {
        status: currentQ?.status || 'PRACTICING',
        user_notes: notesState[questionId] || ''
      });
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotesId(null);
    }
  };

  const roundTabs = [
    { id: 'ALL', name: 'All Rounds', icon: Layers },
    { id: 'Technical Core', name: 'Core Technical', icon: Briefcase },
    { id: 'System Design & Scenarios', name: 'System Design & Scenarios', icon: Building2 },
    { id: 'Project Defense', name: 'Resume & Project Defense', icon: ShieldCheck },
    { id: 'Behavioral (STAR)', name: 'Behavioral (STAR)', icon: MessageSquare }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header & Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-2xl border border-indigo-900/40">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              Company Technical & Behavioral Interview Hub
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Role-Targeted Interview Masterclass
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Curated technical rounds, real-world architecture scenarios, and project defense questions asked at top companies—dynamically prioritized to bridge your detected skill gaps.
            </p>
          </div>

          {/* Target Role Switcher & Readiness Badge */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60 shadow-xl flex flex-col gap-4 min-w-[280px]">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Target Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {filterOptions?.roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Preparation Mastery Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Interview Mastery</span>
                <span className="text-emerald-400 font-bold">{hubData?.readiness_percentage ?? 0}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${hubData?.readiness_percentage ?? 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                <span>{hubData?.mastered_count ?? 0} Mastered</span>
                <span>{hubData?.practicing_count ?? 0} Practicing</span>
                <span>{hubData?.total_questions ?? 0} Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Skill Gap Highlight Banner */}
      {hubData && hubData.skill_gap_questions_count > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{hubData.skill_gap_questions_count} Questions Target Your Profile Skill Gaps</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  High Priority
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Our intelligence engine cross-referenced your resume analysis with target role requirements. Master these to elevate your placement readiness score!
              </p>
            </div>
          </div>

          <button
            onClick={() => setGapOnly(!gapOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              gapOnly
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 hover:bg-amber-700'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {gapOnly ? 'Show All Questions' : 'Focus Only on My Gaps'}
          </button>
        </div>
      )}

      {/* 3. Filter Navigation & Search Bar */}
      <div className="space-y-4">
        {/* Round Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {roundTabs.map((tab) => {
            const Icon = tab.icon;
            const active = selectedRound === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedRound(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filters Bar */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by question, skill, company (e.g. React, Docker, Amazon, SQL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Company Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full md:w-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Companies</option>
              {filterOptions?.companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>

            {/* Difficulty Filter Dropdown */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full md:w-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Question Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Synthesizing company interview intelligence...
          </p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-700 mx-auto flex items-center justify-center text-blue-500">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Interview Questions Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try resetting your filters or search keywords to view questions for other rounds and companies.
          </p>
          <button
            onClick={() => {
              setSelectedRound('ALL');
              setSelectedCompany('ALL');
              setSelectedDifficulty('ALL');
              setSearchQuery('');
              setGapOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuestions.map((q) => {
            const isExpanded = !!expandedIds[q.id];
            const isUpdating = updatingId === q.id;

            return (
              <div 
                key={q.id}
                className={`bg-white dark:bg-slate-800/90 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${
                  q.is_skill_gap 
                    ? 'border-amber-400/50 dark:border-amber-500/40 bg-gradient-to-b from-amber-500/[0.02] to-transparent' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Question Card Header */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Skill Tag */}
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                        {q.skill_name}
                      </span>

                      {/* Skill Gap Priority Badge */}
                      {q.is_skill_gap && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Bridges Profile Gap ({q.gap_type || 'Required'})</span>
                        </span>
                      )}

                      {/* Round Type Badge */}
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
                        {q.round_type}
                      </span>

                      {/* Difficulty */}
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        q.difficulty === 'Advanced'
                          ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                          : q.difficulty === 'Intermediate'
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    {/* Status Mastery Badge */}
                    <div className="flex items-center gap-2">
                      {q.status === 'MASTERED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mastered
                        </span>
                      ) : q.status === 'PRACTICING' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          In Practice
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                          Not Started
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {q.question_text}
                  </h2>

                  {/* Company Tags Pill Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-slate-400 font-medium">Frequently Asked At:</span>
                    {q.company_tags.map((company) => (
                      <span
                        key={company}
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      >
                        {company}
                      </span>
                    ))}
                    <span className="text-[11px] text-slate-400 italic ml-1">
                      ({q.company_tier})
                    </span>
                  </div>

                  {/* Bottom Action Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => toggleExpand(q.id)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Answer & Rubric' : 'Reveal Model Answer & Analysis'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Quick Mastery Status Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(q.id, q.status === 'MASTERED' ? 'PRACTICING' : 'MASTERED')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          q.status === 'MASTERED'
                            ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{q.status === 'MASTERED' ? 'Marked Mastered' : 'Mark Mastered'}</span>
                      </button>

                      <button
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(q.id, q.status === 'PRACTICING' ? 'NOT_STARTED' : 'PRACTICING')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          q.status === 'PRACTICING'
                            ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{q.status === 'PRACTICING' ? 'In Practice' : 'Practice Later'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. Expanded Accordion: Rubric, Keywords, Answer, Tips, Notes */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 space-y-6 rounded-b-2xl">
                    {/* What Interviewers Evaluate */}
                    {q.interviewer_criteria && (
                      <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          What the Interviewer is Evaluating
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {q.interviewer_criteria}
                        </p>
                      </div>
                    )}

                    {/* Keywords Checklist */}
                    {q.key_concepts && q.key_concepts.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Mandatory Keywords & Concepts to Mention
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {q.key_concepts.map((concept, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1"
                            >
                              <Check className="w-3 h-3 text-emerald-500" />
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Production Model Answer */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Structured Model Answer
                      </h4>
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-2 whitespace-pre-line font-normal">
                        {q.model_answer}
                      </div>
                    </div>

                    {/* Pro Tips / Pitfalls */}
                    {q.tips && (
                      <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          Pro-Tip & Common Pitfall to Avoid
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {q.tips}
                        </p>
                      </div>
                    )}

                    {/* Rehearsal Notes */}
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Your Rehearsal Notes / Bullet Points
                        </label>
                        <button
                          onClick={() => handleSaveNotes(q.id)}
                          disabled={savingNotesId === q.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                        >
                          {savingNotesId === q.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>Save Notes</span>
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Write down how you would formulate this answer in your own voice, or note project examples to cite..."
                        value={notesState[q.id] || ''}
                        onChange={(e) => setNotesState({ ...notesState, [q.id]: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
