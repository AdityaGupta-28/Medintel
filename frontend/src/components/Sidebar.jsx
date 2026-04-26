import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Activity, LayoutDashboard,
  Settings, LogOut, BrainCircuit, ChevronDown,
  Shield, Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const NAV_LINKS = [
  { name: 'Dashboard',    icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Patients',     icon: Users,           path: '/patients' },
  { name: 'Appointments', icon: Calendar,        path: '/appointments' },
  {
    name: 'AI Insights', icon: BrainCircuit, path: '/ai-insights',
    badge: 'AI',
  },
  { name: 'Settings',     icon: Settings,        path: '/settings' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();
  const userName  = storedUser.name  || 'Dr. Smith';
  const userRole  = storedUser.role  || 'Doctor';
  const userEmail = storedUser.email || '';
  const initials  = userName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-200/80 shadow-sm">
      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-blue-200 flex-shrink-0">
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 leading-none">MedIntel</span>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">Healthcare Platform</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Main Menu</p>
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  <link.icon size={18} />
                </span>
                <span className="flex-1">{link.name}</span>
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-blue-600 to-violet-600 text-white">
                    {link.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User Profile ── */}
      <div className="px-3 pb-4 border-t border-slate-100 pt-3" ref={menuRef}>
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(v => !v)}
            className="flex items-center w-full gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition-colors text-left"
          >
            {/* Avatar with online ring */}
            <div className="relative flex-shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{userName}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{userRole}</p>
            </div>
            <ChevronDown
              size={15}
              className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Popup menu */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50"
              >
                {/* User info */}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-violet-50 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-700 truncate">{userName}</p>
                  {userEmail && <p className="text-xs text-slate-400 truncate mt-0.5">{userEmail}</p>}
                </div>

                <div className="p-1">
                  <NavLink to="/settings" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                    <Settings size={14} className="text-slate-400" /> Account Settings
                  </NavLink>
                  <NavLink to="/settings" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                    <Shield size={14} className="text-slate-400" /> Change Password
                  </NavLink>
                  <NavLink to="/ai-insights" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                    <Sparkles size={14} className="text-violet-400" /> AI Insights
                  </NavLink>

                  <div className="my-1 border-t border-slate-100" />

                  <button onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
