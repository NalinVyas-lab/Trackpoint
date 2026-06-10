import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, Receipt, BarChart2, Sun, Moon, Bell, Package, DollarSign, AlertTriangle, CheckCircle, Clock, X, Truck } from 'lucide-react';
import { useTheme, useTC } from '../contexts/ThemeContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tracking', label: 'Track Shipment', icon: Package },
  { path: '/track-invoice', label: 'Track Invoice', icon: Receipt },
  { path: '/accounts-receivable', label: 'Financial Dashboard', icon: BarChart2 },
];

interface Notification {
  id: string;
  type: 'shipment' | 'invoice' | 'alert' | 'success' | 'pending';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: '1', type: 'alert', read: false,
    title: 'Shipment Delayed',
    body: 'MLCA-2026-001843 (Royal Bank of Canada) is delayed. New ETA: Jun 12.',
    time: '5 min ago',
  },
  {
    id: '2', type: 'invoice', read: false,
    title: 'Invoice Overdue',
    body: 'INV-2026-0089 from Cartier International is 3 days past due.',
    time: '1 hr ago',
  },
  {
    id: '3', type: 'shipment', read: false,
    title: 'Shipment In Transit',
    body: 'MLCA-2026-001847 (Tiffany & Co.) departed London Heathrow.',
    time: '2 hr ago',
  },
  {
    id: '4', type: 'pending', read: false,
    title: 'Pending Authorization',
    body: 'MLCA-2026-001846 requires customs clearance in Hong Kong.',
    time: '3 hr ago',
  },
  {
    id: '5', type: 'success', read: true,
    title: 'Payment Received',
    body: 'UBS AG has settled INV-2026-0084 — $3,200,000.',
    time: 'Yesterday',
  },
  {
    id: '6', type: 'success', read: true,
    title: 'Shipment Delivered',
    body: 'MLCA-2026-001844 (Van Cleef & Arpels) delivered in Tokyo.',
    time: 'Yesterday',
  },
  {
    id: '7', type: 'invoice', read: true,
    title: 'Invoice Package Sent',
    body: 'Consolidated package sent to finance@tiffany.com.',
    time: '2 days ago',
  },
];

const TYPE_ICON: Record<Notification['type'], React.ElementType> = {
  shipment: Package,
  invoice: DollarSign,
  alert: AlertTriangle,
  success: CheckCircle,
  pending: Clock,
};

const TYPE_COLOR: Record<Notification['type'], string> = {
  shipment: '#3b82f6',
  invoice: '#d4a017',
  alert: '#ef4444',
  success: '#22c55e',
  pending: '#f97316',
};

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const tc = useTC();

  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayed = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifications(ns => ns.filter(n => n.id !== id));

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className={`${tc.headerBg} border-b sticky top-0 z-40 px-4 md:px-8`}>
      <div className="flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            style={{ color: tc.accent }}
            style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '0.05em' }}
          >
            <span className="font-bold">TrackPoint</span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(path) ? '' : tc.navItemInactive}`}
                style={isActive(path) ? { background: tc.accentMuted, color: tc.accent } : {}}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Bell + Theme toggle */}
        <div className="flex items-center gap-2" ref={panelRef}>
          {/* Bell button */}
          <div className="relative">
            <button
              onClick={() => setOpen(o => !o)}
              className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-all ${tc.secondaryBtn}`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[9px]"
                  style={{
                    minWidth: '16px', height: '16px', padding: '0 3px',
                    background: '#ef4444', color: '#fff', fontWeight: 700,
                    boxShadow: '0 0 0 2px ' + (isDark ? '#242424' : '#ffffff'),
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification panel */}
            {open && (
              <div
                className="absolute right-0 mt-2 rounded-xl shadow-2xl overflow-hidden"
                style={{
                  width: '340px',
                  background: isDark ? '#091e1a' : '#ffffff',
                  border: `1.5px solid ${isDark ? '#163d36' : '#a5d8ae'}`,
                  borderTop: `2px solid ${tc.accent}`,
                  zIndex: 100,
                }}
              >
                {/* Panel header */}
                <div
                  className="px-4 py-3 flex items-center gap-2"
                  style={{ borderBottom: `1px solid ${isDark ? '#0f2e28' : '#c8ecd0'}`, background: tc.accentFaint }}
                >
                  <Bell className="w-3.5 h-3.5" style={{ color: tc.accent }} />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px]"
                      style={{ background: tc.accentMuted, color: tc.accent, fontWeight: 600 }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{ fontSize: '10px', color: tc.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: '2px 6px' }}
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '5px', background: isDark ? '#1a2535' : '#f0f4f8', border: `1px solid ${isDark ? '#283548' : '#d0dae6'}`, color: isDark ? '#6a8090' : '#4a6070', cursor: 'pointer' }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>

                {/* Filter tabs */}
                <div
                  className="flex gap-1 px-3 py-2"
                  style={{ borderBottom: `1px solid ${isDark ? '#0f2e28' : '#c8ecd0'}`, background: isDark ? '#0a2018' : '#e8f5ea' }}
                >
                  {(['all', 'unread'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: filter === f ? 600 : 400, cursor: 'pointer',
                        background: filter === f ? tc.accentMuted : 'transparent',
                        border: `1px solid ${filter === f ? tc.accent : 'transparent'}`,
                        color: filter === f ? tc.accent : isDark ? '#6fa894' : '#2e6b5e',
                      }}
                    >
                      {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
                    </button>
                  ))}
                </div>

                {/* List */}
                <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  {displayed.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <Bell className="w-8 h-8 mx-auto mb-2" style={{ color: isDark ? '#2a3a4a' : '#c0ccd8' }} />
                      <div style={{ fontSize: '12px', color: isDark ? '#4a6070' : '#8a9aaa' }}>No notifications</div>
                    </div>
                  ) : (
                    displayed.map((n, i) => {
                      const Icon = TYPE_ICON[n.type];
                      const color = TYPE_COLOR[n.type];
                      return (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className="px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors"
                          style={{
                            borderBottom: i < displayed.length - 1 ? `1px solid ${isDark ? '#0e1a28' : '#f0f4f8'}` : undefined,
                            background: n.read ? 'transparent' : tc.accentFaint,
                          }}
                        >
                          {/* Icon badge */}
                          <div
                            className="flex items-center justify-center rounded-lg flex-shrink-0"
                            style={{ width: '30px', height: '30px', background: `${color}18`, border: `1px solid ${color}30`, marginTop: '1px' }}
                          >
                            <Icon size={13} color={color} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <span style={{ fontSize: '11.5px', fontWeight: n.read ? 500 : 700, color: isDark ? '#d0dae6' : '#1a2a38' }}>
                                {n.title}
                              </span>
                              {!n.read && (
                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: tc.accent }} />
                              )}
                            </div>
                            <div style={{ fontSize: '10.5px', color: isDark ? '#5a7090' : '#6a7a88', lineHeight: 1.4 }}>
                              {n.body}
                            </div>
                            <div style={{ fontSize: '9.5px', color: isDark ? '#3a5060' : '#9aaab8', marginTop: '4px' }}>
                              {n.time}
                            </div>
                          </div>

                          {/* Dismiss */}
                          <button
                            onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: isDark ? '#2a3a4a' : '#c0ccd8', flexShrink: 0 }}
                            title="Dismiss"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div
                    className="px-4 py-2.5 text-center"
                    style={{ borderTop: `1px solid ${isDark ? '#0f2e28' : '#c8ecd0'}`, background: isDark ? '#0a2018' : '#e8f5ea' }}
                  >
                    <button style={{ fontSize: '10.5px', color: tc.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                      View all activity →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${tc.secondaryBtn}`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" style={{ color: tc.accent }} /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav links */}
      <div className="flex md:hidden items-center gap-1 pb-2 overflow-x-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${isActive(path) ? '' : tc.navItemInactive}`}
            style={isActive(path) ? { background: tc.accentMuted, color: tc.accent } : {}}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
