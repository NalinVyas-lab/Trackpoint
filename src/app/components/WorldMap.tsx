import { useState, useRef, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
} from 'react-simple-maps';
import { useTC } from '../contexts/ThemeContext';

type StatusFilter = 'All' | 'In Transit' | 'Delivered' | 'Pending Authorization' | 'Delayed' | 'High Priority';

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
}

const GOLD = '#BAAB48';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const routes: ShipmentRoute[] = [
  {
    id: '1', trackingNumber: 'MLCA-2026-001847', origin: 'London, UK', destination: 'New York, USA',
    status: 'In Transit', eta: '2026-06-08', client: 'Tiffany & Co.',
    fromCoords: [-0.1, 51.5], toCoords: [-74.0, 40.7],
  },
  {
    id: '2', trackingNumber: 'MLCA-2026-001846', origin: 'Dubai, UAE', destination: 'Hong Kong',
    status: 'Pending Authorization', eta: '2026-06-10', client: 'Cartier International',
    fromCoords: [55.3, 25.2], toCoords: [114.2, 22.3],
  },
  {
    id: '3', trackingNumber: 'MLCA-2026-001845', origin: 'Zurich, Switzerland', destination: 'Singapore',
    status: 'High Priority', eta: '2026-06-06', client: 'UBS AG',
    fromCoords: [8.5, 47.4], toCoords: [103.8, 1.3],
  },
  {
    id: '4', trackingNumber: 'MLCA-2026-001844', origin: 'Paris, France', destination: 'Tokyo, Japan',
    status: 'Delivered', eta: '2026-06-03', client: 'Van Cleef & Arpels',
    fromCoords: [2.3, 48.9], toCoords: [139.7, 35.7],
  },
  {
    id: '5', trackingNumber: 'MLCA-2026-001843', origin: 'New York, USA', destination: 'Sydney, Australia',
    status: 'Delayed', eta: '2026-06-12', client: 'Royal Bank of Canada',
    fromCoords: [-74.0, 40.7], toCoords: [151.2, -33.9],
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
const STATUS_CHIP_LABEL: Record<StatusFilter, string> = {
  'All': 'All Routes',
  'In Transit': 'In Transit',
  'Delivered': 'Delivered',
  'Pending Authorization': 'Pending Auth',
  'Delayed': 'Delayed',
  'High Priority': 'High Priority',
};

// Great-circle midpoint with arc lift for a curved route
function getArcPath(
  from: [number, number],
  to: [number, number],
  project: (coords: [number, number]) => [number, number],
  liftFactor = 0.28
): string {
  const [x1, y1] = project(from);
  const [x2, y2] = project(to);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  // Perpendicular lift — pushes arc above the chord
  const cpx = mx - dy * liftFactor;
  const cpy = my + dx * liftFactor - len * liftFactor * 0.6;
  return `M ${x1},${y1} Q ${cpx},${cpy} ${x2},${y2}`;
}

// Animated dot component along a path
function AnimatedDot({ d, duration }: { d: string; duration: string }) {
  return (
    <circle r="4" fill={GOLD} opacity="0.95" filter="url(#routeGlow)">
      <animateMotion dur={duration} repeatCount="indefinite" path={d} />
    </circle>
  );
}

export function WorldMap() {
  const tc = useTC();
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
  const [hovered, setHovered] = useState<ShipmentRoute | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const projRef = useRef<((coords: [number, number]) => [number, number]) | null>(null);

  const updateTooltipPos = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const filteredRoutes = activeFilter === 'All' ? routes : routes.filter(r => r.status === activeFilter);

  const landFill = tc.isDark ? '#1c2128' : '#c5ccd5';
  const landHover = tc.isDark ? '#252d36' : '#d2d8df';
  const landStroke = tc.isDark ? '#252d36' : '#b0bac6';
  const oceanBg = tc.isDark ? '#050b14' : '#b4cce8';

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden border ${tc.border}`}
      style={{ height: '460px', background: oceanBg }}
      onMouseLeave={() => setHovered(null)}
      onMouseMove={updateTooltipPos}
    >
      {/* Globe perspective tilt wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: '-5% -2%',
          transform: 'perspective(700px) rotateX(20deg)',
          transformOrigin: '50% 66%',
        }}
      >
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 153, center: [10, 8] }}
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="cityGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="edgeFade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="70%" stopColor="transparent" />
              <stop offset="100%" stopColor={oceanBg} stopOpacity="0.85" />
            </radialGradient>
          </defs>

          {/* Country fills */}
          <Geographies geography={GEO_URL}>
            {({ geographies, projection }) => {
              // Cache the projection function for route arc calculations
              if (projection && !projRef.current) {
                projRef.current = (coords: [number, number]) => {
                  const pt = projection(coords);
                  return pt ? [pt[0], pt[1]] : [0, 0];
                };
              }

              return geographies.map(geo => (
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
              ));
            }}
          </Geographies>

          {/* Routes — rendered inside ComposableMap SVG */}
          <Geographies geography={GEO_URL}>
            {({ projection }) => {
              if (!projection) return null;
              const proj = (coords: [number, number]): [number, number] => {
                const pt = projection(coords);
                return pt ? [pt[0], pt[1]] : [0, 0];
              };

              return (
                <>
                  {routes.map(route => {
                    const isVisible = activeFilter === 'All' || route.status === activeFilter;
                    const isDelivered = route.status === 'Delivered';
                    const isPending = route.status === 'Pending Authorization';
                    const d = getArcPath(route.fromCoords, route.toCoords, proj);

                    return (
                      <g key={route.id} opacity={isVisible ? 1 : 0.05} style={{ transition: 'opacity 0.3s' }}>
                        {/* Glow halo */}
                        <path d={d} stroke={GOLD} strokeWidth="10" fill="none" strokeOpacity="0.1" />
                        {/* Route line */}
                        <path
                          d={d}
                          stroke={GOLD}
                          strokeWidth="1.8"
                          fill="none"
                          strokeDasharray={isPending ? '7 5' : isDelivered ? '4 4' : 'none'}
                          strokeOpacity={isDelivered ? 0.45 : 0.88}
                          filter={isVisible ? 'url(#routeGlow)' : undefined}
                        />
                        {/* Moving dot */}
                        {!isDelivered && isVisible && (
                          <AnimatedDot d={d} duration={isPending ? '8s' : '5s'} />
                        )}
                        {/* Hit area */}
                        {isVisible && (
                          <path
                            d={d}
                            stroke="transparent"
                            strokeWidth="20"
                            fill="none"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={e => { updateTooltipPos(e); setHovered(route); }}
                          />
                        )}
                      </g>
                    );
                  })}
                </>
              );
            }}
          </Geographies>

          {/* City markers */}
          {cities.map(city => (
            <Marker key={city.label} coordinates={city.coords}>
              <g filter="url(#cityGlow)">
                <circle r="7" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.3" />
                <circle r="3.2" fill={GOLD} opacity="0.92" />
                <circle r="1.3" fill="#fff" opacity="0.9" />
              </g>
            </Marker>
          ))}

          {/* City labels for major hubs */}
          {cities.map(city => (
            <Annotation
              key={`label-${city.label}`}
              subject={city.coords}
              dx={city.coords[0] < 0 ? -8 : 8}
              dy={-8}
              connectorProps={{ stroke: 'none' }}
            >
              <text
                textAnchor={city.coords[0] < 0 ? 'end' : 'start'}
                style={{ fontSize: '7px', fill: tc.isDark ? 'rgba(186,171,72,0.7)' : 'rgba(140,128,35,0.85)', fontFamily: 'sans-serif' }}
              >
                {city.label}
              </text>
            </Annotation>
          ))}
        </ComposableMap>
      </div>

      {/* Edge sphere vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 94% 88% at 50% 56%, transparent 58%, ${oceanBg} 100%)`,
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
      {/* Top atmospheric fade */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '72px',
          background: `linear-gradient(to bottom, ${oceanBg} 0%, transparent 100%)`,
          pointerEvents: 'none', zIndex: 5,
        }}
      />
      {/* Bottom fade */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '52px',
          background: `linear-gradient(to top, ${oceanBg} 0%, transparent 100%)`,
          pointerEvents: 'none', zIndex: 5,
        }}
      />

      {/* ── UI overlays ── */}

      {/* Status filter chips */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map(f => {
          const count = f === 'All' ? routes.length : routes.filter(r => r.status === f).length;
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="rounded-full border transition-all"
              style={{
                padding: '3px 10px',
                fontSize: '10px',
                fontWeight: isActive ? 600 : 400,
                backdropFilter: 'blur(8px)',
                background: isActive
                  ? 'rgba(186,171,72,0.2)'
                  : tc.isDark ? 'rgba(5,11,20,0.85)' : 'rgba(255,255,255,0.86)',
                borderColor: isActive ? GOLD : tc.isDark ? '#2a3340' : '#c8d2dc',
                color: isActive ? GOLD : tc.isDark ? '#6a7d8f' : '#546070',
              }}
            >
              {STATUS_CHIP_LABEL[f]}
              {f !== 'All' && <span style={{ marginLeft: '4px', opacity: 0.65 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Live badge */}
      <div
        className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 border z-20"
        style={{
          background: tc.isDark ? 'rgba(5,11,20,0.9)' : 'rgba(255,255,255,0.9)',
          borderColor: tc.isDark ? '#2a3340' : '#dce2e8',
          fontSize: '10px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span style={{ color: tc.isDark ? '#6a7d8f' : '#546070' }}>Live Tracking</span>
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="absolute pointer-events-none z-30 rounded-lg shadow-2xl p-3"
          style={{
            left: Math.min(tooltipPos.x + 14, (containerRef.current?.offsetWidth ?? 400) - 230),
            top: Math.max(tooltipPos.y - 95, 44),
            width: '220px',
            background: tc.isDark ? '#0d1520' : '#ffffff',
            border: `1.5px solid ${GOLD}`,
            fontSize: '12px',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: GOLD }} />
            <span style={{ fontWeight: 600, color: tc.isDark ? '#e5e5e5' : '#1a1a1a' }}>{hovered.status}</span>
          </div>
          <div style={{ color: tc.isDark ? '#8a9aaa' : '#555', lineHeight: 1.65 }}>
            <div style={{ color: GOLD, fontWeight: 600 }}>{hovered.trackingNumber}</div>
            <div>{hovered.client}</div>
            <div>{hovered.origin} → {hovered.destination}</div>
            <div>ETA: {hovered.eta}</div>
          </div>
        </div>
      )}

      {/* Active filter panel */}
      {activeFilter !== 'All' && filteredRoutes.length > 0 && (
        <div
          className="absolute bottom-3 right-3 z-20 rounded-lg border overflow-hidden"
          style={{
            background: tc.isDark ? 'rgba(5,11,20,0.95)' : 'rgba(255,255,255,0.95)',
            borderColor: GOLD,
            backdropFilter: 'blur(10px)',
            width: '212px',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          <div
            className="px-3 py-2 flex items-center gap-2"
            style={{ borderBottom: `1px solid ${tc.isDark ? '#1a2535' : '#f0e8c0'}` }}
          >
            <span style={{ color: GOLD, fontWeight: 700, fontSize: '11px' }}>{STATUS_CHIP_LABEL[activeFilter]}</span>
            <span
              className="ml-auto rounded-full px-1.5"
              style={{ background: 'rgba(186,171,72,0.18)', color: GOLD, fontSize: '10px', fontWeight: 600 }}
            >
              {filteredRoutes.length}
            </span>
          </div>
          {filteredRoutes.map((r, i) => (
            <div
              key={r.id}
              className="px-3 py-2"
              style={{
                borderTop: i > 0 ? `1px solid ${tc.isDark ? '#121e2c' : '#f0f0f0'}` : undefined,
                fontSize: '11px',
              }}
            >
              <div style={{ color: tc.isDark ? '#e0e0e0' : '#1a1a1a', fontWeight: 600 }}>{r.client}</div>
              <div style={{ color: tc.isDark ? '#5a7080' : '#666', marginTop: '1px' }}>{r.origin} → {r.destination}</div>
              <div style={{ color: GOLD, fontSize: '10px', marginTop: '2px', opacity: 0.9 }}>{r.trackingNumber}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
