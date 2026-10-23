import { useState, useEffect } from 'react';
import { tpoApi, TpoAnalytics } from '../../api/tpo';
import { Users, TrendingUp, AlertTriangle, Search, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { Link } from 'react-router-dom';

export default function TpoDashboard() {
  const [analytics, setAnalytics] = useState<TpoAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  useEffect(() => {
    const fetchTpo = async () => {
      setLoading(true);
      try {
        const data = await tpoApi.getAnalytics();
        setAnalytics(data);
      } catch (e) {
        console.error('Failed to load TPO analytics:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTpo();
  }, []);

  const roster = analytics?.student_roster || [];
  const filteredStudents = roster.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'ALL' || s.target_role === filterRole;
    return matchesSearch && matchesRole;
  });

  const distData = [
    { name: 'Placement Ready (>=75%)', value: analytics?.distribution.ready || 0, color: '#10b981' },
    { name: 'Near Ready (60-74%)', value: analytics?.distribution.near_ready || 0, color: '#3b82f6' },
    { name: 'Needs Attention (<60%)', value: analytics?.distribution.needs_attention || 0, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Placement Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Training & Placement Officer (TPO) Intelligence Portal
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Aggregated institutional analytics, cohort readiness distributions, target role trends, and placement drive eligibility.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="self-start sm:self-auto px-4 py-2 rounded-xl pro-card text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200"
        >
          Student View
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 text-blue-600 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Aggregating cohort diagnostic data from SQLite database...</span>
        </div>
      )}

      {analytics && (
        <>
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="pro-panel p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Total Enrolled Students</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-3xl font-extrabold text-slate-900">{analytics.total_students}</span>
              <p className="text-[11px] text-slate-500">Active campus placement cohort</p>
            </div>

            <div className="pro-panel p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Cohort Average Readiness</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-3xl font-extrabold text-blue-600">{analytics.average_readiness}%</span>
              <p className="text-[11px] text-emerald-700 font-medium">Institutional Benchmark Level</p>
            </div>

            <div className="pro-panel p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Placement Ready Students</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-3xl font-extrabold text-emerald-600">{analytics.distribution.ready}</span>
              <p className="text-[11px] text-slate-500">
                {analytics.total_students > 0 ? Math.round((analytics.distribution.ready / analytics.total_students) * 100) : 0}% of cohort eligible for tier-1 drives
              </p>
            </div>

            <div className="pro-panel p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Intervention Needed</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-3xl font-extrabold text-rose-600">{analytics.distribution.needs_attention}</span>
              <p className="text-[11px] text-rose-700 font-medium">Flagged for remedial workshops</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Readiness Distribution Pie */}
            <div className="pro-panel p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Placement Readiness Cohort Distribution</h3>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {distData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                {distData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-600">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Preference Bar Chart */}
            <div className="pro-panel p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Student Target Role Distribution</h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.role_distribution} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <XAxis dataKey="role" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Department Breakdown & Top Common Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Department Breakdown */}
            <div className="pro-panel p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Department Readiness Benchmark</h3>
              <div className="space-y-3">
                {analytics.department_breakdown.map((dept) => (
                  <div key={dept.department} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{dept.department}</span>
                      <span className="text-slate-500">{dept.student_count} registered candidates</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-blue-600 text-sm">{dept.average_readiness}%</span>
                      <span className="text-slate-400 block text-[10px]">Avg Readiness</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aggregated Institutional Skill Gaps */}
            <div className="pro-panel p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Recommended Campus Training Workshops</h3>
              <p className="text-xs text-slate-500">Common skill deficiencies detected across student profiles:</p>
              <div className="space-y-3">
                {analytics.top_skill_gaps.map((g) => (
                  <div key={g.skill} className="p-3 rounded-xl bg-rose-50/40 border border-rose-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="font-bold text-slate-900">{g.skill}</span>
                    </div>
                    <span className="text-rose-700 font-bold bg-rose-100/80 px-2 py-0.5 rounded">
                      {g.affected_students_pct}% of students lack this
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="pro-panel p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Placement Roster</h3>
                <p className="text-xs text-slate-500">Live roster with diagnostic readiness scores and claimed skill profiles</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search candidate..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                >
                  <option value="ALL">All Roles</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Machine Learning Engineer">ML Engineer</option>
                  <option value="Full Stack Developer">Full Stack</option>
                  <option value="Cloud / DevOps Engineer">Cloud / DevOps</option>
                  <option value="Data Analyst">Data Analyst</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Target Role</th>
                    <th className="py-3 px-4">CGPA</th>
                    <th className="py-3 px-4">Skills Count</th>
                    <th className="py-3 px-4">Readiness Score</th>
                    <th className="py-3 px-4">Placement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{st.name}</span>
                        <span className="text-[11px] text-slate-400">{st.email}</span>
                      </td>
                      <td className="py-3 px-4">{st.department}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{st.target_role}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{st.cgpa}</td>
                      <td className="py-3 px-4">{st.skills_count} skills</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 text-sm">
                        {st.readiness_score}%
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.readiness_score >= 75
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : st.readiness_score >= 60
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {st.readiness_score >= 75 ? 'Ready for Drives' : st.readiness_score >= 60 ? 'Candidate Near Ready' : 'Needs Intervention'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400">
                        No candidate matches your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
