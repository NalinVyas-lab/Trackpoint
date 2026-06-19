import { useState, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  useMapContext,
} from 'react-simple-maps';
import { Plane, Ship, Truck, MapPin, Clock, Navigation } from 'lucide-react';
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
  {
    id: '6', trackingNumber: 'MLCA-2026-001841', origin: 'London, UK', destination: 'Mumbai, India',
    status: 'In Transit', eta: '2026-06-09', client: 'Graff Diamonds',
    fromCoords: [-0.1, 51.5], toCoords: [72.9, 19.1],
    transportMode: 'air', lastGpsDate: '2026-06-07', lastGpsTime: '11:20 UTC',
  },
  {
    id: '7', trackingNumber: 'MLCA-2026-001840', origin: 'Shanghai, China', destination: 'Los Angeles, USA',
    status: 'In Transit', eta: '2026-06-15', client: 'Goldman Sachs',
    fromCoords: [121.5, 31.2], toCoords: [-118.2, 34.1],
    transportMode: 'sea', lastGpsDate: '2026-06-07', lastGpsTime: '08:00 UTC',
  },
  {
    id: '8', trackingNumber: 'MLCA-2026-001839', origin: 'Frankfurt, Germany', destination: 'São Paulo, Brazil',
    status: 'High Priority', eta: '2026-06-08', client: 'Deutsche Bank',
    fromCoords: [8.7, 50.1], toCoords: [-46.6, -23.6],
    transportMode: 'air', lastGpsDate: '2026-06-07', lastGpsTime: '16:45 UTC',
  },
  {
    id: '9', trackingNumber: 'MLCA-2026-001838', origin: 'Singapore', destination: 'Sydney, Australia',
    status: 'Delivered', eta: '2026-06-05', client: 'Macquarie Group',
    fromCoords: [103.8, 1.3], toCoords: [151.2, -33.9],
    transportMode: 'sea', lastGpsDate: '2026-06-05', lastGpsTime: '10:00 UTC',
  },
  {
    id: '10', trackingNumber: 'MLCA-2026-001837', origin: 'Toronto, Canada', destination: 'London, UK',
    status: 'In Transit', eta: '2026-06-10', client: 'Scotiabank',
    fromCoords: [-79.4, 43.7], toCoords: [-0.1, 51.5],
    transportMode: 'air', lastGpsDate: '2026-06-07', lastGpsTime: '20:00 UTC',
  },
  {
    id: '11', trackingNumber: 'MLCA-2026-001836', origin: 'Mumbai, India', destination: 'Dubai, UAE',
    status: 'Pending Authorization', eta: '2026-06-12', client: 'Tata Group',
    fromCoords: [72.9, 19.1], toCoords: [55.3, 25.2],
    transportMode: 'road', lastGpsDate: '2026-06-07', lastGpsTime: '07:30 UTC',
  },
  {
    id: '12', trackingNumber: 'MLCA-2026-001835', origin: 'Tokyo, Japan', destination: 'Seoul, South Korea',
    status: 'In Transit', eta: '2026-06-08', client: 'Mitsubishi UFJ',
    fromCoords: [139.7, 35.7], toCoords: [126.9, 37.6],
    transportMode: 'air', lastGpsDate: '2026-06-07', lastGpsTime: '13:10 UTC',
  },
  {
    id: '13', trackingNumber: 'MLCA-2026-001834', origin: 'Amsterdam, Netherlands', destination: 'New York, USA',
    status: 'In Transit', eta: '2026-06-09', client: 'ING Group',
    fromCoords: [4.9, 52.4], toCoords: [-74.0, 40.7],
    transportMode: 'air', lastGpsDate: '2026-06-07', lastGpsTime: '18:55 UTC',
  },
  {
    id: '14', trackingNumber: 'MLCA-2026-001833', origin: 'Cape Town, South Africa', destination: 'London, UK',
    status: 'Delayed', eta: '2026-06-18', client: 'Anglo American',
    fromCoords: [18.4, -33.9], toCoords: [-0.1, 51.5],
    transportMode: 'sea', lastGpsDate: '2026-06-07', lastGpsTime: '04:20 UTC',
  },
  {
    id: '15', trackingNumber: 'MLCA-2026-001832', origin: 'Beijing, China', destination: 'Frankfurt, Germany',
    status: 'High Priority', eta: '2026-06-08', client: 'ICBC',
    fromCoords: [116.4, 39.9], toCoords: [8.7, 50.1],
    transportMode: 'air', lastGpsDate: '2026-06-07', lastGpsTime: '15:30 UTC',
  },
  {
    id: '16', trackingNumber: 'MLCA-2026-001831', origin: 'Houston, USA', destination: 'Mexico City, Mexico',
    status: 'In Transit', eta: '2026-06-09', client: 'ConocoPhillips',
    fromCoords: [-95.4, 29.8], toCoords: [-99.1, 19.4],
    transportMode: 'road', lastGpsDate: '2026-06-07', lastGpsTime: '12:00 UTC',
  },
  {
    id: '17', trackingNumber: 'MLCA-2026-001830', origin: 'Johannesburg, South Africa', destination: 'Dubai, UAE',
    status: 'In Transit', eta: '2026-06-10', client: 'Standard Bank',
    fromCoords: [28.0, -26.2], toCoords: [55.3, 25.2],
    transportMode: 'air', lastGpsDate: '2026-06-07', lastGpsTime: '09:45 UTC',
  },
  {
    id: '18', trackingNumber: 'MLCA-2026-001829', origin: 'Sydney, Australia', destination: 'Singapore',
    status: 'In Transit', eta: '2026-06-08', client: 'ANZ Bank',
    fromCoords: [151.2, -33.9], toCoords: [103.8, 1.3],
    transportMode: 'air', lastGpsDate: '2026-06-07', lastGpsTime: '21:15 UTC',
  },
  {
    id: '19', trackingNumber: 'MLCA-2026-001828', origin: 'London, UK', destination: 'Lagos, Nigeria',
    status: 'Pending Authorization', eta: '2026-06-11', client: 'Barclays Africa',
    fromCoords: [-0.1, 51.5], toCoords: [3.4, 6.5],
    transportMode: 'air', lastGpsDate: '2026-06-07', lastGpsTime: '10:30 UTC',
  },
  {
    id: '20', trackingNumber: 'MLCA-2026-001827', origin: 'Miami, USA', destination: 'Bogotá, Colombia',
    status: 'In Transit', eta: '2026-06-09', client: 'BTG Pactual',
    fromCoords: [-80.2, 25.8], toCoords: [-74.1, 4.7],
    transportMode: 'air', lastGpsDate: '2026-06-07', lastGpsTime: '17:20 UTC',
  },
  {
    id: '21', trackingNumber: 'MLCA-2026-001826', origin: 'Istanbul, Turkey', destination: 'Singapore',
    status: 'In Transit', eta: '2026-06-14', client: 'Koç Holding',
    fromCoords: [29.0, 41.0], toCoords: [103.8, 1.3],
    transportMode: 'sea', lastGpsDate: '2026-06-07', lastGpsTime: '05:55 UTC',
  },
  {
    id: '22', trackingNumber: 'MLCA-2026-001825', origin: 'Zurich, Switzerland', destination: 'Chicago, USA',
    status: 'High Priority', eta: '2026-06-08', client: 'Credit Suisse',
    fromCoords: [8.5, 47.4], toCoords: [-87.6, 41.9],
    transportMode: 'air', lastGpsDate: '2026-06-07', lastGpsTime: '19:00 UTC',
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
  { coords: [72.9, 19.1] as [number, number], label: 'Mumbai' },
  { coords: [121.5, 31.2] as [number, number], label: 'Shanghai' },
  { coords: [-118.2, 34.1] as [number, number], label: 'Los Angeles' },
  { coords: [8.7, 50.1] as [number, number], label: 'Frankfurt' },
  { coords: [-46.6, -23.6] as [number, number], label: 'São Paulo' },
  { coords: [-79.4, 43.7] as [number, number], label: 'Toronto' },
  { coords: [126.9, 37.6] as [number, number], label: 'Seoul' },
  { coords: [4.9, 52.4] as [number, number], label: 'Amsterdam' },
  { coords: [18.4, -33.9] as [number, number], label: 'Cape Town' },
  { coords: [116.4, 39.9] as [number, number], label: 'Beijing' },
  { coords: [-95.4, 29.8] as [number, number], label: 'Houston' },
  { coords: [-99.1, 19.4] as [number, number], label: 'Mexico City' },
  { coords: [28.0, -26.2] as [number, number], label: 'Johannesburg' },
  { coords: [3.4, 6.5] as [number, number], label: 'Lagos' },
  { coords: [-80.2, 25.8] as [number, number], label: 'Miami' },
  { coords: [-74.1, 4.7] as [number, number], label: 'Bogotá' },
  { coords: [29.0, 41.0] as [number, number], label: 'Istanbul' },
  { coords: [-87.6, 41.9] as [number, number], label: 'Chicago' },
];

const STATUS_FILTERS: StatusFilter[] = ['All', 'In Transit', 'Delivered', 'Pending Authorization', 'Delayed', 'High Priority'];

const STATUS_COLOR: Record<string, string> = {
  'In Transit': '#3b82f6',
  'Delivered': '#22c55e',
  'Pending Authorization': '#f97316',
  'Delayed': '#ef4444',
  'High Priority': '#BAAB48',
};

function getStatusColor(status: string) {
  return STATUS_COLOR[status] || '#BAAB48';
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
  accent,
  onHoverRoute,
  onLeaveRoute,
  hoveredId,
}: {
  routes: ShipmentRoute[];
  activeFilter: StatusFilter;
  isDark: boolean;
  accent: string;
  onHoverRoute: (r: ShipmentRoute, e: React.MouseEvent) => void;
  onLeaveRoute: () => void;
  hoveredId: string | null;
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
        const isHovered = hoveredId === route.id;

        return (
          <g key={route.id} opacity={routeOpacity} style={{ transition: 'opacity 0.25s ease' }}>
            {/* Route line — dashed */}
            <path
              d={d}
              stroke={accent}
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
                onMouseEnter={e => onHoverRoute(route, e)}
                onMouseLeave={onLeaveRoute}
              />
            )}

            {/* Transport icon badge ON the route */}
            {isVisible && (
              <g
                transform={`translate(${mid.x}, ${mid.y})`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={e => onHoverRoute(route, e)}
                onMouseLeave={onLeaveRoute}
              >
                {/* Hovered ring */}
                {isHovered && (
                  <circle r="22" fill="none" stroke={accent} strokeWidth="2" opacity="0.5" />
                )}
                {/* Outer pulse ring for active routes */}
                {!isDelivered && (
                  <circle r="20" fill={accent} opacity="0.08" />
                )}
                {/* Badge shadow */}
                <circle r="15" fill="rgba(0,0,0,0.35)" transform="translate(1,1.5)" />
                {/* Badge fill */}
                <circle
                  r="15"
                  fill={isHovered ? (isDark ? '#1e2a1a' : '#fffbea') : (isDark ? '#161b22' : '#ffffff')}
                  stroke={isHovered ? accent : isDelayed ? '#ef4444' : accent}
                  strokeWidth={isHovered ? 2.5 : 1.8}
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

const MIN_ZOOM = 100;
const MAX_ZOOM = 600;
const ZOOM_STEP = 50;

export function WorldMap() {
  const tc = useTC();
  const GOLD = tc.accent;
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
  const [hoveredRoute, setHoveredRoute] = useState<ShipmentRoute | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(175);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = () => setZoom(z => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  const zoomOut = () => setZoom(z => Math.max(z - ZOOM_STEP, MIN_ZOOM));

  const handleHoverRoute = (route: ShipmentRoute, e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setHoveredRoute(route);
  };

  const handleLeaveRoute = () => {
    setHoveredRoute(null);
  };

  // Map colors — closer to real logistics platform (dark tile style)
  const oceanBg = tc.isDark ? '#0b1320' : '#0d1a2e';
  const landFill = tc.isDark ? '#1c2333' : '#1c2b40';
  const landHover = tc.isDark ? '#232d40' : '#243550';
  const landStroke = tc.isDark ? '#283548' : '#2a3d58';

  const containerWidth = containerRef.current?.offsetWidth ?? 400;
  const containerHeight = containerRef.current?.offsetHeight ?? 520;

  const cardWidth = 252;
  const cardHeight = 200;
  const cardLeft = Math.min(hoverPos.x + 18, containerWidth - cardWidth - 8);
  const cardTop = Math.max(Math.min(hoverPos.y - cardHeight / 2, containerHeight - cardHeight - 8), 8);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden border ${tc.border}`}
      style={{ height: '520px', background: oceanBg }}
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
                  : 'rgba(13,26,46,0.88)',
                border: `1px solid ${isActive ? GOLD : '#2a3d58'}`,
                color: isActive ? GOLD : '#6a8aaa',
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
          background: 'rgba(13,26,46,0.9)',
          border: '1px solid #2a3d58',
          backdropFilter: 'blur(10px)',
          fontSize: '10px',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span style={{ color: '#6a8aaa' }}>Live Tracking</span>
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
          accent={GOLD}
          onHoverRoute={handleHoverRoute}
          onLeaveRoute={handleLeaveRoute}
          hoveredId={hoveredRoute?.id ?? null}
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
          background: 'rgba(13,26,46,0.9)',
          border: '1px solid #2a3d58',
          backdropFilter: 'blur(10px)',
          fontSize: '10px',
        }}
      >
        {(['air', 'sea'] as TransportMode[]).map(mode => (
          <div key={mode} className="flex items-center gap-1.5">
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{ width: '20px', height: '20px', background: '#161b22', border: `1px solid ${GOLD}` }}
            >
              <TransportIcon mode={mode} size={11} color={tc.isDark ? '#d0c070' : '#8a7a20'} />
            </div>
            <span style={{ color: '#6a8aaa' }}>
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
          <span style={{ color: '#6a8aaa' }}>Route</span>
        </div>
      </div>

      {/* Zoom controls */}
      <div
        className="absolute right-3 z-20 flex flex-col rounded-lg overflow-hidden"
        style={{
          bottom: '48px',
          background: 'rgba(13,26,46,0.9)',
          border: '1px solid #2a3d58',
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
          background: 'rgba(13,26,46,0.9)',
          border: '1px solid #2a3d58',
          backdropFilter: 'blur(10px)',
          fontSize: '10px',
          color: '#6a8aaa',
        }}
      >
        <span style={{ color: GOLD, fontWeight: 600 }}>{routes.filter(r => activeFilter === 'All' || r.status === activeFilter).length}</span>
        {' '}active route{routes.filter(r => activeFilter === 'All' || r.status === activeFilter).length !== 1 ? 's' : ''}
      </div>

      {/* Hover tooltip card — read-only */}
      {hoveredRoute && (
        <div
          className="absolute z-30 rounded-xl shadow-2xl overflow-hidden pointer-events-none"
          style={{
            left: cardLeft,
            top: cardTop,
            width: `${cardWidth}px`,
            background: tc.isDark ? '#0d1525' : '#ffffff',
            border: `1.5px solid ${tc.isDark ? '#283548' : '#d8e2ec'}`,
            borderTop: `2px solid ${GOLD}`,
          }}
        >
          {/* Header */}
          <div
            className="px-3 py-2.5 flex items-center gap-2.5"
            style={{
              background: tc.isDark ? 'rgba(186,171,72,0.07)' : 'rgba(186,171,72,0.06)',
              borderBottom: `1px solid ${tc.isDark ? '#1a2535' : '#eef2f6'}`,
            }}
          >
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ width: '30px', height: '30px', background: tc.isDark ? '#161b22' : '#f5f2e0', border: `1px solid ${GOLD}` }}
            >
              <TransportIcon mode={hoveredRoute.transportMode} size={15} color={tc.isDark ? '#d0c070' : '#8a7a20'} />
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ color: GOLD, fontWeight: 700, fontSize: '10.5px', letterSpacing: '0.04em', fontFamily: 'monospace' }}>
                {hoveredRoute.trackingNumber}
              </div>
              <div style={{ color: tc.isDark ? '#6a8090' : '#6a7a88', fontSize: '9.5px', marginTop: '1px' }}>
                {hoveredRoute.client}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-3 py-2.5" style={{ fontSize: '11px' }}>

            {/* Status badge */}
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: tc.isDark ? '#4a6070' : '#6a7a88' }}>Status</span>
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  background: `${getStatusColor(hoveredRoute.status)}18`,
                  border: `1px solid ${getStatusColor(hoveredRoute.status)}40`,
                  color: getStatusColor(hoveredRoute.status),
                  fontSize: '9px',
                  fontWeight: 600,
                }}
              >
                {hoveredRoute.status}
              </span>
            </div>

            {/* GPS Date */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1" style={{ color: tc.isDark ? '#4a6070' : '#6a7a88' }}>
                <Clock size={9} /> Last GPS Date
              </span>
              <span style={{ color: tc.isDark ? '#c0cdd8' : '#1a2a38', fontWeight: 500 }}>
                {hoveredRoute.lastGpsDate}
              </span>
            </div>

            {/* GPS Time */}
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: tc.isDark ? '#4a6070' : '#6a7a88', paddingLeft: '13px' }}>Time</span>
              <span style={{ color: tc.isDark ? '#c0cdd8' : '#1a2a38', fontWeight: 500 }}>
                {hoveredRoute.lastGpsTime}
              </span>
            </div>

            <div style={{ height: '1px', background: tc.isDark ? '#1a2535' : '#eef2f6', marginBottom: '8px' }} />

            {/* Origin → Destination */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="flex items-center gap-1 flex-shrink-0" style={{ color: tc.isDark ? '#4a6070' : '#6a7a88' }}>
                <MapPin size={9} /> Origin
              </span>
              <span style={{ color: tc.isDark ? '#c0cdd8' : '#1a2a38', fontWeight: 500, textAlign: 'right' }}>
                {hoveredRoute.origin}
              </span>
            </div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="flex items-center gap-1 flex-shrink-0" style={{ color: tc.isDark ? '#4a6070' : '#6a7a88' }}>
                <Navigation size={9} /> Destination
              </span>
              <span style={{ color: tc.isDark ? '#c0cdd8' : '#1a2a38', fontWeight: 500, textAlign: 'right' }}>
                {hoveredRoute.destination}
              </span>
            </div>

            {/* Transport mode badge */}
            <div className="flex items-center justify-between">
              <span style={{ color: tc.isDark ? '#4a6070' : '#6a7a88' }}>Mode</span>
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  background: tc.isDark ? '#161b22' : '#f5f2e0',
                  border: `1px solid ${GOLD}40`,
                  color: tc.isDark ? '#d0c070' : '#8a7a20',
                  fontSize: '9px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                <TransportIcon mode={hoveredRoute.transportMode} size={9} color={tc.isDark ? '#d0c070' : '#8a7a20'} />
                {hoveredRoute.transportMode === 'air' ? 'Air' : hoveredRoute.transportMode === 'sea' ? 'Sea' : 'Road'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
