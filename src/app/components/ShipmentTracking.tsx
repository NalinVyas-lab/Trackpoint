import { useState } from 'react';
import { useParams } from 'react-router';
import { MapPin, Calendar, DollarSign, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useTC } from '../contexts/ThemeContext';
import { NavBar } from './NavBar';
import { MilestoneModal } from './MilestoneModal';

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

const mockMilestones: Milestone[] = [
  { id: '1', date: '2026-06-02', time: '09:30', location: 'London Heathrow Airport, UK', status: 'completed', type: 'checkpoint', description: 'Shipment collected from secure vault', documents: 3 },
  { id: '2', date: '2026-06-02', time: '14:45', location: 'London Hub Authorization Center', status: 'completed', type: 'authorization', description: 'Export authorization approved', documents: 5 },
  { id: '3', date: '2026-06-03', time: '10:20', location: 'Frankfurt International Airport, Germany', status: 'completed', type: 'carrier', description: 'Transfer to Lufthansa Cargo LH8234', carrier: 'Lufthansa Cargo', documents: 2 },
  { id: '4', date: '2026-06-04', time: '06:15', location: 'JFK International Airport, New York', status: 'current', type: 'customs', description: 'Customs clearance in progress', duties: '$18,450', invoices: 4, documents: 8 },
  { id: '5', date: '2026-06-08', time: '14:00', location: 'Manhattan Vault, New York', status: 'pending', type: 'checkpoint', description: 'Final delivery to secure vault', documents: 0 },
];

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
  const tc = useTC();
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

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

  return (
    <div className={`min-h-screen ${tc.pageBg} ${tc.text}`}>
      <NavBar />

      {/* Shipment header */}
      <div className={`${tc.headerBg} border-b px-4 md:px-8 py-4`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-1">Shipment Tracking</h1>
            <code className="text-[#BAAB48] text-sm">{trackingNumber || 'MLCA-2026-001847'}</code>
          </div>
          <div className="flex gap-4">
            <div>
              <div className={`text-xs ${tc.subtext}`}>Client</div>
              <div className="text-sm" style={{ fontWeight: 500 }}>Tiffany & Co.</div>
            </div>
            <div className={`w-px ${tc.isDark ? 'bg-[#333]' : 'bg-[#e5e5e5]'}`} />
            <div>
              <div className={`text-xs ${tc.subtext}`}>Shipment Value</div>
              <div className="text-sm" style={{ fontWeight: 600, color: '#BAAB48' }}>$2,450,000</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-8">
        {/* Map + Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Map */}
          <div className={`${tc.isDark ? 'bg-[#0e0e0e]' : 'bg-[#dbeafe]'} border ${tc.border} rounded-lg overflow-hidden`} style={{ height: '340px' }}>
            <div className="relative w-full h-full">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="oceanG" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: tc.isDark ? '#0e0e0e' : '#bfdbfe', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: tc.isDark ? '#1a1a1a' : '#dbeafe', stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id="landG" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: tc.isDark ? '#2a2a2a' : '#d4d8dc', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: tc.isDark ? '#242424' : '#c8cdd3', stopOpacity: 1 }} />
                  </linearGradient>
                  <filter id="glow2">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                <rect width="1200" height="600" fill="url(#oceanG)" />

                {/* Grid */}
                <g opacity={tc.isDark ? 0.04 : 0.08}>
                  {Array.from({ length: 20 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i*30} x2="1200" y2={i*30} stroke="#BAAB48" strokeWidth="0.5" />)}
                  {Array.from({ length: 40 }).map((_, i) => <line key={`v${i}`} x1={i*30} y1="0" x2={i*30} y2="600" stroke="#BAAB48" strokeWidth="0.5" />)}
                </g>

                {/* UK */}
                <ellipse cx="260" cy="200" rx="25" ry="20" fill={tc.isDark ? '#2a2a2a' : '#d4d8dc'} stroke={tc.isDark ? '#333' : '#b8bec6'} strokeWidth="1" opacity="0.9" />
                {/* Continental Europe */}
                <path d="M 320,220 Q 380,200 420,210 L 450,230 Q 470,250 460,280 L 440,300 Q 410,310 380,300 L 350,280 Q 330,260 320,240 Z" fill="url(#landG)" stroke={tc.isDark ? '#333' : '#b8bec6'} strokeWidth="1" opacity="0.8" />
                {/* North America East */}
                <path d="M 720,150 Q 800,140 860,160 L 900,200 Q 920,240 910,280 L 880,340 Q 850,380 810,390 L 760,385 Q 720,370 700,340 L 680,300 Q 670,260 680,220 L 700,180 Z" fill="url(#landG)" stroke={tc.isDark ? '#333' : '#b8bec6'} strokeWidth="1" opacity="0.8" />

                {/* Completed route */}
                <path d="M 260,200 Q 350,180 450,200 Q 550,220 650,240 Q 700,250 750,260" stroke="#BAAB48" strokeWidth="5" fill="none" strokeLinecap="round" filter="url(#glow2)" opacity="0.9" />
                {/* Animated dot */}
                <circle r="4" fill="#BAAB48" opacity="0.9">
                  <animateMotion dur="8s" repeatCount="indefinite" path="M 260,200 Q 350,180 450,200 Q 550,220 650,240 Q 700,250 750,260" />
                </circle>
                {/* Remaining dashed */}
                <path d="M 750,260 Q 800,270 850,275" stroke={tc.isDark ? '#444' : '#aaa'} strokeWidth="4" fill="none" strokeDasharray="15,10" strokeLinecap="round" />

                {/* London */}
                <g><circle cx="260" cy="200" r="14" fill={tc.isDark ? '#1a1a1a' : '#fff'} stroke="#BAAB48" strokeWidth="3" /><circle cx="260" cy="200" r="6" fill="#BAAB48" /><circle cx="260" cy="200" r="24" fill="none" stroke="#BAAB48" strokeWidth="1.5" opacity="0.3" /></g>
                {/* Frankfurt */}
                <g><circle cx="370" cy="220" r="14" fill={tc.isDark ? '#1a1a1a' : '#fff'} stroke="#BAAB48" strokeWidth="3" /><circle cx="370" cy="220" r="6" fill="#BAAB48" /><circle cx="370" cy="220" r="24" fill="none" stroke="#BAAB48" strokeWidth="1.5" opacity="0.3" /></g>
                {/* New York (current, pulsing) */}
                <g>
                  <circle cx="750" cy="260" r="18" fill="#BAAB48" opacity="0.2"><animate attributeName="r" values="18;32;18" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" /></circle>
                  <circle cx="750" cy="260" r="16" fill={tc.isDark ? '#1a1a1a' : '#fff'} stroke="#BAAB48" strokeWidth="4" />
                  <circle cx="750" cy="260" r="8" fill="#BAAB48"><animate attributeName="r" values="8;10;8" dur="1.5s" repeatCount="indefinite" /></circle>
                </g>
                {/* Manhattan (destination) */}
                <g opacity="0.6">
                  <circle cx="850" cy="275" r="12" fill={tc.isDark ? '#1a1a1a' : '#fff'} stroke={tc.isDark ? '#555' : '#bbb'} strokeWidth="2" />
                  <circle cx="850" cy="275" r="5" fill={tc.isDark ? '#555' : '#bbb'} />
                </g>
              </svg>

              {/* Overlay labels */}
              <div className="absolute top-[30%] left-[18%]" style={{ background: tc.isDark ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)', borderColor: 'rgba(186,171,72,0.6)', border: '1px solid', borderRadius: 8, padding: '6px 10px' }}>
                <div className="text-xs text-[#BAAB48]" style={{ fontWeight: 700 }}>London, UK</div>
                <div className={`text-[10px] ${tc.subtext}`}>✓ Departed</div>
              </div>
              <div className="absolute top-[33%] left-[28%]" style={{ background: tc.isDark ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)', borderColor: 'rgba(186,171,72,0.6)', border: '1px solid', borderRadius: 8, padding: '6px 10px' }}>
                <div className="text-xs text-[#BAAB48]" style={{ fontWeight: 700 }}>Frankfurt, DE</div>
                <div className={`text-[10px] ${tc.subtext}`}>✓ Completed</div>
              </div>
              <div className="absolute top-[38%] left-[57%]" style={{ background: '#BAAB48', borderRadius: 8, padding: '8px 12px' }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#1a1a1a] animate-pulse" />
                  <div className="text-xs text-[#1a1a1a]" style={{ fontWeight: 700 }}>New York, USA</div>
                </div>
                <div className="text-[10px] text-[#1a1a1a]/90 mt-0.5" style={{ fontWeight: 600 }}>Current — Customs Clearance</div>
              </div>
              <div className="absolute top-[43%] left-[68%]" style={{ background: tc.isDark ? 'rgba(36,36,36,0.95)' : 'rgba(245,245,245,0.95)', borderColor: tc.isDark ? '#555' : '#ccc', border: '1px solid', borderRadius: 8, padding: '6px 10px' }}>
                <div className={`text-xs ${tc.isDark ? 'text-[#999]' : 'text-[#666]'}`} style={{ fontWeight: 600 }}>Manhattan Vault</div>
                <div className={`text-[10px] ${tc.isDark ? 'text-[#666]' : 'text-[#aaa]'}`}>Pending</div>
              </div>

              {/* Stats overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-3">
                {[
                  { label: 'Distance Covered', value: '5,842 km', highlight: true },
                  { label: 'Remaining', value: '28 km', highlight: false },
                  { label: 'Transit Time', value: '48 hours', highlight: false },
                ].map(stat => (
                  <div key={stat.label} className="flex-1 rounded-lg px-3 py-2.5" style={{ background: tc.isDark ? 'rgba(36,36,36,0.95)' : 'rgba(255,255,255,0.95)', border: `1px solid ${tc.isDark ? '#333' : '#e5e5e5'}` }}>
                    <div className={`text-[10px] ${tc.subtext} mb-0.5`}>{stat.label}</div>
                    <div className="text-sm" style={{ fontWeight: 700, color: stat.highlight ? '#BAAB48' : tc.isDark ? '#e5e5e5' : '#1a1a1a' }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bento info cards */}
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
                  <card.icon className="w-3.5 h-3.5 text-[#BAAB48]" />
                  <span className={`text-xs ${tc.subtext}`}>{card.label}</span>
                </div>
                <div className={`text-sm ${card.valueClass || ''}`} style={{ fontWeight: 600 }}>{card.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className={`${tc.cardBg} border ${tc.border} rounded-lg p-4 md:p-5`}>
          <div className="mb-4">
            <h2 style={{ fontSize: '15px', fontWeight: 600 }} className="mb-2">Shipment Timeline</h2>
            <div className={`${tc.isDark ? 'bg-[#1a1a1a]' : 'bg-[#f0f0f0]'} rounded-full h-1.5 overflow-hidden`}>
              <div className="bg-[#BAAB48] h-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
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
                    <div className={`absolute left-[11px] top-8 w-0.5 h-[calc(100%+12px)] ${milestone.status === 'completed' ? 'bg-[#BAAB48]' : tc.isDark ? 'bg-[#333]' : 'bg-[#e5e5e5]'}`} />
                  )}
                  <button
                    onClick={() => milestone.status !== 'pending' && setSelectedMilestone(milestone)}
                    className={`w-full text-left p-2.5 rounded-lg transition-all ${milestone.status !== 'pending' ? `${tc.hoverBg} cursor-pointer` : 'cursor-default'}`}
                  >
                    <div className="flex gap-2.5">
                      <div className={`relative flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        milestone.status === 'completed' ? 'bg-[#BAAB48]' :
                        milestone.status === 'current' ? 'bg-[#BAAB48] animate-pulse' :
                        tc.isDark ? 'bg-[#333]' : 'bg-[#e0e0e0]'
                      }`}>
                        <Icon className={`w-3 h-3 ${milestone.status === 'pending' ? tc.isDark ? 'text-[#666]' : 'text-[#bbb]' : 'text-[#1a1a1a]'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5 mb-0.5">
                          <div className="text-sm" style={{ fontWeight: 500 }}>{milestone.description}</div>
                          {milestone.status === 'current' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#BAAB48]/20 text-[#BAAB48] border border-[#BAAB48]/30 whitespace-nowrap">
                              Current
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${tc.subtext}`}>{milestone.date} · {milestone.time}</div>
                        <div className={`text-xs ${tc.subtext} truncate`}>{milestone.location}</div>
                        {milestone.documents !== undefined && milestone.documents > 0 && (
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] flex-wrap">
                            {milestone.duties && <span className="text-[#BAAB48]">Duties: {milestone.duties}</span>}
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
