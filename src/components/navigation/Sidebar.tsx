import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  BrainCircuit, 
  Map, 
  Sparkles,
  ChevronRight,
  LogOut,
  Award,
  Users,
  Building2,
  Briefcase
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  // Strict role-based navigation items
  const studentNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Resume & Job Analysis', path: '/analyze', icon: FileText },
    { name: 'Career Intelligence', path: '/intelligence', icon: BrainCircuit },
    { name: 'My Roadmap', path: '/roadmap', icon: Map },
    { name: 'Skill Assessments', path: '/assessments', icon: Award },
    { name: 'Interview Prep', path: '/interview-prep', icon: Briefcase },
  ];

  const tpoNavItems = [
    { name: 'TPO Placement Portal', path: '/tpo', icon: Users },
    { name: 'Officer Profile', path: '/profile', icon: User },
  ];

  const currentNavItems = userRole === 'tpo' ? tpoNavItems : studentNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar component */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between shadow-xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div>
          {/* Logo Header */}
          <div className="flex h-20 shrink-0 items-center px-6 border-b border-slate-800 bg-slate-950/40">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-blue-600 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <BrainCircuit className="h-5 w-5 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1">
                  Career<span className="text-blue-400">Intell</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                  {userRole === 'tpo' ? 'TPO Administration' : 'AI Placement System'}
                </span>
              </div>
            </NavLink>
          </div>

          {/* Quick Action Button */}
          <div className="p-4">
            {userRole === 'tpo' ? (
              <NavLink
                to="/tpo"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Building2 className="w-4 h-4 text-emerald-200" />
                <span>Placement Overview</span>
              </NavLink>
            ) : (
              <NavLink
                to="/analyze"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Run AI Diagnostics</span>
              </NavLink>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                    isActive 
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-blue-400 font-bold text-xs">
                {user?.name?.slice(0, 2).toUpperCase() || 'ST'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Student Account'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'student@college.edu'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/60 border border-slate-700 text-slate-400 font-medium text-xs flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
