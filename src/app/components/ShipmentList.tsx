import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Package, ChevronRight, Plane, Ship, Truck, RefreshCw, CheckCircle } from 'lucide-react';
import { useTC } from '../contexts/ThemeContext';
import { NavBar } from './NavBar';

type ShipmentStatus = 'In Transit' | 'Delivered' | 'Pending Authorization' | 'Delayed' | 'High Priority' | 'Active';
type TransportMode = 'air' | 'sea' | 'road';

interface Shipment {
  id: string;
  trackingNumber: string;
  client: string;
  origin: string;
  destination: string;
  currentLocation: string;
  value: string;
  status: ShipmentStatus;
  eta: string;
  lastUpdate: string;
  transportMode: TransportMode;
  progress: number;
}

const shipments: Shipment[] = [
  { id: '1', trackingNumber: 'MLCA-2026-001847', client: 'Tiffany & Co.', origin: 'London, UK', destination: 'New York, USA', currentLocation: 'Mid-Atlantic Ocean', value: '$2,450,000', status: 'In Transit', eta: '2026-06-08', lastUpdate: '2026-06-07 14:32 UTC', transportMode: 'air', progress: 72 },
  { id: '2', trackingNumber: 'MLCA-2026-001846', client: 'Cartier International', origin: 'Dubai, UAE', destination: 'Hong Kong', currentLocation: 'Dubai, UAE', value: '$1,850,000', status: 'Pending Authorization', eta: '2026-06-10', lastUpdate: '2026-06-07 09:14 UTC', transportMode: 'air', progress: 15 },
  { id: '3', trackingNumber: 'MLCA-2026-001845', client: 'UBS AG', origin: 'Zurich, Switzerland', destination: 'Singapore', currentLocation: 'Indian Ocean', value: '$3,200,000', status: 'High Priority', eta: '2026-06-06', lastUpdate: '2026-06-07 06:55 UTC', transportMode: 'sea', progress: 60 },
  { id: '4', trackingNumber: 'MLCA-2026-001844', client: 'Van Cleef & Arpels', origin: 'Paris, France', destination: 'Tokyo, Japan', currentLocation: 'Tokyo, Japan', value: '$980,000', status: 'Delivered', eta: '2026-06-03', lastUpdate: '2026-06-03 18:41 UTC', transportMode: 'air', progress: 100 },
  { id: '5', trackingNumber: 'MLCA-2026-001843', client: 'Royal Bank of Canada', origin: 'New York, USA', destination: 'Sydney, Australia', currentLocation: 'Pacific Ocean', value: '$1,450,000', status: 'Delayed', eta: '2026-06-12', lastUpdate: '2026-06-07 22:08 UTC', transportMode: 'sea', progress: 40 },
  { id: '6', trackingNumber: 'MLCA-2026-001842', client: 'Goldman Sachs', origin: 'Singapore', destination: 'Geneva, Switzerland', currentLocation: 'Mumbai, India', value: '$4,100,000', status: 'In Transit', eta: '2026-06-11', lastUpdate: '2026-06-07 18:00 UTC', transportMode: 'air', progress: 55 },
  { id: '7', trackingNumber: 'MLCA-2026-001841', client: 'Sotheby\'s', origin: 'Hong Kong', destination: 'London, UK', currentLocation: 'Frankfurt, Germany', value: '$2,750,000', status: 'In Transit', eta: '2026-06-09', lastUpdate: '2026-06-07 12:45 UTC', transportMode: 'air', progress: 85 },
  { id: '8', trackingNumber: 'MLCA-2026-001840', client: 'Credit Suisse', origin: 'New York, USA', destination: 'Dubai, UAE', currentLocation: 'New York, USA', value: '$5,600,000', status: 'Active', eta: '2026-06-13', lastUpdate: '2026-06-07 08:30 UTC', transportMode: 'road', progress: 5 },
];

const STATUS_COLOR: Record<ShipmentStatus, { bg: string; text: string; border: string }> = {
  'In Transit':           { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  'Delivered':            { bg: 'rgba(34,197,94,0.15)',   text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  'Pending Authorization':{ bg: 'rgba(249,115,22,0.15)',  text: '#fb923c', border: 'rgba(249,115,22,0.3)' },
  'Delayed':              { bg: 'rgba(239,68,68,0.15)',   text: '#f87171', border: 'rgba(239,68,68,0.3)' },
  'High Priority':        { bg: 'rgba(186,171,72,0.15)',  text: '#c8a020', border: 'rgba(186,171,72,0.3)' },
  'Active':               { bg: 'rgba(168,85,247,0.15)', text: '#c084fc', border: 'rgba(168,85,247,0.3)' },
};

function ModeIcon({ mode }: { mode: TransportMode }) {
  if (mode === 'air') return <Plane size={12} />;
  if (mode === 'sea') return <Ship size={12} />;
  return <Truck size={12} />;
}

export function ShipmentList() {
  const navigate = useNavigate();
  const tc = useTC();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ShipmentStatus | 'All'>('All');
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setSyncDone(false);
    setTimeout(() => { setSyncing(false); setSyncDone(true); setTimeout(() => setSyncDone(false), 2500); }, 1400);
  };

  const statuses: (ShipmentStatus | 'All')[] = ['All', 'In Transit', 'Pending Authorization', 'High Priority', 'Delayed', 'Delivered', 'Active'];

  const filtered = shipments.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.trackingNumber.toLowerCase().includes(q) ||
      s.client.toLowerCase().includes(q) ||
      s.origin.toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q) ||
      s.currentLocation.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className={`min-h-screen ${tc.pageBg} ${tc.text}`}>
      <NavBar />

      {/* Page header */}
      <div className={`${tc.headerBg} border-b px-4 md:px-8 py-5`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600 }} className="mb-1">Shipment Tracking</h1>
            <p className={`text-sm ${tc.subtext}`}>{shipments.length} active shipments · click any row to view full tracking details</p>
          </div>
          {/* Right: sync button + search */}
          <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex-shrink-0"
            style={{
              background: syncDone ? 'rgba(34,197,94,0.15)' : `${tc.isDark ? '#BAAB48' : '#BAAB48'}`,
              color: syncDone ? '#22c55e' : '#111111',
              border: syncDone ? '1px solid rgba(34,197,94,0.35)' : 'none',
              opacity: syncing ? 0.7 : 1,
              cursor: syncing ? 'not-allowed' : 'pointer',
            }}
          >
            {syncDone
              ? <><CheckCircle size={14} /> Updated</>
              : <><RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Update Shipment Status</>
            }
          </button>
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${tc.isDark ? 'text-[#4a6070]' : 'text-[#aaa]'}`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tracking #, client, location…"
              className={`w-full border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none ${tc.inputBg}`}
            />
          </div>
          </div>
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {statuses.map(s => {
            const isActive = filterStatus === s;
            const color = s !== 'All' ? STATUS_COLOR[s] : null;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: isActive
                    ? (color ? color.bg : tc.accentMuted)
                    : (tc.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                  border: `1px solid ${isActive ? (color ? color.border : tc.accentBorder) : (tc.isDark ? '#163d36' : '#a5d8ae')}`,
                  color: isActive ? (color ? color.text : tc.accent) : (tc.isDark ? '#6a8090' : '#6a7a88'),
                }}
              >
                {s}
                {s !== 'All' && (
                  <span style={{ marginLeft: '5px', opacity: 0.6 }}>
                    {shipments.filter(sh => sh.status === s).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="p-4 md:p-8">
        <div className={`${tc.cardBg} border ${tc.border} rounded-xl overflow-hidden`}>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full" style={{ minWidth: '900px' }}>
              <thead>
                <tr className={`border-b ${tc.border} ${tc.tableHeaderBg}`}>
                  {['Tracking Number', 'Client', 'Route', 'Current Location', 'Mode', 'Value', 'Status', 'Progress', 'ETA', 'Last Update', ''].map(h => (
                    <th key={h} className={`px-4 py-3.5 text-left text-xs ${tc.subtext} whitespace-nowrap`} style={{ fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center">
                      <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <div className={`text-sm ${tc.subtext}`}>No shipments match your search</div>
                    </td>
                  </tr>
                ) : filtered.map(s => {
                  const sc = STATUS_COLOR[s.status];
                  return (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/tracking/${s.trackingNumber}`)}
                      className={`border-b ${tc.border} transition-colors cursor-pointer`}
                      style={{ background: 'transparent' }}
                      onMouseEnter={e => (e.currentTarget.style.background = tc.isDark ? 'rgba(186,171,72,0.04)' : 'rgba(186,171,72,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-4 py-4">
                        <code style={{ color: tc.accent, fontSize: '12px', fontWeight: 600 }}>{s.trackingNumber}</code>
                      </td>
                      <td className="px-4 py-4 text-sm whitespace-nowrap" style={{ fontWeight: 500 }}>{s.client}</td>
                      <td className="px-4 py-4">
                        <div style={{ fontSize: '12px' }}>
                          <div>{s.origin}</div>
                          <div className={tc.subtext}>→ {s.destination}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                          {s.currentLocation}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs whitespace-nowrap"
                          style={{ background: tc.isDark ? '#1a2535' : '#f0f4f8', color: tc.isDark ? '#8aa0b8' : '#4a6070' }}
                        >
                          <ModeIcon mode={s.transportMode} />
                          {s.transportMode === 'air' ? 'Air' : s.transportMode === 'sea' ? 'Sea' : 'Road'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm whitespace-nowrap" style={{ fontWeight: 600 }}>{s.value}</td>
                      <td className="px-4 py-4">
                        <span
                          className="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                          style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-4" style={{ minWidth: '100px' }}>
                        <div className="flex items-center gap-2">
                          <div className={`flex-1 rounded-full h-1.5 overflow-hidden ${tc.isDark ? 'bg-[#1a2535]' : 'bg-[#e8f0f8]'}`}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${s.progress}%`,
                                background: s.status === 'Delivered' ? '#22c55e' : s.status === 'Delayed' ? '#ef4444' : tc.accent,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '10px', color: tc.isDark ? '#5a7090' : '#8a9aaa', whiteSpace: 'nowrap' }}>{s.progress}%</span>
                        </div>
                      </td>
                      <td className={`px-4 py-4 text-xs whitespace-nowrap ${tc.subtext}`}>{s.eta}</td>
                      <td className={`px-4 py-4 text-xs whitespace-nowrap ${tc.subtext}`}>{s.lastUpdate}</td>
                      <td className="px-4 py-4">
                        <ChevronRight size={16} color={tc.isDark ? '#3a5060' : '#b0c0d0'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className={`md:hidden divide-y ${tc.divider}`}>
            {filtered.map(s => {
              const sc = STATUS_COLOR[s.status];
              return (
                <div
                  key={s.id}
                  onClick={() => navigate(`/tracking/${s.trackingNumber}`)}
                  className="p-4 cursor-pointer active:opacity-80"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <code style={{ color: tc.accent, fontSize: '12px', fontWeight: 600 }}>{s.trackingNumber}</code>
                      <div className="text-sm mt-0.5" style={{ fontWeight: 500 }}>{s.client}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                        {s.status}
                      </span>
                      <ChevronRight size={14} color={tc.isDark ? '#3a5060' : '#b0c0d0'} />
                    </div>
                  </div>
                  <div className={`space-y-1.5 text-xs ${tc.subtext} mb-3`}>
                    <div className="flex justify-between"><span>Route:</span><span className="text-right">{s.origin} → {s.destination}</span></div>
                    <div className="flex justify-between"><span>Location:</span><span>{s.currentLocation}</span></div>
                    <div className="flex justify-between"><span>Value:</span><span style={{ fontWeight: 600, color: tc.accent }}>{s.value}</span></div>
                    <div className="flex justify-between"><span>ETA:</span><span>{s.eta}</span></div>
                  </div>
                  <div className={`rounded-full h-1.5 overflow-hidden ${tc.isDark ? 'bg-[#1a2535]' : 'bg-[#e8f0f8]'}`}>
                    <div className="h-full rounded-full" style={{ width: `${s.progress}%`, background: s.status === 'Delivered' ? '#22c55e' : tc.accent }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filtered.length > 0 && (
          <div className={`text-xs mt-3 ${tc.subtext}`}>
            Showing {filtered.length} of {shipments.length} shipments
          </div>
        )}
      </div>
    </div>
  );
}
