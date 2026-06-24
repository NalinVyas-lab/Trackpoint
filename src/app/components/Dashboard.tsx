import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Search, TrendingUp, Package, Clock, CheckCircle, DollarSign,
  Globe, Plane, Ship, Truck, Pencil, Check, X,
} from 'lucide-react';
import { useTC } from '../contexts/ThemeContext';
import { NavBar } from './NavBar';
import { WorldMap } from './WorldMap';

type TransportMode = 'air' | 'sea' | 'road';
type ShipmentStatus = 'In Transit' | 'Delivered' | 'Pending Authorization' | 'Active';

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  value: string;
  status: ShipmentStatus;
  eta: string;
  client: string;
  currentLocation: string;
  transportMode: TransportMode;
  lastRecordTime: string;
  latitude: string;
  longitude: string;
}

const initialShipments: Shipment[] = [
  {
    id: '1', trackingNumber: 'MLCA-2026-001847', origin: 'London, UK', destination: 'New York, USA',
    value: '$2,450,000', status: 'In Transit', eta: '2026-06-08', client: 'Tiffany & Co.',
    currentLocation: 'Mid-Atlantic Ocean', transportMode: 'air', lastRecordTime: '2026-06-07 14:32 UTC',
    latitude: '45.2300', longitude: '-35.7800',
  },
  {
    id: '2', trackingNumber: 'MLCA-2026-001846', origin: 'Dubai, UAE', destination: 'Hong Kong',
    value: '$1,850,000', status: 'Pending Authorization', eta: '2026-06-10', client: 'Cartier International',
    currentLocation: 'Dubai, UAE', transportMode: 'air', lastRecordTime: '2026-06-07 09:14 UTC',
    latitude: '25.2048', longitude: '55.2708',
  },
  {
    id: '3', trackingNumber: 'MLCA-2026-001845', origin: 'Zurich, Switzerland', destination: 'Singapore',
    value: '$3,200,000', status: 'Active', eta: '2026-06-06', client: 'UBS AG',
    currentLocation: 'Indian Ocean', transportMode: 'sea', lastRecordTime: '2026-06-07 06:55 UTC',
    latitude: '5.1500', longitude: '72.4800',
  },
  {
    id: '4', trackingNumber: 'MLCA-2026-001844', origin: 'Paris, France', destination: 'Tokyo, Japan',
    value: '$980,000', status: 'Delivered', eta: '2026-06-03', client: 'Van Cleef & Arpels',
    currentLocation: 'Tokyo, Japan', transportMode: 'air', lastRecordTime: '2026-06-03 18:41 UTC',
    latitude: '35.6762', longitude: '139.6503',
  },
  {
    id: '5', trackingNumber: 'MLCA-2026-001843', origin: 'New York, USA', destination: 'Sydney, Australia',
    value: '$1,450,000', status: 'In Transit', eta: '2026-06-09', client: 'Royal Bank of Canada',
    currentLocation: 'Pacific Ocean', transportMode: 'sea', lastRecordTime: '2026-06-07 22:08 UTC',
    latitude: '-15.4200', longitude: '-162.3100',
  },
];

const TRANSPORT_LABEL: Record<TransportMode, string> = { air: 'Air Freight', sea: 'Sea Freight', road: 'Road' };

function ModeIcon({ mode, size = 14 }: { mode: TransportMode; size?: number }) {
  if (mode === 'air') return <Plane size={size} />;
  if (mode === 'sea') return <Ship size={size} />;
  return <Truck size={size} />;
}

interface EditModalProps {
  shipment: Shipment;
  isDark: boolean;
  tc: ReturnType<typeof useTC>;
  onSave: (updated: Shipment) => void;
  onClose: () => void;
}

function EditModal({ shipment, isDark, tc, onSave, onClose }: EditModalProps) {
  const [draft, setDraft] = useState<Shipment>({ ...shipment });

  const field = (label: string, key: keyof Shipment, type: 'text' | 'select' = 'text', options?: string[]) => (
    <div className="mb-3">
      <label style={{ display: 'block', fontSize: '10px', color: isDark ? '#5a7090' : '#6a7a88', marginBottom: '4px', fontWeight: 500 }}>
        {label}
      </label>
      {type === 'select' ? (
        <select
          value={draft[key] as string}
          onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
          style={inputStyle(isDark)}
        >
          {options!.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type="text"
          value={draft[key] as string}
          onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
          style={inputStyle(isDark)}
        />
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl overflow-hidden"
        style={{
          width: '420px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: isDark ? '#0d1525' : '#ffffff',
          border: `1.5px solid ${isDark ? '#283548' : '#d8e2ec'}`,
          borderTop: `2px solid ${tc.accent}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ background: isDark ? 'rgba(186,171,72,0.07)' : 'rgba(186,171,72,0.05)', borderBottom: `1px solid ${isDark ? '#1a2535' : '#eef2f6'}` }}
        >
          <div>
            <div style={{ color: tc.accent, fontWeight: 700, fontSize: '12px', letterSpacing: '0.04em' }}>
              {shipment.trackingNumber}
            </div>
            <div style={{ color: isDark ? '#6a8090' : '#6a7a88', fontSize: '11px', marginTop: '1px' }}>
              Edit Shipment Details
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-auto"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', borderRadius: '7px',
              background: isDark ? '#1a2535' : '#f0f4f8',
              border: `1px solid ${isDark ? '#283548' : '#d0dae6'}`,
              color: isDark ? '#6a8090' : '#4a6070',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-x-3">
            <div>{field('Tracking Number', 'trackingNumber')}</div>
            <div>{field('Client', 'client')}</div>
          </div>
          {field('Origin', 'origin')}
          {field('Destination', 'destination')}
          <div className="grid grid-cols-2 gap-x-3">
            <div>{field('Value', 'value')}</div>
            <div>{field('ETA', 'eta')}</div>
          </div>
          {field('Status', 'status', 'select', ['In Transit', 'Delivered', 'Pending Authorization', 'Active'])}
          {field('Current Location', 'currentLocation')}
          {field('Transport Mode', 'transportMode', 'select', ['air', 'sea', 'road'])}
          {field('Last Record Time', 'lastRecordTime')}
          <div className="grid grid-cols-2 gap-x-3">
            <div>{field('Latitude', 'latitude')}</div>
            <div>{field('Longitude', 'longitude')}</div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '9px',
                background: isDark ? '#1a2535' : '#f0f4f8',
                border: `1px solid ${isDark ? '#283548' : '#d0dae6'}`,
                color: isDark ? '#8a9aaa' : '#4a6070',
                borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(draft)}
              style={{
                flex: 2, padding: '9px',
                background: tc.accent, color: isDark ? '#0B2B26' : '#DAF1DE',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 600, fontSize: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <Check size={13} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function inputStyle(isDark: boolean): React.CSSProperties {
  return {
    width: '100%',
    background: isDark ? '#111a28' : '#f5f8fc',
    border: `1px solid ${isDark ? '#2a3e54' : '#c8d8e8'}`,
    color: isDark ? '#c0cdd8' : '#1a2a38',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '12px',
    outline: 'none',
  };
}

export function Dashboard() {
  const navigate = useNavigate();
  const tc = useTC();
  const [searchTerm, setSearchTerm] = useState('');
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) navigate(`/tracking/${searchTerm}`);
  };

  const handleSave = (updated: Shipment) => {
    setShipments(prev => prev.map(s => s.id === updated.id ? updated : s));
    setEditingId(null);
  };

  const editingShipment = editingId ? shipments.find(s => s.id === editingId) ?? null : null;

  const kpiData = [
    { label: 'Active', value: '127', icon: Package, trend: '+12%', color: 'text-blue-400' },
    { label: 'In Transit', value: '84', icon: TrendingUp, trend: '+8%', color: '' },
    { label: 'Pending Auth', value: '23', icon: Clock, trend: '-5%', color: 'text-orange-400' },
    { label: 'Delivered', value: '456', icon: CheckCircle, trend: '+18%', color: 'text-green-400' },
    { label: 'Outstanding', value: '$12.4M', icon: DollarSign, trend: '+3%', color: 'text-red-400' },
  ];

  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Pending Authorization': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Active': return '';
    }
  };

  const getModeColor = (mode: TransportMode) => {
    if (mode === 'air') return { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' };
    if (mode === 'sea') return { bg: 'rgba(14,165,233,0.12)', color: '#38bdf8' };
    return { bg: 'rgba(234,179,8,0.12)', color: '#facc15' };
  };

  const headers = ['Tracking Number', 'Client', 'Route', 'Value', 'Status', 'Current Location', 'Transport Mode', 'Last Record', 'ETA', 'Edit'];

  return (
    <div className={`min-h-screen ${tc.pageBg} ${tc.text}`}>
      <NavBar />

      {editingShipment && (
        <EditModal
          shipment={editingShipment}
          isDark={tc.isDark}
          tc={tc}
          onSave={handleSave}
          onClose={() => setEditingId(null)}
        />
      )}

      <div className="p-4 md:p-8">
        {/* Page title + search */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="mb-0.5" style={{ fontSize: '22px', fontWeight: 600 }}>Operations Dashboard</h1>
            <p className={`text-sm ${tc.subtext}`}>Secure Logistics & Asset Management</p>
          </div>
          <form onSubmit={handleSearch} className="relative w-full sm:w-72 md:w-96">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${tc.isDark ? 'text-[#666]' : 'text-[#aaa]'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search tracking number..."
              className={`w-full border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none ${tc.inputBg}`}
            />
          </form>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {kpiData.map(kpi => (
            <div key={kpi.label} className={`${tc.cardBg} border ${tc.border} rounded-lg p-4`}>
              <div className="flex items-start justify-between mb-2">
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${kpi.trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {kpi.trend}
                </span>
              </div>
              <div className="mb-0.5" style={{ fontSize: '20px', fontWeight: 700 }}>{kpi.value}</div>
              <div className={`text-xs ${tc.subtext}`}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* World Map */}
        <div className={`${tc.cardBg} border ${tc.border} rounded-lg p-4 mb-6`}>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4" style={{ color: tc.accent }} />
            <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Global Shipment Tracker</h2>
            <span className={`ml-auto text-xs ${tc.subtext}`}>5 routes · filter by status</span>
          </div>
          <WorldMap />
        </div>

        {/* Recent Shipments */}
        <div className={`${tc.cardBg} border ${tc.border} rounded-lg overflow-hidden`}>
          <div className={`p-4 md:p-5 border-b ${tc.border} flex items-center justify-between`}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Shipments</h2>
            <span className={`text-xs ${tc.subtext}`}>{shipments.length} records</span>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full" style={{ minWidth: '1100px' }}>
              <thead>
                <tr className={`border-b ${tc.border} ${tc.tableHeaderBg}`}>
                  {headers.map(h => (
                    <th key={h} className={`px-4 py-3.5 text-left text-xs ${tc.subtext}`} style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shipments.map(s => {
                  const modeColor = getModeColor(s.transportMode);
                  return (
                    <tr key={s.id} className={`border-b ${tc.border} ${tc.hoverBg} transition-colors`}>
                      {/* Tracking Number */}
                      <td className="px-4 py-3.5">
                        <code className="text-sm" style={{ color: tc.accent }}>{s.trackingNumber}</code>
                      </td>
                      {/* Client */}
                      <td className="px-4 py-3.5 text-sm" style={{ whiteSpace: 'nowrap' }}>{s.client}</td>
                      {/* Route */}
                      <td className="px-4 py-3.5">
                        <div className="text-sm" style={{ whiteSpace: 'nowrap' }}>
                          <div>{s.origin}</div>
                          <div className={tc.subtext}>→ {s.destination}</div>
                        </div>
                      </td>
                      {/* Value */}
                      <td className="px-4 py-3.5 text-sm" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{s.value}</td>
                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs border whitespace-nowrap ${getStatusColor(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      {/* Current Location */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm" style={{ whiteSpace: 'nowrap' }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                          {s.currentLocation}
                        </div>
                      </td>
                      {/* Transport Mode */}
                      <td className="px-4 py-3.5">
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                          style={{ background: modeColor.bg, color: modeColor.color, whiteSpace: 'nowrap' }}
                        >
                          <ModeIcon mode={s.transportMode} size={11} />
                          {TRANSPORT_LABEL[s.transportMode]}
                        </div>
                      </td>
                      {/* Last Record Time */}
                      <td className={`px-4 py-3.5 text-xs ${tc.subtext}`} style={{ whiteSpace: 'nowrap' }}>
                        {s.lastRecordTime}
                      </td>
                      {/* ETA */}
                      <td className={`px-4 py-3.5 text-sm ${tc.subtext}`} style={{ whiteSpace: 'nowrap' }}>{s.eta}</td>
                      {/* Edit */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setEditingId(s.id)}
                          className="flex items-center gap-1.5 text-xs transition-colors"
                          style={{
                            padding: '5px 10px', borderRadius: '6px',
                            background: tc.isDark ? '#1a2535' : '#f0f4f8',
                            border: `1px solid ${tc.isDark ? '#283548' : '#d0dae6'}`,
                            color: tc.isDark ? '#8aa0b8' : '#4a6070',
                            cursor: 'pointer', whiteSpace: 'nowrap',
                          }}
                        >
                          <Pencil size={11} /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className={`md:hidden divide-y ${tc.divider}`}>
            {shipments.map(s => {
              const modeColor = getModeColor(s.transportMode);
              return (
                <div key={s.id} className="p-4">
                  <div className="flex items-start justify-between mb-2.5">
                    <div>
                      <code className="text-sm" style={{ color: tc.accent }}>{s.trackingNumber}</code>
                      <div className="text-sm mt-0.5" style={{ fontWeight: 500 }}>{s.client}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] border flex-shrink-0 ${getStatusColor(s.status)}`}>
                        {s.status}
                      </span>
                      <button
                        onClick={() => setEditingId(s.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '26px', height: '26px', borderRadius: '6px',
                          background: tc.isDark ? '#1a2535' : '#f0f4f8',
                          border: `1px solid ${tc.isDark ? '#283548' : '#d0dae6'}`,
                          color: tc.isDark ? '#8aa0b8' : '#4a6070',
                          cursor: 'pointer',
                        }}
                      >
                        <Pencil size={11} />
                      </button>
                    </div>
                  </div>
                  <div className={`space-y-1.5 text-sm mb-3 ${tc.subtext}`}>
                    <div className="flex justify-between">
                      <span>Route:</span>
                      <span className={tc.text + ' text-right text-xs'}>{s.origin} → {s.destination}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Transport:</span>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                        style={{ background: modeColor.bg, color: modeColor.color }}
                      >
                        <ModeIcon mode={s.transportMode} size={10} />
                        {TRANSPORT_LABEL[s.transportMode]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className={tc.text + ' text-xs'}>{s.currentLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Record:</span>
                      <span className="text-xs">{s.lastRecordTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Value:</span>
                      <span className={tc.text} style={{ fontWeight: 600 }}>{s.value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ETA:</span>
                      <span className={tc.text}>{s.eta}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
