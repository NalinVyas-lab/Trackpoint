import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  MapPin, Calendar, DollarSign, FileText, CheckCircle,
  Clock, AlertCircle, ArrowLeft, MapPinned,
} from 'lucide-react';
import {
  ComposableMap, Geographies, Geography, Marker, useMapContext,
} from 'react-simple-maps';
import { useTC } from '../contexts/ThemeContext';
import { NavBar } from './NavBar';
import { MilestoneModal } from './MilestoneModal';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface Milestone {
  id: string;
  date: string;
  time: string;
  location: string;
  status: 'completed' | 'current' | 'pending';
  type: 'checkpoint' | 'customs' | 'carrier' | 'authorization';
  description: string;
  duties?: string;
  invoices?: number;
  carrier?: string;
  documents?: number;
}

interface Waypoint {
  label: string;
  coords: [number, number];
  milestoneId: string;
  status: 'completed' | 'current' | 'pending';
  time: string;
  date: string;
  description: string;
}

const mockMilestones: Milestone[] = [
  { id: '1', date: '2026-06-02', time: '09:30', location: 'London Heathrow Airport, UK', status: 'completed', type: 'checkpoint', description: 'Shipment collected from secure vault', documents: 3 },
  { id: '2', date: '2026-06-02', time: '14:45', location: 'London Hub Authorization Center', status: 'completed', type: 'authorization', description: 'Export authorization approved', documents: 5 },
  { id: '3', date: '2026-06-03', time: '10:20', location: 'Frankfurt International Airport, Germany', status: 'completed', type: 'carrier', description: 'Transfer to Lufthansa Cargo LH8234', carrier: 'Lufthansa Cargo', documents: 2 },
  { id: '4', date: '2026-06-04', time: '06:15', location: 'JFK International Airport, New York', status: 'current', type: 'customs', description: 'Customs clearance in progress', duties: '$18,450', invoices: 4, documents: 8 },
  { id: '5', date: '2026-06-08', time: '14:00', location: 'Manhattan Vault, New York', status: 'pending', type: 'checkpoint', description: 'Final delivery to secure vault', documents: 0 },
];

const waypoints: Waypoint[] = [
  { label: 'London', coords: [-0.1, 51.5], milestoneId: '1', status: 'completed', date: '2026-06-02', time: '09:30', description: 'Shipment collected from secure vault' },
  { label: 'Frankfurt', coords: [8.7, 50.1], milestoneId: '3', status: 'completed', date: '2026-06-03', time: '10:20', description: 'Transfer to Lufthansa Cargo LH8234' },
  { label: 'New York (JFK)', coords: [-73.8, 40.6], milestoneId: '4', status: 'current', date: '2026-06-04', time: '06:15', description: 'Customs clearance in progress' },
  { label: 'Manhattan Vault', coords: [-74.0, 40.75], milestoneId: '5', status: 'pending', date: '2026-06-08', time: '14:00', description: 'Final delivery to secure vault' },
];

function RouteArcs({ waypoints, isDark, accent }: { waypoints: Waypoint[]; isDark: boolean; accent: string }) {
  const { projection } = useMapContext();
  const segments = [
    { from: waypoints[0], to: waypoints[1], done: true },
    { from: waypoints[1], to: waypoints[2], done: true },
    { from: waypoints[2], to: waypoints[3], done: false },
  ];
  return (
    <>
      {segments.map((seg, i) => {
        const p1 = projection(seg.from.coords);
        const p2 = projection(seg.to.coords);
        if (!p1 || !p2) return null;
        const [x1, y1] = p1, [x2, y2] = p2;
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
        const cpx = mx - dy * 0.18, cpy = my + dx * 0.18 - len * 0.14;
        const d = `M ${x1},${y1} Q ${cpx},${cpy} ${x2},${y2}`;
        return (
          <g key={i}>
            <path d={d} stroke={accent} strokeWidth="9" fill="none" strokeOpacity="0.08" />
            <path d={d} stroke={accent} strokeWidth="2.2" fill="none"
              strokeOpacity={seg.done ? 0.88 : 0.28}
              strokeDasharray={seg.done ? 'none' : '9 7'}
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

export function ShipmentTracking() {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const tc = useTC();
  const GOLD = tc.accent;
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [hoveredWp, setHoveredWp] = useState<Waypoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const currentMilestoneIndex = mockMilestones.findIndex(m => m.status === 'current');
  const completionPercentage = ((currentMilestoneIndex + 1) / mockMilestones.length) * 100;

  const getMilestoneIcon = (type: Milestone['type']) => {
    switch (type) {
      case 'checkpoint': return MapPin;
      case 'customs': return AlertCircle;
      case 'carrier': return PackageIcon;
      case 'authorization': return CheckCircle;
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (rect) setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const oceanBg = tc.isDark ? '#0b1320' : '#0d1a2e';
  const landFill = tc.isDark ? '#1c2333' : '#1c2b40';
  const landStroke = tc.isDark ? '#283548' : '#2a3d58';
  const landHover = tc.isDark ? '#232d40' : '#243550';

  return (
    <div className={`min-h-screen ${tc.pageBg} ${tc.text}`}>
      <NavBar />

      {/* Header */}
      <div className={`${tc.headerBg} border-b px-4 md:px-8 py-4`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/tracking')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${tc.secondaryBtn}`}
            >
              <ArrowLeft size={13} /> All Shipments
            </button>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-0.5">Shipment Tracking</h1>
              <code className="text-sm" style={{ color: GOLD }}>{trackingNumber || 'MLCA-2026-001847'}</code>
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <div className={`text-xs ${tc.subtext}`}>Client</div>
              <div className="text-sm" style={{ fontWeight: 500 }}>Tiffany & Co.</div>
            </div>
            <div className={`w-px ${tc.isDark ? 'bg-[#333]' : 'bg-[#e5e5e5]'}`} />
            <div>
              <div className={`text-xs ${tc.subtext}`}>Shipment Value</div>
              <div className="text-sm" style={{ fontWeight: 600, color: GOLD }}>$2,450,000</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-8">
        {/* Left: Map + Info */}
        <div className="lg:col-span-2 space-y-4">

          {/* Real Map */}
          <div
            ref={mapRef}
            className={`relative rounded-xl overflow-hidden border ${tc.border}`}
            style={{ height: '440px', background: oceanBg }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredWp(null)}
          >
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 420, center: [-15, 48] }}
              style={{ width: '100%', height: '100%' }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map(geo => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={landFill}
                      stroke={landStroke}
                      strokeWidth={0.4}
                      style={{
                        default: { fill: landFill, outline: 'none' },
                        hover: { fill: landHover, outline: 'none' },
                        pressed: { fill: landHover, outline: 'none' },
                      }}
                    />
                  ))
                }
              </Geographies>

              <RouteArcs waypoints={waypoints} isDark={tc.isDark} accent={GOLD} />

              {waypoints.map(wp => (
                <Marker key={wp.label} coordinates={wp.coords}>
                  <g
                    style={{ cursor: wp.status !== 'pending' ? 'pointer' : 'default' }}
                    onMouseEnter={() => setHoveredWp(wp)}
                    onMouseLeave={() => setHoveredWp(null)}
                    onClick={() => {
                      const ms = mockMilestones.find(m => m.id === wp.milestoneId);
                      if (ms && ms.status !== 'pending') setSelectedMilestone(ms);
                    }}
                  >
                    {/* Pulse for current */}
                    {wp.status === 'current' && (
                      <>
                        <circle r="26" fill={GOLD} opacity="0.1">
                          <animate attributeName="r" values="20;32;20" dur="2.2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.12;0;0.12" dur="2.2s" repeatCount="indefinite" />
                        </circle>
                        <circle r="18" fill={GOLD} opacity="0.15" />
                      </>
                    )}
                    {/* Drop shadow */}
                    <circle r="13" fill="rgba(0,0,0,0.45)" transform="translate(1.5,2.5)" />
                    {/* Main badge */}
                    <circle
                      r="13"
                      fill={wp.status === 'pending' ? (tc.isDark ? '#182030' : '#243040') : GOLD}
                      stroke={wp.status === 'pending' ? (tc.isDark ? '#2a3e58' : '#3a5068') : 'rgba(255,255,255,0.6)'}
                      strokeWidth={wp.status === 'current' ? 3 : 1.5}
                      opacity={wp.status === 'pending' ? 0.55 : 1}
                    />
                    {/* Centre dot */}
                    <circle
                      r="5"
                      fill={wp.status === 'pending' ? (tc.isDark ? '#3a5060' : '#5a7080') : '#1a1a1a'}
                    />
                    {/* Label above pin */}
                    <text
                      textAnchor="middle"
                      y={-20}
                      style={{
                        fontSize: '7.5px',
                        fill: wp.status === 'pending' ? (tc.isDark ? '#3a5060' : '#5a7080') : GOLD,
                        fontFamily: 'system-ui, sans-serif',
                        fontWeight: 700,
                        pointerEvents: 'none',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {wp.label}
                    </text>
                  </g>
                </Marker>
              ))}
            </ComposableMap>

            {/* Hover tooltip */}
            {hoveredWp && (
              <div
                className="absolute z-20 rounded-xl shadow-2xl pointer-events-none overflow-hidden"
                style={{
                  left: Math.min(tooltipPos.x + 16, (mapRef.current?.offsetWidth ?? 500) - 228),
                  top: Math.max(tooltipPos.y - 140, 8),
                  width: '220px',
                  background: tc.isDark ? '#0d1525' : '#ffffff',
                  border: `1.5px solid ${tc.isDark ? '#283548' : '#d8e2ec'}`,
                  borderTop: `2px solid ${GOLD}`,
                }}
              >
                {/* Tooltip header */}
                <div
                  className="px-3 py-2.5 flex items-center gap-2"
                  style={{ background: tc.isDark ? 'rgba(186,171,72,0.07)' : 'rgba(186,171,72,0.05)', borderBottom: `1px solid ${tc.isDark ? '#1a2535' : '#eef2f6'}` }}
                >
                  <MapPinned size={12} color={GOLD} />
                  <span style={{ color: GOLD, fontWeight: 700, fontSize: '11px' }}>{hoveredWp.label}</span>
                  <span
                    className="ml-auto rounded-full px-1.5 py-0.5 text-[9px]"
                    style={{
                      background: hoveredWp.status === 'completed' ? 'rgba(34,197,94,0.15)' : hoveredWp.status === 'current' ? `${GOLD}20` : 'rgba(80,100,120,0.15)',
                      color: hoveredWp.status === 'completed' ? '#4ade80' : hoveredWp.status === 'current' ? GOLD : (tc.isDark ? '#5a7090' : '#7a8898'),
                      border: `1px solid ${hoveredWp.status === 'completed' ? 'rgba(34,197,94,0.3)' : hoveredWp.status === 'current' ? `${GOLD}40` : 'transparent'}`,
                      fontWeight: 600,
                    }}
                  >
                    {hoveredWp.status === 'completed' ? '✓ Completed' : hoveredWp.status === 'current' ? '● Active' : 'Pending'}
                  </span>
                </div>

                {/* Tooltip body */}
                <div className="px-3 py-2.5 space-y-2" style={{ fontSize: '11px' }}>
                  <div className="flex items-center justify-between">
                    <span style={{ color: tc.isDark ? '#4a6070' : '#6a7a88' }}>Date</span>
                    <span style={{ color: tc.isDark ? '#c0cdd8' : '#1a2a38', fontWeight: 600 }}>{hoveredWp.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: tc.isDark ? '#4a6070' : '#6a7a88' }}>Time</span>
                    <span style={{ color: tc.isDark ? '#c0cdd8' : '#1a2a38', fontWeight: 600 }}>{hoveredWp.time} UTC</span>
                  </div>
                  <div style={{ height: '1px', background: tc.isDark ? '#1a2535' : '#eef2f6' }} />
                  <div style={{ color: tc.isDark ? '#8aa0b8' : '#4a5868', lineHeight: 1.45 }}>
                    {hoveredWp.description}
                  </div>
                  {hoveredWp.status !== 'pending' && (
                    <div style={{ color: GOLD, fontSize: '9.5px', fontWeight: 600 }}>
                      Click to view details →
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Legend overlay */}
            <div
              className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg px-3 py-2"
              style={{ background: 'rgba(11,19,32,0.9)', border: '1px solid #2a3d58', backdropFilter: 'blur(8px)', fontSize: '10px' }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-0.5 rounded" style={{ background: GOLD }} />
                <span style={{ color: '#6a8aaa' }}>Route completed</span>
              </div>
              <div className="flex items-center gap-0.5">
                {[0,1,2,3].map(i => <div key={i} style={{ width: '4px', height: '2px', background: GOLD, opacity: 0.35, borderRadius: '1px', marginRight: '2px' }} />)}
                <span style={{ color: '#6a8aaa', marginLeft: '2px' }}>Pending</span>
              </div>
            </div>

            {/* Live badge */}
            <div
              className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ background: 'rgba(11,19,32,0.9)', border: '1px solid #2a3d58', backdropFilter: 'blur(8px)', fontSize: '10px' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span style={{ color: '#6a8aaa' }}>Live Tracking</span>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: Calendar, label: 'Start Date', value: 'Jun 2, 2026' },
              { icon: Clock, label: 'ETA', value: 'Jun 8, 2026' },
              { icon: MapPin, label: 'Current Location', value: 'New York, USA' },
              { icon: CheckCircle, label: 'Authorization', value: 'Approved', valueClass: 'text-green-400' },
              { icon: DollarSign, label: 'Shipment Value', value: '$2.45M' },
              { icon: FileText, label: 'Documents', value: '18 files' },
            ].map(card => (
              <div key={card.label} className={`${tc.cardBg} border ${tc.border} rounded-lg p-3.5`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <card.icon className="w-3.5 h-3.5" style={{ color: GOLD }} />
                  <span className={`text-xs ${tc.subtext}`}>{card.label}</span>
                </div>
                <div className={`text-sm ${card.valueClass || ''}`} style={{ fontWeight: 600 }}>{card.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Timeline */}
        <div className={`${tc.cardBg} border ${tc.border} rounded-lg p-4 md:p-5`}>
          <div className="mb-4">
            <h2 style={{ fontSize: '15px', fontWeight: 600 }} className="mb-2">Shipment Timeline</h2>
            <div className={`${tc.isDark ? 'bg-[#1a1a1a]' : 'bg-[#f0f0f0]'} rounded-full h-1.5 overflow-hidden`}>
              <div className="h-full transition-all duration-500" style={{ width: `${completionPercentage}%`, background: GOLD }} />
            </div>
            <div className={`text-xs ${tc.subtext} mt-1`}>{Math.round(completionPercentage)}% Complete</div>
          </div>

          <div className="space-y-3">
            {mockMilestones.map((milestone, index) => {
              const Icon = getMilestoneIcon(milestone.type);
              const isLast = index === mockMilestones.length - 1;
              return (
                <div key={milestone.id} className="relative">
                  {!isLast && (
                    <div className="absolute left-[11px] top-8 w-0.5 h-[calc(100%+12px)]" style={{ background: milestone.status === 'completed' ? GOLD : tc.isDark ? '#1d4d44' : '#a5d8ae' }} />
                  )}
                  <button
                    onClick={() => milestone.status !== 'pending' && setSelectedMilestone(milestone)}
                    className={`w-full text-left p-2.5 rounded-lg transition-all ${milestone.status !== 'pending' ? `${tc.hoverBg} cursor-pointer` : 'cursor-default'}`}
                  >
                    <div className="flex gap-2.5">
                      <div
                        className={`relative flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${milestone.status === 'current' ? 'animate-pulse' : ''}`}
                        style={{ background: milestone.status === 'completed' || milestone.status === 'current' ? GOLD : tc.isDark ? '#163d36' : '#c8ecd0' }}
                      >
                        <Icon className={`w-3 h-3 ${milestone.status === 'pending' ? (tc.isDark ? 'text-[#666]' : 'text-[#bbb]') : 'text-[#1a1a1a]'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5 mb-0.5">
                          <div className="text-sm" style={{ fontWeight: 500 }}>{milestone.description}</div>
                          {milestone.status === 'current' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: `${GOLD}20`, color: GOLD, border: `1px solid ${GOLD}40` }}>
                              Current
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${tc.subtext}`}>{milestone.date} · {milestone.time}</div>
                        <div className={`text-xs ${tc.subtext} truncate`}>{milestone.location}</div>
                        {milestone.documents !== undefined && milestone.documents > 0 && (
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] flex-wrap">
                            {milestone.duties && <span style={{ color: GOLD }}>Duties: {milestone.duties}</span>}
                            {milestone.invoices && <span className={tc.subtext}>{milestone.invoices} invoices</span>}
                            {milestone.carrier && <span className={tc.subtext}>{milestone.carrier}</span>}
                            {milestone.documents > 0 && <span className={tc.subtext}>{milestone.documents} docs</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedMilestone && (
        <MilestoneModal milestone={selectedMilestone} onClose={() => setSelectedMilestone(null)} />
      )}
    </div>
  );
}
