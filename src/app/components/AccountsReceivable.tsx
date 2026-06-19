import {
  AlertCircle, TrendingUp, TrendingDown, Shield,
  Package, AlertTriangle, Truck, DollarSign,
  CheckCircle, Zap, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Cell,
} from 'recharts';
import { useTC } from '../contexts/ThemeContext';
import { NavBar } from './NavBar';

// ─── constants ────────────────────────────────────────────────────────────────
const GOLD = '#BAAB48';


const agingData = [
  { bucket: 'Current',   amount: 4.15, fill: '#22c55e' },
  { bucket: '1-30 Days', amount: 2.14, fill: '#f59e0b' },
  { bucket: '31-60 Days',amount: 3.15, fill: '#f97316' },
  { bucket: '61-90 Days',amount: 2.88, fill: '#ef4444' },
  { bucket: '90+ Days',  amount: 0.64, fill: '#dc2626' },
];

const collectionData = [
  { month: 'Jan', collected: 8.5, recovered: 1.8 },
  { month: 'Feb', collected: 7.8, recovered: 2.1 },
  { month: 'Mar', collected: 9.2, recovered: 2.4 },
  { month: 'Apr', collected: 8.9, recovered: 2.0 },
  { month: 'May', collected: 9.6, recovered: 1.6 },
  { month: 'Jun', collected: 5.4, recovered: 0.9 },
];

// ─── KPI card definitions ─────────────────────────────────────────────────────
const kpis = [
  {
    label: 'Total Shipment Value',
    value: '$847.2M',
    sub: '+12.4% vs last quarter',
    trend: 'up',
    icon: DollarSign,
    bg: 'linear-gradient(135deg, #BAAB48 0%, #d4c55a 50%, #a89838 100%)',
    textColor: '#1a1505',
    subColor: 'rgba(26,21,5,0.65)',
    badgeBg: 'rgba(26,21,5,0.15)',
  },
  {
    label: 'On-Time Delivery',
    value: '98.7%',
    sub: '+0.3pp this month',
    trend: 'up',
    icon: CheckCircle,
    bg: 'linear-gradient(135deg, #16a34a 0%, #22c55e 60%, #4ade80 100%)',
    textColor: '#052e16',
    subColor: 'rgba(5,46,22,0.65)',
    badgeBg: 'rgba(5,46,22,0.15)',
  },
  {
    label: 'Chain of Custody',
    value: '100%',
    sub: 'Full compliance achieved',
    trend: 'up',
    icon: Shield,
    bg: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 60%, #2dd4bf 100%)',
    textColor: '#042f2e',
    subColor: 'rgba(4,47,46,0.65)',
    badgeBg: 'rgba(4,47,46,0.15)',
  },
  {
    label: 'POD Availability',
    value: '99.9%',
    sub: 'Proof of delivery on file',
    trend: 'up',
    icon: Package,
    bg: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 60%, #60a5fa 100%)',
    textColor: '#eff6ff',
    subColor: 'rgba(239,246,255,0.65)',
    badgeBg: 'rgba(239,246,255,0.15)',
  },
  {
    label: 'Lost Shipment Rate',
    value: '0.04%',
    sub: '-0.01pp vs last month',
    trend: 'down-good',
    icon: Truck,
    bg: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 60%, #a78bfa 100%)',
    textColor: '#f5f3ff',
    subColor: 'rgba(245,243,255,0.65)',
    badgeBg: 'rgba(245,243,255,0.15)',
  },
  {
    label: 'Revenue Leakage',
    value: '0.8%',
    sub: 'Within acceptable threshold',
    trend: 'neutral',
    icon: AlertTriangle,
    bg: 'linear-gradient(135deg, #c2410c 0%, #f97316 60%, #fb923c 100%)',
    textColor: '#fff7ed',
    subColor: 'rgba(255,247,237,0.65)',
    badgeBg: 'rgba(255,247,237,0.15)',
  },
  {
    label: 'Vault Utilization',
    value: '84%',
    sub: '16% capacity available',
    trend: 'up',
    icon: Activity,
    bg: 'linear-gradient(135deg, #0e7490 0%, #06b6d4 60%, #22d3ee 100%)',
    textColor: '#ecfeff',
    subColor: 'rgba(236,254,255,0.65)',
    badgeBg: 'rgba(236,254,255,0.15)',
    progress: 84,
  },
  {
    label: 'Delivery Exceptions',
    value: '1.1%',
    sub: '+0.2pp flagged this week',
    trend: 'down-bad',
    icon: Zap,
    bg: 'linear-gradient(135deg, #be123c 0%, #f43f5e 60%, #fb7185 100%)',
    textColor: '#fff1f2',
    subColor: 'rgba(255,241,242,0.65)',
    badgeBg: 'rgba(255,241,242,0.15)',
  },
];

// ─── sub-components ──────────────────────────────────────────────────────────
function TrendBadge({ trend, badgeBg, textColor }: { trend: string; badgeBg: string; textColor: string }) {
  if (trend === 'up') return (
    <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: badgeBg, color: textColor }}>
      <TrendingUp size={9} /> ↑
    </span>
  );
  if (trend === 'down-good') return (
    <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: badgeBg, color: textColor }}>
      <TrendingDown size={9} /> ↓ Good
    </span>
  );
  if (trend === 'down-bad') return (
    <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(0,0,0,0.2)', color: textColor }}>
      <AlertCircle size={9} /> ↑ Watch
    </span>
  );
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: badgeBg, color: textColor }}>
      Stable
    </span>
  );
}

function KpiCard({ kpi }: { kpi: typeof kpis[0] }) {
  const Icon = kpi.icon;
  const hasProgress = 'progress' in kpi;
  return (
    <div
      className="relative rounded-2xl p-5 flex flex-col justify-between overflow-hidden"
      style={{ background: kpi.bg, minHeight: '156px' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: kpi.subColor }}>
            {kpi.label}
          </p>
          <TrendBadge trend={kpi.trend} badgeBg={kpi.badgeBg} textColor={kpi.textColor} />
        </div>
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: '36px', height: '36px', background: kpi.badgeBg }}
        >
          <Icon size={18} color={kpi.textColor} strokeWidth={2} />
        </div>
      </div>

      {/* Hero value */}
      <div>
        <div style={{ fontSize: '32px', fontWeight: 800, color: kpi.textColor, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {kpi.value}
        </div>
        {hasProgress && (
          <div className="mt-2 mb-1 rounded-full overflow-hidden" style={{ height: '4px', background: kpi.badgeBg }}>
            <div className="h-full rounded-full" style={{ width: `${kpi.progress}%`, background: kpi.textColor, opacity: 0.7 }} />
          </div>
        )}
        <p className="text-[10px] mt-1.5" style={{ color: kpi.subColor }}>{kpi.sub}</p>
      </div>

      {/* Decorative circle */}
      <div
        className="absolute -bottom-6 -right-6 rounded-full"
        style={{ width: '80px', height: '80px', background: kpi.badgeBg }}
      />
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export function AccountsReceivable() {
  const tc = useTC();

  const chartBg  = tc.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const gridLine = tc.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const axisColor = tc.isDark ? '#4a6080' : '#8a9aaa';

  const tooltipStyle = {
    ...tc.tooltipStyle,
    padding: '8px 12px',
    fontSize: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
  };

  return (
    <div className={`min-h-screen ${tc.pageBg} ${tc.text}`}>
      <NavBar />

      {/* ── Page header ─────────────────────────────────────── */}
      <div className={`${tc.headerBg} border-b px-4 md:px-8 py-5`}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em' }} className="mb-0.5">
            Financial Dashboard
          </h1>
          <p className={`text-sm ${tc.subtext}`}>Executive overview · Last updated Jun 17, 2026</p>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-6">

        {/* ── KPI Bento Grid ──────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full" style={{ background: GOLD }} />
            <h2 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em' }} className={`uppercase ${tc.subtext}`}>
              Key Performance Indicators
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {kpis.map(kpi => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>

        {/* ── Charts ──────────────────────────────────────────── */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">

          {/* Chart 1: Aging Analysis */}
          <div
            className={`border ${tc.border} rounded-2xl overflow-hidden`}
            style={{ background: tc.isDark ? '#1c1c1c' : '#ffffff' }}
          >
            <div className="px-6 pt-6 pb-3 flex items-center justify-between">
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Aging Analysis</h3>
                <p className={`text-xs mt-0.5 ${tc.subtext}`}>Outstanding receivables by age bucket</p>
              </div>
              <div
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}30` }}
              >
                $12.96M Total
              </div>
            </div>

            <div className="px-2 pb-2" style={{ background: chartBg }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={agingData} margin={{ top: 16, right: 24, left: 0, bottom: 4 }} barSize={36}>
                  <CartesianGrid vertical={false} stroke={gridLine} strokeDasharray="0" />
                  <XAxis
                    dataKey="bucket"
                    tick={{ fontSize: 11, fill: axisColor }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={v => `$${v}M`}
                    tick={{ fontSize: 11, fill: axisColor }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: tc.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', radius: 6 }}
                    formatter={(v: number) => [`$${v.toFixed(2)}M`, 'Amount']}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {agingData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend row */}
            <div className="px-6 py-4 flex flex-wrap gap-3">
              {agingData.map(d => (
                <div key={d.bucket} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.fill }} />
                  <span style={{ fontSize: '11px' }} className={tc.subtext}>{d.bucket}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>${d.amount}M</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Collection Performance */}
          <div
            className={`border ${tc.border} rounded-2xl overflow-hidden`}
            style={{ background: tc.isDark ? '#1c1c1c' : '#ffffff' }}
          >
            <div className="px-6 pt-6 pb-3 flex items-center justify-between">
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Collection Performance</h3>
                <p className={`text-xs mt-0.5 ${tc.subtext}`}>Monthly collected + payment recovery trend</p>
              </div>
              <div
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
              >
                ↑ On track
              </div>
            </div>

            <div className="px-2 pb-2" style={{ background: chartBg }}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={collectionData} margin={{ top: 16, right: 24, left: 0, bottom: 4 }}>
                  <CartesianGrid vertical={false} stroke={gridLine} strokeDasharray="0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: axisColor }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={v => `$${v}M`}
                    tick={{ fontSize: 11, fill: axisColor }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number, name: string) => [`$${v.toFixed(1)}M`, name === 'collected' ? 'Collected' : 'Recovered']}
                  />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    stroke={GOLD}
                    strokeWidth={2.5}
                    fill={`${GOLD}28`}
                    dot={{ fill: GOLD, strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: GOLD }}
                  />
                  <Area
                    type="monotone"
                    dataKey="recovered"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="rgba(34,197,94,0.18)"
                    dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: '#22c55e' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="px-6 py-4 flex gap-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 rounded-full" style={{ background: GOLD }} />
                <span style={{ fontSize: '11px' }} className={tc.subtext}>Collected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 rounded-full bg-green-400" />
                <span style={{ fontSize: '11px' }} className={tc.subtext}>Payment Recovery</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
