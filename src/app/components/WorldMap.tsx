import { useState, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  useMapContext,
} from 'react-simple-maps';
import { Plane, Ship, Truck, MapPin, Clock, Navigation, X, Pencil, Check } from 'lucide-react';
import { useTC } from '../contexts/ThemeContext';

type StatusFilter = 'All' | 'In Transit' | 'Delivered' | 'Pending Authorization' | 'Delayed' | 'High Priority';
type TransportMode = 'air' | 'sea' | 'road';

interface ShipmentRoute {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: Exclude<StatusFilter, 'All'>;
  eta: string;
  client: string;
  fromCoords: [number, number];
  toCoords: [number, number];
  transportMode: TransportMode;
  lastGpsDate: string;
  lastGpsTime: string;
}

const GOLD = '#BAAB48';
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const routes: ShipmentRoute[] = [
  {
    id: '1', trackingNumber: 'MLCA-2026-001847', origin: 'London, UK', destination: 'New York, USA',
    status: 'In Transit', eta: '2026-06-08', client: 'Tiffany & Co.',
    fromCoords: [-0.1, 51.5], toCoords: [-74.0, 40.7],
    transportMode: 'air', lastGpsDate: '2026-06-07', lastGpsTime: '14:32 UTC',
  },
  {
    id: '2', trackingNumber: 'MLCA-2026-001846', origin: 'Dubai, UAE', destination: 'Hong Kong',
    status: 'Pending Authorization', eta: '2026-06-10', client: 'Cartier International',
    fromCoords: [55.3, 25.2], toCoords: [114.2, 22.3],
    transportMode: 'air', lastGpsDate: '2026-06-07', lastGpsTime: '09:14 UTC',
  },
  {
    id: '3', trackingNumber: 'MLCA-2026-001845', origin: 'Zurich, Switzerland', destination: 'Singapore',
    status: 'High Priority', eta: '2026-06-06', client: 'UBS AG',
    fromCoords: [8.5, 47.4], toCoords: [103.8, 1.3],
    transportMode: 'sea', lastGpsDate: '2026-06-07', lastGpsTime: '06:55 UTC',
  },
  {
    id: '4', trackingNumber: 'MLCA-2026-001844', origin: 'Paris, France', destination: 'Tokyo, Japan',
    status: 'Delivered', eta: '2026-06-03', client: 'Van Cleef & Arpels',
    fromCoords: [2.3, 48.9], toCoords: [139.7, 35.7],
    transportMode: 'air', lastGpsDate: '2026-06-03', lastGpsTime: '18:41 UTC',
  },
  {
    id: '5', trackingNumber: 'MLCA-2026-001843', origin: 'New York, USA', destination: 'Sydney, Australia',
    status: 'Delayed', eta: '2026-06-12', client: 'Royal Bank of Canada',
    fromCoords: [-74.0, 40.7], toCoords: [151.2, -33.9],
    transportMode: 'sea', lastGpsDate: '2026-06-07', lastGpsTime: '22:08 UTC',
  },
];

const cities = [
  { coords: [-0.1, 51.5] as [number, number], label: 'London' },
  { coords: [-74.0, 40.7] as [number, number], label: 'New York' },
  { coords: [55.3, 25.2] as [number, number], label: 'Dubai' },
  { coords: [114.2, 22.3] as [number, number], label: 'Hong Kong' },
  { coords: [8.5, 47.4] as [number, number], label: 'Zurich' },
  { coords: [103.8, 1.3] as [number, number], label: 'Singapore' },
  { coords: [2.3, 48.9] as [number, number], label: 'Paris' },
  { coords: [139.7, 35.7] as [number, number], label: 'Tokyo' },
  { coords: [151.2, -33.9] as [number, number], label: 'Sydney' },
];

const STATUS_FILTERS: StatusFilter[] = ['All', 'In Transit', 'Delivered', 'Pending Authorization', 'Delayed', 'High Priority'];

const STATUS_COLOR: Record<string, string> = {
  'In Transit': '#3b82f6',
  'Delivered': '#22c55e',
  'Pending Authorization': '#f97316',
  'Delayed': '#ef4444',
  'High Priority': GOLD,
};

function getStatusColor(status: string) {
  return STATUS_COLOR[status] || GOLD;
}

function TransportIcon({ mode, size = 14, color = '#111' }: { mode: TransportMode; size?: number; color?: string }) {
  if (mode === 'air') return <Plane size={size} color={color} strokeWidth={2.2} />;
  if (mode === 'sea') return <Ship size={size} color={color} strokeWidth={2.2} />;
  return <Truck size={size} color={color} strokeWidth={2.2} />;
}

function bezierPoint(t: number, x1: number, y1: number, cpx: number, cpy: number, x2: number, y2: number) {
  const mt = 1 - t;
  return {
    x: mt * mt * x1 + 2 * mt * t * cpx + t * t * x2,
    y: mt * mt * y1 + 2 * mt * t * cpy + t * t * y2,
  };
}

function RouteLayer({
  routes,
  activeFilter,
  isDark,
  onClickRoute,
  selectedId,
}: {
  routes: ShipmentRoute[];
  activeFilter: StatusFilter;
  isDark: boolean;
  onClickRoute: (r: ShipmentRoute, e: React.MouseEvent) => void;
  selectedId: string | null;
}) {
  const { projection } = useMapContext();

  return (
    <>
      {routes.map(route => {
        const isVisible = activeFilter === 'All' || route.status === activeFilter;
        const isDelivered = route.status === 'Delivered';
        const isDelayed = route.status === 'Delayed';

        const p1 = projection(route.fromCoords);
        const p2 = projection(route.toCoords);
        if (!p1 || !p2) return null;

        const [x1, y1] = p1;
        const [x2, y2] = p2;

        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);

        // Arc control point
        const cpx = mx - dy * 0.15;
        const cpy = my + dx * 0.15 - len * 0.12;
        const d = `M ${x1},${y1} Q ${cpx},${cpy} ${x2},${y2}`;

        // Icon at midpoint (t=0.5)
        const mid = bezierPoint(0.5, x1, y1, cpx, cpy, x2, y2);

        const routeOpacity = isVisible ? 1 : 0.06;

        const isSelected = selectedId === route.id;

        return (
          <g key={route.id} opacity={routeOpacity} style={{ transition: 'opacity 0.25s ease' }}>
            {/* Route line — dashed */}
            <path
              d={d}
              stroke={GOLD}
              strokeWidth={isVisible ? 1.5 : 1}
              fill="none"
              strokeDasharray="6 5"
              strokeOpacity={isDelivered ? 0.35 : isDelayed ? 0.6 : 0.75}
              strokeLinecap="round"
            />

            {/* Hit area on line */}
            {isVisible && (
              <path
                d={d}
                stroke="transparent"
                strokeWidth="20"
                fill="none"
                style={{ cursor: 'pointer' }}
                onClick={e => onClickRoute(route, e)}
              />
            )}

            {/* Transport icon badge ON the route */}
            {isVisible && (
              <g
                transform={`translate(${mid.x}, ${mid.y})`}
                style={{ cursor: 'pointer' }}
                onClick={e => onClickRoute(route, e)}
              >
                {/* Selected ring */}
                {isSelected && (
                  <circle r="22" fill="none" stroke={GOLD} strokeWidth="2" opacity="0.5" />
                )}
                {/* Outer pulse ring for active routes */}
                {!isDelivered && (
                  <circle r="20" fill={GOLD} opacity="0.08" />
                )}
                {/* Badge shadow */}
                <circle r="15" fill="rgba(0,0,0,0.35)" transform="translate(1,1.5)" />
                {/* Badge fill */}
                <circle
                  r="15"
                  fill={isSelected ? (isDark ? '#1e2a1a' : '#fffbea') : (isDark ? '#161b22' : '#ffffff')}
                  stroke={isSelected ? GOLD : isDelayed ? '#ef4444' : GOLD}
                  strokeWidth={isSelected ? 2.5 : 1.8}
                />
                {/* Status dot — top-right of badge */}
                <circle
                  cx="10"
                  cy="-10"
                  r="4.5"
                  fill={getStatusColor(route.status)}
                  stroke={isDark ? '#161b22' : '#ffffff'}
                  strokeWidth="1.2"
                />
                {/* Icon via foreignObject */}
                <foreignObject x="-11" y="-11" width="22" height="22" style={{ overflow: 'visible', pointerEvents: 'none' }}>
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TransportIcon
                      mode={route.transportMode}
                      size={14}
                      color={isDark ? '#d0c070' : '#8a7a20'}
                    />
                  </div>
                </foreignObject>
              </g>
            )}
          </g>
        );
      })}
    </>
  );
}

function inputStyle(isDark: boolean): React.CSSProperties {
  return {
    background: isDark ? '#111a28' : '#f5f8fc',
    border: `1px solid ${isDark ? '#2a3e54' : '#c8d8e8'}`,
    color: isDark ? '#c0cdd8' : '#1a2a38',
    borderRadius: '5px',
    padding: '2px 6px',
    fontSize: '10.5px',
    outline: 'none',
    width: '100px',
    fontWeight: 500,
  };
}

const MIN_ZOOM = 100;
const MAX_ZOOM = 600;
const ZOOM_STEP = 50;

interface EditDraft {
  lastGpsDate: string;
  lastGpsTime: string;
  origin: string;
  destination: string;
  eta: string;
  status: string;
}

export function WorldMap() {
  const tc = useTC();
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
  const [selected, setSelected] = useState<ShipmentRoute | null>(null);
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Partial<EditDraft>>>({});
  const [zoom, setZoom] = useState(175);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = () => setZoom(z => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  const zoomOut = () => setZoom(z => Math.max(z - ZOOM_STEP, MIN_ZOOM));

  const handleIconClick = (route: ShipmentRoute, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setCardPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setSelected(route);
    setIsEditing(false);
    setDraft(null);
  };

  const closeCard = () => { setSelected(null); setIsEditing(false); setDraft(null); };

  const startEdit = () => {
    if (!selected) return;
    const ov = overrides[selected.id] || {};
    setDraft({
      lastGpsDate: ov.lastGpsDate ?? selected.lastGpsDate,
      lastGpsTime: ov.lastGpsTime ?? selected.lastGpsTime,
      origin: ov.origin ?? selected.origin,
      destination: ov.destination ?? selected.destination,
      eta: ov.eta ?? selected.eta,
      status: ov.status ?? selected.status,
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!selected || !draft) return;
    setOverrides(prev => ({ ...prev, [selected.id]: draft }));
    setIsEditing(false);
    setDraft(null);
  };

  const getField = (route: ShipmentRoute, field: keyof EditDraft): string => {
    return (overrides[route.id]?.[field] as string) ?? (route[field as keyof ShipmentRoute] as string);
  };

  // Map colors — closer to real logistics platform (dark tile style)
  const oceanBg = tc.isDark ? '#0b1320' : '#c8dff0';
  const landFill = tc.isDark ? '#1c2333' : '#d6dce6';
  const landHover = tc.isDark ? '#232d40' : '#cdd5e0';
  const landStroke = tc.isDark ? '#283548' : '#b8c5d4';
  const graticuleColor = tc.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';

  const cardLeft = Math.min(cardPos.x + 18, (containerRef.current?.offsetWidth ?? 400) - 260);
  const cardTop = Math.max(cardPos.y - 180, 48);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden border ${tc.border}`}
      style={{ height: '520px', background: oceanBg }}
      onClick={() => { if (selected) closeCard(); }}
    >
      {/* Status filter chips */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5" style={{ maxWidth: 'calc(100% - 130px)' }}>
        {STATUS_FILTERS.map(f => {
          const count = f === 'All' ? routes.length : routes.filter(r => r.status === f).length;
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '3px 10px',
                fontSize: '10px',
                fontWeight: isActive ? 600 : 400,
                backdropFilter: 'blur(10px)',
                background: isActive
                  ? 'rgba(186,171,72,0.18)'
                  : tc.isDark ? 'rgba(11,19,32,0.88)' : 'rgba(255,255,255,0.9)',
                border: `1px solid ${isActive ? GOLD : tc.isDark ? '#283548' : '#b8c8d8'}`,
                color: isActive ? GOLD : tc.isDark ? '#5a7090' : '#4a6070',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {f === 'All' ? 'All Routes' : f}
              {f !== 'All' && count > 0 && (
                <span style={{ marginLeft: '5px', opacity: 0.6, fontSize: '9px' }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Live badge */}
      <div
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-full px-2.5 py-1"
        style={{
          background: tc.isDark ? 'rgba(11,19,32,0.9)' : 'rgba(255,255,255,0.92)',
          border: `1px solid ${tc.isDark ? '#283548' : '#b8c8d8'}`,
          backdropFilter: 'blur(10px)',
          fontSize: '10px',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span style={{ color: tc.isDark ? '#5a7090' : '#4a6070' }}>Live Tracking</span>
      </div>

      {/* Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: zoom, center: [15, 15] }}
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
          </filter>
        </defs>

        {/* Subtle grid lines */}
        {[-60, -30, 0, 30, 60].map(lat => {
          // Simplified: just a faint horizontal line suggestion
          return null;
        })}

        {/* Countries */}
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

        {/* Routes + transport icons */}
        <RouteLayer
          routes={routes}
          activeFilter={activeFilter}
          isDark={tc.isDark}
          onClickRoute={handleIconClick}
          selectedId={selected?.id ?? null}
        />

        {/* City markers */}
        {cities.map(city => (
          <Marker key={city.label} coordinates={city.coords}>
            <circle r="5" fill="none" stroke={GOLD} strokeWidth="1.2" opacity="0.4" />
            <circle r="2.5" fill={GOLD} opacity="0.85" />
            <circle r="1" fill="#fff" opacity="0.9" />
          </Marker>
        ))}

        {/* City labels */}
        {cities.map(city => {
          const isRight = city.coords[0] > 20;
          return (
            <Marker key={`lbl-${city.label}`} coordinates={city.coords}>
              <text
                textAnchor={isRight ? 'start' : 'end'}
                x={isRight ? 9 : -9}
                y={-7}
                style={{
                  fontSize: '6px',
                  fill: tc.isDark ? 'rgba(186,171,72,0.55)' : 'rgba(100,80,10,0.75)',
                  fontFamily: 'system-ui, sans-serif',
                  letterSpacing: '0.03em',
                  pointerEvents: 'none',
                }}
              >
                {city.label}
              </text>
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Bottom legend */}
      <div
        className="absolute bottom-3 left-3 z-20 flex items-center gap-4 rounded-lg px-3 py-2"
        style={{
          background: tc.isDark ? 'rgba(11,19,32,0.9)' : 'rgba(255,255,255,0.92)',
          border: `1px solid ${tc.isDark ? '#283548' : '#b8c8d8'}`,
          backdropFilter: 'blur(10px)',
          fontSize: '10px',
        }}
      >
        {(['air', 'sea'] as TransportMode[]).map(mode => (
          <div key={mode} className="flex items-center gap-1.5">
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{ width: '20px', height: '20px', background: tc.isDark ? '#161b22' : '#f0f0f0', border: `1px solid ${GOLD}` }}
            >
              <TransportIcon mode={mode} size={11} color={tc.isDark ? '#d0c070' : '#8a7a20'} />
            </div>
            <span style={{ color: tc.isDark ? '#5a7090' : '#4a6070' }}>
              {mode === 'air' ? 'Air Freight' : 'Sea Freight'}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-6 flex items-center gap-0.5">
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '5px', height: '1.5px', background: GOLD, opacity: 0.7, borderRadius: '1px' }} />
            ))}
          </div>
          <span style={{ color: tc.isDark ? '#5a7090' : '#4a6070' }}>Route</span>
        </div>
      </div>

      {/* Zoom controls */}
      <div
        className="absolute right-3 z-20 flex flex-col rounded-lg overflow-hidden"
        style={{
          bottom: '48px',
          background: tc.isDark ? 'rgba(11,19,32,0.9)' : 'rgba(255,255,255,0.92)',
          border: `1px solid ${tc.isDark ? '#283548' : '#b8c8d8'}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <button
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 300,
            color: zoom >= MAX_ZOOM
              ? (tc.isDark ? '#2a3a4a' : '#c0ccd8')
              : (tc.isDark ? '#8aa0b8' : '#4a6070'),
            background: 'transparent',
            border: 'none',
            cursor: zoom >= MAX_ZOOM ? 'default' : 'pointer',
            lineHeight: 1,
            borderBottom: `1px solid ${tc.isDark ? '#283548' : '#b8c8d8'}`,
            transition: 'color 0.15s',
          }}
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 300,
            color: zoom <= MIN_ZOOM
              ? (tc.isDark ? '#2a3a4a' : '#c0ccd8')
              : (tc.isDark ? '#8aa0b8' : '#4a6070'),
            background: 'transparent',
            border: 'none',
            cursor: zoom <= MIN_ZOOM ? 'default' : 'pointer',
            lineHeight: 1,
            transition: 'color 0.15s',
          }}
          title="Zoom out"
        >
          −
        </button>
      </div>

      {/* Route count */}
      <div
        className="absolute bottom-3 right-3 z-20 rounded-lg px-2.5 py-1.5"
        style={{
          background: tc.isDark ? 'rgba(11,19,32,0.9)' : 'rgba(255,255,255,0.92)',
          border: `1px solid ${tc.isDark ? '#283548' : '#b8c8d8'}`,
          backdropFilter: 'blur(10px)',
          fontSize: '10px',
          color: tc.isDark ? '#5a7090' : '#4a6070',
        }}
      >
        <span style={{ color: GOLD, fontWeight: 600 }}>{routes.filter(r => activeFilter === 'All' || r.status === activeFilter).length}</span>
        {' '}active route{routes.filter(r => activeFilter === 'All' || r.status === activeFilter).length !== 1 ? 's' : ''}
      </div>

      {/* Shipment detail card — click-triggered, editable */}
      {selected && (
        <div
          className="absolute z-30 rounded-xl shadow-2xl overflow-hidden"
          style={{
            left: Math.min(cardLeft, (containerRef.current?.offsetWidth ?? 400) - 260),
            top: Math.min(cardTop, (containerRef.current?.offsetHeight ?? 400) - 420),
            width: '252px',
            background: tc.isDark ? '#0d1525' : '#ffffff',
            border: `1.5px solid ${tc.isDark ? '#283548' : '#d8e2ec'}`,
            borderTop: `2px solid ${GOLD}`,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-3 py-2.5 flex items-center gap-2.5"
            style={{ background: tc.isDark ? 'rgba(186,171,72,0.07)' : 'rgba(186,171,72,0.06)', borderBottom: `1px solid ${tc.isDark ? '#1a2535' : '#eef2f6'}` }}
          >
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ width: '30px', height: '30px', background: tc.isDark ? '#161b22' : '#f5f2e0', border: `1px solid ${GOLD}` }}
            >
              <TransportIcon mode={selected.transportMode} size={15} color={tc.isDark ? '#d0c070' : '#8a7a20'} />
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ color: GOLD, fontWeight: 700, fontSize: '10.5px', letterSpacing: '0.04em' }}>
                {selected.trackingNumber}
              </div>
              <div style={{ color: tc.isDark ? '#6a8090' : '#6a7a88', fontSize: '9.5px', marginTop: '1px' }}>
                {selected.client}
              </div>
            </div>
            {/* Edit / Save button */}
            <button
              onClick={isEditing ? saveEdit : startEdit}
              title={isEditing ? 'Save changes' : 'Edit shipment'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '26px', height: '26px', borderRadius: '6px',
                background: isEditing ? `${GOLD}22` : (tc.isDark ? '#1a2535' : '#f0f4f8'),
                border: `1px solid ${isEditing ? GOLD : (tc.isDark ? '#283548' : '#d0dae6')}`,
                color: isEditing ? GOLD : (tc.isDark ? '#6a8090' : '#4a6070'),
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              {isEditing ? <Check size={13} /> : <Pencil size={12} />}
            </button>
            {/* Close button */}
            <button
              onClick={closeCard}
              title="Close"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '26px', height: '26px', borderRadius: '6px',
                background: tc.isDark ? '#1a2535' : '#f0f4f8',
                border: `1px solid ${tc.isDark ? '#283548' : '#d0dae6'}`,
                color: tc.isDark ? '#6a8090' : '#4a6070',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Body */}
          <div className="px-3 py-3" style={{ fontSize: '11px' }}>

            {/* Status */}
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: tc.isDark ? '#4a6070' : '#6a7a88' }}>Status</span>
              {isEditing ? (
                <select
                  value={draft!.status}
                  onChange={e => setDraft(d => d ? { ...d, status: e.target.value } : d)}
                  style={{
                    background: tc.isDark ? '#111a28' : '#f5f8fc',
                    border: `1px solid ${GOLD}`,
                    color: tc.isDark ? '#c0cdd8' : '#1a2a38',
                    borderRadius: '5px', padding: '2px 5px', fontSize: '10px', outline: 'none',
                  }}
                >
                  {['In Transit', 'Delivered', 'Pending Authorization', 'Delayed', 'High Priority'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    background: `${getStatusColor(getField(selected, 'status'))}18`,
                    border: `1px solid ${getStatusColor(getField(selected, 'status'))}40`,
                    color: getStatusColor(getField(selected, 'status')),
                    fontSize: '9px', fontWeight: 600,
                  }}
                >
                  {getField(selected, 'status')}
                </span>
              )}
            </div>

            {/* GPS Date */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1" style={{ color: tc.isDark ? '#4a6070' : '#6a7a88' }}>
                <Clock size={9} /> Last GPS Date
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={draft!.lastGpsDate}
                  onChange={e => setDraft(d => d ? { ...d, lastGpsDate: e.target.value } : d)}
                  style={inputStyle(tc.isDark)}
                />
              ) : (
                <span style={{ color: tc.isDark ? '#c0cdd8' : '#1a2a38', fontWeight: 500 }}>{getField(selected, 'lastGpsDate')}</span>
              )}
            </div>

            {/* GPS Time */}
            <div className="flex items-center justify-between mb-2.5">
              <span style={{ color: tc.isDark ? '#4a6070' : '#6a7a88', paddingLeft: '13px' }}>Time</span>
              {isEditing ? (
                <input
                  type="text"
                  value={draft!.lastGpsTime}
                  onChange={e => setDraft(d => d ? { ...d, lastGpsTime: e.target.value } : d)}
                  style={inputStyle(tc.isDark)}
                />
              ) : (
                <span style={{ color: tc.isDark ? '#c0cdd8' : '#1a2a38', fontWeight: 500 }}>{getField(selected, 'lastGpsTime')}</span>
              )}
            </div>

            <div style={{ height: '1px', background: tc.isDark ? '#1a2535' : '#eef2f6', marginBottom: '10px' }} />

            {/* Origin */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="flex items-center gap-1 flex-shrink-0" style={{ color: tc.isDark ? '#4a6070' : '#6a7a88' }}>
                <MapPin size={9} /> Origin
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={draft!.origin}
                  onChange={e => setDraft(d => d ? { ...d, origin: e.target.value } : d)}
                  style={{ ...inputStyle(tc.isDark), textAlign: 'right', maxWidth: '130px' }}
                />
              ) : (
                <span style={{ color: tc.isDark ? '#c0cdd8' : '#1a2a38', fontWeight: 500, textAlign: 'right' }}>{getField(selected, 'origin')}</span>
              )}
            </div>

            {/* Destination */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="flex items-center gap-1 flex-shrink-0" style={{ color: tc.isDark ? '#4a6070' : '#6a7a88' }}>
                <Navigation size={9} /> Destination
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={draft!.destination}
                  onChange={e => setDraft(d => d ? { ...d, destination: e.target.value } : d)}
                  style={{ ...inputStyle(tc.isDark), textAlign: 'right', maxWidth: '130px' }}
                />
              ) : (
                <span style={{ color: tc.isDark ? '#c0cdd8' : '#1a2a38', fontWeight: 500, textAlign: 'right' }}>{getField(selected, 'destination')}</span>
              )}
            </div>

            {/* ETA */}
            <div
              className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: tc.isDark ? '#111a28' : '#f8f6ee', border: `1px solid ${tc.isDark ? '#1f2d40' : '#e8e0c0'}` }}
            >
              <span style={{ color: tc.isDark ? '#4a6070' : '#6a7a88' }}>Estimated Arrival</span>
              {isEditing ? (
                <input
                  type="text"
                  value={draft!.eta}
                  onChange={e => setDraft(d => d ? { ...d, eta: e.target.value } : d)}
                  style={{ ...inputStyle(tc.isDark), color: GOLD, fontWeight: 700, maxWidth: '90px' }}
                />
              ) : (
                <span style={{ color: GOLD, fontWeight: 700 }}>{getField(selected, 'eta')}</span>
              )}
            </div>

            {isEditing && (
              <button
                onClick={saveEdit}
                style={{
                  marginTop: '10px', width: '100%', padding: '7px',
                  background: GOLD, color: '#1a1a1a', borderRadius: '7px',
                  border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '11px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                }}
              >
                <Check size={12} /> Save Changes
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
