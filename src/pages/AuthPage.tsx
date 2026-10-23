import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, ArrowRight, User, Mail, Lock, AlertCircle, Loader2, Building2, KeyRound, ShieldCheck } from 'lucide-react';

export default function AuthPage({ initialMode = 'login' }: { initialMode?: 'login' | 'register' }) {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [role, setRole] = useState<'student' | 'tpo'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [institutionName, setInstitutionName] = useState('Apex Institute of Technology');
  const [tpoAuthCode, setTpoAuthCode] = useState('');
  const degree = 'B.Tech';
  const [graduationYear, setGraduationYear] = useState(2026);
  const [targetRole, setTargetRole] = useState('Data Scientist');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (isRegister) {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setErrorMessage('Please provide all required account credentials.');
          setIsSubmitting(false);
          return;
        }

        if (role === 'tpo' && !tpoAuthCode.trim()) {
          setErrorMessage('Institutional TPO Authentication Code is required for Placement Officer authorization.');
          setIsSubmitting(false);
          return;
        }

        const userRole = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          department: role === 'student' ? department : (institutionName || 'Corporate Relations & Placement Cell'),
          degree: role === 'student' ? degree : 'Administration',
          graduationYear: role === 'student' ? Number(graduationYear) : 2026,
          targetRole: role === 'student' ? targetRole : 'Placement Officer',
          tpoAuthCode: role === 'tpo' ? tpoAuthCode.trim() : undefined,
        });

        if (userRole === 'tpo') {
          navigate('/tpo', { replace: true });
        } else {
          navigate('/profile?onboarding=true', { replace: true });
        }
      } else {
        if (!email.trim() || !password.trim()) {
          setErrorMessage('Please enter your email and password.');
          setIsSubmitting(false);
          return;
        }

        const userRole = await login(email.trim(), password);

        if (from) {
          navigate(from, { replace: true });
        } else if (userRole === 'tpo') {
          navigate('/tpo', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'Authentication failed. Please verify credentials.';
      setErrorMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 sm:p-6 bg-grid-pattern-light relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-2xl bg-blue-600 p-0.5 shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <div className="h-full w-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <BrainCircuit className="h-6 w-6 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="text-left">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 block leading-tight">
                Career<span className="text-blue-600">Intell</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                AI Placement & Readiness Platform
              </span>
            </div>
          </Link>
          <p className="text-xs text-slate-600 pt-1">
            {isRegister ? 'Create an account to benchmark your readiness & close skill gaps' : 'Sign in to access your placement intelligence dashboard'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
          
          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Registration Role Picker */}
            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      role === 'student' 
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('tpo')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      role === 'tpo' 
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>TPO Officer</span>
                  </button>
                </div>
              </div>
            )}

            {/* Name */}
            {isRegister && (
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Student Registration Additional Profile Inputs */}
            {isRegister && role === 'student' && (
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="AI & Data Science">AI & Data Science</option>
                      <option value="Electronics">Electronics</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Grad Year
                    </label>
                    <select
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(Number(e.target.value))}
                      className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Target Career Ambition
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                    <option value="Cloud / DevOps Engineer">Cloud / DevOps Engineer</option>
                    <option value="Data Analyst">Data Analyst</option>
                  </select>
                </div>
              </div>
            )}

            {/* TPO Registration Specific Authentication Code & Institute Inputs */}
            {isRegister && role === 'tpo' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Institution / Placement Directorate
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Institute of Technology"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Institutional Authentication Code</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setTpoAuthCode('TPO-SECURE-2026')}
                      className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold underline"
                    >
                      Fill Demo Code
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. TPO-SECURE-2026"
                      value={tpoAuthCode}
                      onChange={(e) => setTpoAuthCode(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2.5 bg-emerald-50/40 border-2 border-emerald-500/40 rounded-xl text-xs font-mono font-bold tracking-widest text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:font-normal"
                    />
                  </div>
                  <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Placement Officer authorization requires an institutional secret key issued by university administration. Demo code: <strong className="text-emerald-700 font-mono">TPO-SECURE-2026</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isRegister ? (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-500">
          <Link to="/" className="text-blue-600 hover:underline font-semibold">
            ← Return to CareerIntell Home
          </Link>
        </div>

      </div>
    </div>
  );
}
