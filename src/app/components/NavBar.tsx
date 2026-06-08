import { useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, Receipt, BarChart2, Sun, Moon } from 'lucide-react';
import { useTheme, useTC } from '../contexts/ThemeContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/track-invoice', label: 'Track Invoice', icon: Receipt },
  { path: '/accounts-receivable', label: 'Financial Dashboard', icon: BarChart2 },
];

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const tc = useTC();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className={`${tc.headerBg} border-b sticky top-0 z-40 px-4 md:px-8`}>
      <div className="flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="text-[#BAAB48]"
            style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '0.05em' }}
          ><span className="font-bold">TrackPoint</span></button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(path)
                    ? 'bg-[#BAAB48]/20 text-[#BAAB48]'
                    : tc.navItemInactive
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${tc.secondaryBtn}`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-[#BAAB48]" /> : <Moon className="w-4 h-4" />}
          <span className="hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Mobile nav links */}
      <div className="flex md:hidden items-center gap-1 pb-2 overflow-x-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
              isActive(path)
                ? 'bg-[#BAAB48]/20 text-[#BAAB48]'
                : tc.navItemInactive
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
