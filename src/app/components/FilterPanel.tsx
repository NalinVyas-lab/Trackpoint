import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, Search, X, ChevronDown } from 'lucide-react';

const GOLD = '#BAAB48';
// App's reference "today" for date preset logic
const TODAY = new Date('2026-06-24');

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FilterState {
  companies: string[];
  statuses: string[];
  datePreset: 'this-month' | 'last-30' | 'custom' | null;
  dateFrom: string;
  dateTo: string;
  paymentStatuses: string[];
}

export const EMPTY_FILTERS: FilterState = {
  companies: [],
  statuses: [],
  datePreset: null,
  dateFrom: '',
  dateTo: '',
  paymentStatuses: [],
};

export function countActiveFilters(f: FilterState): number {
  return (
    f.companies.length +
    f.statuses.length +
    (f.datePreset ? 1 : 0) +
    f.paymentStatuses.length
  );
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function isDateInRange(
  dateStr: string,
  preset: FilterState['datePreset'],
  from: string,
  to: string,
): boolean {
  if (!preset) return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;

  if (preset === 'this-month') {
    return d.getFullYear() === TODAY.getFullYear() && d.getMonth() === TODAY.getMonth();
  }
  if (preset === 'last-30') {
    const cutoff = new Date(TODAY);
    cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff && d <= TODAY;
  }
  if (preset === 'custom') {
    if (from && d < new Date(from)) return false;
    if (to && d > new Date(to)) return false;
    return true;
  }
  return true;
}

const PAYMENT_OPTIONS = ['Paid', 'Unpaid', 'Partially Paid', 'Overdue'];
const DATE_PRESETS = [
  { id: 'this-month' as const, label: 'This Month' },
  { id: 'last-30' as const, label: 'Last 30 Days' },
  { id: 'custom' as const, label: 'Custom Range' },
];

// ─── Active filter chips ───────────────────────────────────────────────────────
interface ChipsProps {
  applied: FilterState;
  onChange: (f: FilterState) => void;
}

export function ActiveFilterChips({ applied, onChange }: ChipsProps) {
  const remove = (patch: Partial<FilterState>) => onChange({ ...applied, ...patch });

  const chips: { label: string; onRemove: () => void }[] = [
    ...applied.companies.map(c => ({
      label: c,
      onRemove: () => remove({ companies: applied.companies.filter(x => x !== c) }),
    })),
    ...applied.statuses.map(s => ({
      label: s,
      onRemove: () => remove({ statuses: applied.statuses.filter(x => x !== s) }),
    })),
    ...(applied.datePreset
      ? [{
          label:
            applied.datePreset === 'this-month' ? 'This Month'
            : applied.datePreset === 'last-30' ? 'Last 30 Days'
            : `${applied.dateFrom || '…'} → ${applied.dateTo || '…'}`,
          onRemove: () => remove({ datePreset: null, dateFrom: '', dateTo: '' }),
        }]
      : []),
    ...applied.paymentStatuses.map(p => ({
      label: p,
      onRemove: () => remove({ paymentStatuses: applied.paymentStatuses.filter(x => x !== p) }),
    })),
  ];

  if (chips.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '6px 0' }}>
      {chips.map((chip, i) => (
        <span
          key={i}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '3px 10px 3px 10px', borderRadius: '999px',
            fontSize: '11px', fontWeight: 500,
            background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}40`,
          }}
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: GOLD, padding: 0, lineHeight: 1 }}
          >
            <X size={10} />
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── FilterPanel ──────────────────────────────────────────────────────────────
interface FilterPanelProps {
  companyOptions: string[];
  statusOptions: string[];
  applied: FilterState;
  onApply: (f: FilterState) => void;
  isDark: boolean;
}

export function FilterPanel({
  companyOptions,
  statusOptions,
  applied,
  onApply,
  isDark,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterState>(EMPTY_FILTERS);
  const [companySearch, setCompanySearch] = useState('');
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['company', 'status', 'date', 'payment'])
  );
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset draft to applied each time panel opens
  useEffect(() => { if (open) setDraft(applied); }, [open]); // eslint-disable-line

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const toggleItem = (key: 'companies' | 'statuses' | 'paymentStatuses', val: string) => {
    setDraft(d => {
      const arr = d[key] as string[];
      return { ...d, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  };

  const toggleSection = (id: string) => {
    setOpenSections(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleApply = () => { onApply(draft); setOpen(false); };
  const handleReset = () => setDraft(applied);
  const handleClearAll = () => { onApply(EMPTY_FILTERS); setDraft(EMPTY_FILTERS); setOpen(false); };

  const appliedCount = countActiveFilters(applied);
  const draftCount = countActiveFilters(draft);
  const filteredCompanies = companyOptions.filter(c =>
    c.toLowerCase().includes(companySearch.toLowerCase())
  );

  // Palette shortcuts
  const bg = isDark ? '#1c1c1c' : '#ffffff';
  const hdrBg = isDark ? '#171717' : '#f8f8f8';
  const border = isDark ? '#2a2a2a' : '#e8e8e8';
  const text = isDark ? '#e8e8e8' : '#111111';
  const sub = isDark ? '#888888' : '#666666';
  const inputBg = isDark ? '#141414' : '#f4f4f4';
  const rowHover = isDark ? '#232323' : '#f5f5f5';

  const sectionHeader = (id: string, title: string) => (
    <button
      onClick={() => toggleSection(id)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
        borderBottom: openSections.has(id) ? `1px solid ${border}` : 'none',
      }}
    >
      <span style={{ fontSize: '12px', fontWeight: 600, color: text }}>{title}</span>
      <ChevronDown size={13} style={{ color: sub, transform: openSections.has(id) ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
    </button>
  );

  const checkRow = (
    key: 'companies' | 'statuses' | 'paymentStatuses',
    value: string,
    label?: string,
  ) => (
    <label
      key={value}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '4px 6px', fontSize: '11px', color: text,
        cursor: 'pointer', borderRadius: '5px', transition: 'background 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = rowHover)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <input
        type="checkbox"
        checked={draft[key].includes(value)}
        onChange={() => toggleItem(key, value)}
        style={{ accentColor: GOLD, width: '13px', height: '13px', flexShrink: 0, cursor: 'pointer' }}
      />
      {label ?? value}
    </label>
  );

  return (
    <div ref={panelRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '7px 14px', borderRadius: '9px', fontSize: '13px',
          fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
          background: appliedCount > 0 ? `${GOLD}15` : (isDark ? '#1c1c1c' : '#ffffff'),
          border: `1px solid ${appliedCount > 0 ? `${GOLD}55` : border}`,
          color: appliedCount > 0 ? GOLD : sub,
        }}
      >
        <SlidersHorizontal size={14} />
        Filters
        {appliedCount > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: '18px', height: '18px', borderRadius: '999px',
            background: GOLD, color: '#111111', fontSize: '10px', fontWeight: 700, padding: '0 4px',
          }}>
            {appliedCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 60,
            width: '300px', borderRadius: '14px', overflow: 'hidden',
            background: bg, border: `1px solid ${border}`,
            boxShadow: isDark ? '0 16px 56px rgba(0,0,0,0.65)' : '0 8px 40px rgba(0,0,0,0.13)',
          }}
        >
          {/* Panel header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 16px', background: hdrBg, borderBottom: `1px solid ${border}`,
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: text }}>Filters</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {draftCount > 0 && (
                <button onClick={() => setDraft(EMPTY_FILTERS)} style={{ fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  Clear all
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: isDark ? '#2a2a2a' : '#eeeeee', border: 'none', cursor: 'pointer', color: sub }}>
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{ maxHeight: '370px', overflowY: 'auto' }}>

            {/* ── Company Name ── */}
            <div style={{ borderBottom: `1px solid ${border}` }}>
              {sectionHeader('company', 'Company Name')}
              {openSections.has('company') && (
                <div style={{ padding: '8px 16px 12px' }}>
                  {/* Search input */}
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <Search size={11} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: sub }} />
                    <input
                      type="text"
                      value={companySearch}
                      onChange={e => setCompanySearch(e.target.value)}
                      placeholder="Search companies…"
                      style={{
                        width: '100%', padding: '5px 8px 5px 26px', fontSize: '11px',
                        borderRadius: '7px', outline: 'none', boxSizing: 'border-box',
                        background: inputBg, border: `1px solid ${border}`, color: text,
                      }}
                    />
                  </div>
                  <div style={{ maxHeight: '130px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {filteredCompanies.length === 0
                      ? <p style={{ fontSize: '11px', color: sub, textAlign: 'center', padding: '8px 0' }}>No matches</p>
                      : filteredCompanies.map(c => checkRow('companies', c))
                    }
                  </div>
                </div>
              )}
            </div>

            {/* ── Status ── */}
            <div style={{ borderBottom: `1px solid ${border}` }}>
              {sectionHeader('status', 'Status')}
              {openSections.has('status') && (
                <div style={{ padding: '8px 16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {statusOptions.map(s => checkRow('statuses', s))}
                </div>
              )}
            </div>

            {/* ── Date / Month ── */}
            <div style={{ borderBottom: `1px solid ${border}` }}>
              {sectionHeader('date', 'Date / Month')}
              {openSections.has('date') && (
                <div style={{ padding: '8px 16px 12px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    {DATE_PRESETS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setDraft(d => ({
                          ...d,
                          datePreset: d.datePreset === p.id ? null : p.id,
                          dateFrom: d.datePreset === p.id ? '' : d.dateFrom,
                          dateTo: d.datePreset === p.id ? '' : d.dateTo,
                        }))}
                        style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '11px',
                          fontWeight: 500, cursor: 'pointer',
                          background: draft.datePreset === p.id ? GOLD : inputBg,
                          color: draft.datePreset === p.id ? '#111111' : sub,
                          border: `1px solid ${draft.datePreset === p.id ? GOLD : border}`,
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {draft.datePreset === 'custom' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {(['dateFrom', 'dateTo'] as const).map((key, i) => (
                        <div key={key}>
                          <label style={{ fontSize: '9px', color: sub, display: 'block', marginBottom: '3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {i === 0 ? 'From' : 'To'}
                          </label>
                          <input
                            type="date"
                            value={draft[key]}
                            onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                            style={{
                              width: '100%', padding: '5px 6px', fontSize: '11px', borderRadius: '6px',
                              outline: 'none', boxSizing: 'border-box',
                              background: inputBg, border: `1px solid ${border}`, color: text,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Payment Status ── */}
            <div>
              {sectionHeader('payment', 'Payment Status')}
              {openSections.has('payment') && (
                <div style={{ padding: '8px 16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {PAYMENT_OPTIONS.map(s => checkRow('paymentStatuses', s))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', gap: '8px', padding: '10px 16px',
            background: hdrBg, borderTop: `1px solid ${border}`,
          }}>
            <button
              onClick={handleReset}
              style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 500, borderRadius: '8px', cursor: 'pointer', background: isDark ? '#2a2a2a' : '#eeeeee', border: 'none', color: sub }}
            >
              Reset
            </button>
            <button
              onClick={handleClearAll}
              style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 500, borderRadius: '8px', cursor: 'pointer', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
            >
              Clear All
            </button>
            <button
              onClick={handleApply}
              style={{ flex: 2, padding: '8px', fontSize: '12px', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', background: GOLD, border: 'none', color: '#111111' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
