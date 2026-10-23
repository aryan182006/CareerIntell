import { Bell, Menu, Search, UserCircle, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TopBar({ setSidebarOpen }: { setSidebarOpen: (val: boolean) => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-x-4 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-sm">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-600 hover:text-slate-900 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-slate-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 items-center justify-between gap-x-4">
        <form className="relative flex flex-1 max-w-md" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search skills, benchmark roles, roadmaps...
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-3 h-full w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-10 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all shadow-inner"
            placeholder="Search skills, benchmark roles, roadmaps..."
            type="search"
            name="search"
          />
        </form>

        <div className="flex items-center gap-x-3 sm:gap-x-4">

          <button 
            type="button" 
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-4 w-4" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="flex items-center gap-2">
            <Link 
              to="/profile" 
              className="flex items-center gap-x-3 p-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all group"
            >
              <div className="h-8 w-8 rounded-lg bg-blue-600 p-0.5 flex items-center justify-center shadow-sm">
                <div className="h-full w-full bg-white rounded-[6px] flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="hidden lg:flex lg:flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-tight">
                  {user?.name || 'Student User'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {user?.targetRole || 'Target Role'}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
